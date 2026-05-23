// logged in auto sends jwt
// edits sent as json
// stale sessions kick u out

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

const TOKEN_KEY = 'smartpump_token';

function mockBrowser({ token } = {}) {
  const storage = new Map();
  const localStorage = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
  };
  if (token) localStorage.setItem(TOKEN_KEY, token);
  let assignUrl;
  globalThis.localStorage = localStorage;
  globalThis.window = {
    location: {
      assign: (url) => {
        assignUrl = url;
      },
    },
  };
  return { storage, getAssignUrl: () => assignUrl };
}

describe('apiFetch.js', () => {
  /** @type {typeof import('../lib/apiFetch.js').apiFetch} */
  let apiFetch;

  beforeEach(async () => {
    const mod = await import('../lib/apiFetch.js');
    apiFetch = mod.apiFetch;
  });

  afterEach(() => {
    delete globalThis.window;
    delete globalThis.localStorage;
    delete globalThis.fetch;
  });

  it('GET includes Bearer when token is set', async () => {
    mockBrowser({ token: 'tok-1' });
    let captured;
    globalThis.fetch = async (url, opts) => {
      captured = { url, opts };
      return { status: 200 };
    };

    const res = await apiFetch('/me');
    assert.equal(res.status, 200);
    assert.equal(captured.url, '/api/me');
    assert.equal(captured.opts.headers.Authorization, 'Bearer tok-1');
    assert.equal(captured.opts.method, 'GET');
  });

  it('PATCH sends JSON body and Content-Type', async () => {
    mockBrowser({ token: 'tok-2' });
    let captured;
    globalThis.fetch = async (url, opts) => {
      captured = { url, opts };
      return { status: 200 };
    };

    await apiFetch('/me', { method: 'PATCH', body: { phone: '+1 555' } });
    assert.equal(captured.opts.method, 'PATCH');
    assert.equal(captured.opts.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(captured.opts.body), { phone: '+1 555' });
  });

  it('401 clears token, navigates to /login, and does not resolve', async () => {
    const { storage, getAssignUrl } = mockBrowser({ token: 'stale' });
    let fetchDone;
    const fetchCompleted = new Promise((r) => {
      fetchDone = r;
    });
    globalThis.fetch = async () => {
      fetchDone();
      return { status: 401 };
    };

    const pending = apiFetch('/me');
    await fetchCompleted;
    assert.equal(storage.has(TOKEN_KEY), false);
    assert.equal(getAssignUrl(), '/login');

    const raced = await Promise.race([pending, Promise.resolve('still-pending')]);
    assert.equal(raced, 'still-pending');
  });
});
