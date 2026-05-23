import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

const TOKEN_KEY = 'smartpump_token';

function mockBrowserStorage() {
  const storage = new Map();
  const localStorage = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
  };
  globalThis.localStorage = localStorage;
  globalThis.window = {};
  return storage;
}

describe('auth.js', () => {
  afterEach(() => {
    delete globalThis.window;
    delete globalThis.localStorage;
  });

  it('getToken returns null when window is undefined (SSR)', async () => {
    const { getToken, setToken } = await import('../lib/auth.js');
    assert.equal(getToken(), null);
    setToken('noop');
    assert.equal(getToken(), null);
  });

  it('setToken, getToken, clearToken use smartpump_token', async () => {
    const storage = mockBrowserStorage();
    const { getToken, setToken, clearToken } = await import('../lib/auth.js');

    setToken('jwt-abc');
    assert.equal(storage.get(TOKEN_KEY), 'jwt-abc');
    assert.equal(getToken(), 'jwt-abc');
    clearToken();
    assert.equal(getToken(), null);
  });
});
