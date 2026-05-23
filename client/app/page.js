// note: css built with my guidance using gemini (just fyI)
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearToken, getToken } from '@/lib/auth.js';
import { apiFetch } from '@/lib/apiFetch.js';

const PATCH_FIELDS = ['name', 'phone', 'address', 'age', 'company', 'eyeColor'];

function displayName(name) {
  if (!name) return '—'; // assuming name can be empty on db
  if (typeof name === 'string') return name;
  return [name.first, name.last].filter(Boolean).join(' ');
}

function initEditState(user) {
  return {
    nameFirst: user?.name?.first ?? '',
    nameLast: user?.name?.last ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    age: user?.age ?? '',
    company: user?.company ?? '',
    eyeColor: user?.eyeColor ?? '',
  };
}

function validateEditForm(form) {
  const nameFirst = form.nameFirst.trim();
  const nameLast = form.nameLast.trim();
  const phone = form.phone.trim();
  const address = form.address.trim();
  const company = form.company.trim();
  const eyeColor = form.eyeColor.trim();
  const ageRaw = String(form.age).trim();

  if (!nameFirst || !nameLast || !phone || !address || !company || !eyeColor || !ageRaw) {
    return { ok: false, message: 'All fields are required.' };
  }

  const age = Number(ageRaw);
  if (!Number.isInteger(age) || age < 1) {
    return { ok: false, message: 'Age must be a positive whole number.' };
  }

  return {
    ok: true,
    values: { nameFirst, nameLast, phone, address, company, eyeColor, age },
  };
}

// components

function Avatar({ name }) {
  const initials = name
    ? `${name.first?.[0] ?? ''}${name.last?.[0] ?? ''}`.toUpperCase()
    : '?';
  return (
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-500/30 text-3xl font-bold text-white select-none">
      {initials}
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-white/5 border border-white/10 rounded-xl px-5 py-3 min-w-[110px]">
      <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-base font-semibold text-white">{value}</span>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-blue-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-slate-200 mt-0.5 break-words">{value || '—'}</p>
      </div>
    </div>
  );
}

// icons

const Icons = {
  mail: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  phone: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  map: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  building: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  sparkle: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  user: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
};

// editing fomr

function EditField({ label, id, type = 'text', value, onChange, testId }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
    </div>
  );
}

// actual page (home)

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // loading | ready | error
  const [status, setStatus] = useState('loading');

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }

    apiFetch('/me')
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [router]);

  function startEdit() {
    setForm(initEditState(user));
    setSaveError('');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setSaveError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');

    const check = validateEditForm(form);
    if (!check.ok) {
      setSaveError(check.message);
      return;
    }

    const { nameFirst, nameLast, phone, address, company, eyeColor, age } = check.values;
    setSaving(true);

    const patch = {
      name: { first: nameFirst, last: nameLast },
      phone,
      address,
      age,
      company,
      eyeColor,
    };

    // only update what changed
    const body = {};
    for (const key of PATCH_FIELDS) {
      if (key === 'name') {
        if (
          nameFirst !== (user.name?.first ?? '') ||
          nameLast !== (user.name?.last ?? '')
        ) {
          body.name = patch.name;
        }
      } else if (patch[key] !== user[key]) {
        body[key] = patch[key];
      }
    }

    if (Object.keys(body).length === 0) {
      setEditing(false);
      setSaving(false);
      return;
    }

    try {
      const res = await apiFetch('/me', { method: 'PATCH', body });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        setEditing(false);
      } else {
        setSaveError('Save failed. Check your input.');
      }
    } catch {
      setSaveError('Network error. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // logout from client (no server logout)
    } finally {
      clearToken();
      router.replace('/login');
    }
  }

  // states

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading…
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Could not load your profile.</p>
          <button
            onClick={() => { clearToken(); router.replace('/login'); }}
            className="text-sm text-blue-400 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pb-12">

      {/* header */}

      <header className="flex items-center justify-between px-5 py-4 border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-slate-900/70">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Smart Pump"
            width={120}
            height={36}
            className="h-8 w-auto object-contain"
          />
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-slate-400 hover:text-red-400 transition px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          Logout
        </button>
      </header>

      <div className="max-w-md mx-auto px-4 pt-8">

        {/* Profile card */}

        <div className="flex flex-col items-center gap-4 mb-8">
          <Avatar name={user.name} />
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">{displayName(user.name)}</h2>
            {!editing && (
              <p className="text-slate-400 text-sm">{user.email}</p>
            )}
          </div>

          {/* BALANCE + EDIT pills */}

          <div className="flex gap-3 mt-1">
            <StatBadge label="Balance" value={user.balance ?? '—'} />
            <button
              type="button"
              data-testid="edit-profile"
              onClick={startEdit}
              className="flex flex-col items-center justify-center gap-0.5 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 rounded-xl px-5 py-3 min-w-[110px] transition"
            >
              <span className="text-xs text-blue-400 uppercase tracking-wider">Edit</span>
              <span className="text-base font-semibold text-blue-300">Profile</span>
            </button>
          </div>
        </div>

        {/* Info rows */}

        {!editing && (
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-2 shadow-xl">
            <InfoRow icon={Icons.mail} label="Email" value={user.email} />
            <InfoRow icon={Icons.phone} label="Phone" value={user.phone} />
            <InfoRow icon={Icons.map} label="Address" value={user.address} />
            <InfoRow icon={Icons.building} label="Company" value={user.company} />
            <InfoRow icon={Icons.user} label="Age" value={user.age} />
            <InfoRow icon={Icons.sparkle} label="Eye Color" value={user.eyeColor} />
          </div>
        )}

        {/* Edit panel */}

        {editing && (
          <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Edit Profile</h3>

            {saveError && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {saveError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <EditField
                label="First Name"
                id="nameFirst"
                value={form.nameFirst}
                onChange={(v) => setForm((f) => ({ ...f, nameFirst: v }))}
              />
              <EditField
                label="Last Name"
                id="nameLast"
                value={form.nameLast}
                onChange={(v) => setForm((f) => ({ ...f, nameLast: v }))}
              />
            </div>
            <EditField
              label="Phone"
              id="phone"
              testId="edit-phone"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            />
            <EditField
              label="Address"
              id="address"
              value={form.address}
              onChange={(v) => setForm((f) => ({ ...f, address: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <EditField
                label="Company"
                id="company"
                value={form.company}
                onChange={(v) => setForm((f) => ({ ...f, company: v }))}
              />
              <EditField
                label="Age"
                id="age"
                type="number"
                value={form.age}
                onChange={(v) => setForm((f) => ({ ...f, age: v }))}
              />
            </div>
            <EditField
              label="Eye Color"
              id="eyeColor"
              value={form.eyeColor}
              onChange={(v) => setForm((f) => ({ ...f, eyeColor: v }))}
            />

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                data-testid="save-profile"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-semibold transition disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
