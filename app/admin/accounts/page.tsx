'use client'

import { useState, useEffect } from 'react'

interface Account {
  id: string
  email: string | null
  role: string | null
  created_at: string
  last_sign_in_at: string | null
}

const DEFAULT_PASSWORD = '123123'

const ROLE_BADGE: Record<string, { text: string; bg: string; label: string }> = {
  manager: { text: '#b45309', bg: '#fef3c7', label: 'Manager' },
  admin: { text: '#1d4ed8', bg: '#dbeafe', label: 'Admin' },
}

export default function ManagerAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'manager' | 'admin'>('manager')
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState('')
  const [delConfirm, setDelConfirm] = useState<Account | null>(null)

  useEffect(() => { load() }, [])

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/manager-accounts')
      const data = await res.json()
      if (Array.isArray(data)) setAccounts(data)
      else flash('Error: ' + (data.error || 'could not load'))
    } catch (e: any) { flash('Error: ' + e.message) }
    setLoading(false)
  }

  async function createAccount() {
    if (!email.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/manager-accounts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      })
      const data = await res.json()
      if (data.success) {
        flash(`Created ${data.email} · password: ${data.password}`)
        setEmail('')
        load()
      } else flash('Error: ' + (data.error || 'failed'))
    } catch (e: any) { flash('Error: ' + e.message) }
    setCreating(false)
  }

  async function resetPassword(a: Account) {
    const res = await fetch('/api/admin/manager-accounts', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, action: 'reset' }),
    })
    const data = await res.json()
    flash(data.success ? `${a.email} password reset to ${DEFAULT_PASSWORD}` : 'Error: ' + data.error)
  }

  async function changeRole(a: Account, newRole: string) {
    const res = await fetch('/api/admin/manager-accounts', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, action: 'role', role: newRole }),
    })
    const data = await res.json()
    if (data.success) { setAccounts(prev => prev.map(x => x.id === a.id ? { ...x, role: newRole } : x)); flash(`${a.email} is now ${newRole}`) }
    else flash('Error: ' + data.error)
  }

  async function confirmDelete() {
    if (!delConfirm) return
    const res = await fetch('/api/admin/manager-accounts', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: delConfirm.id }),
    })
    const data = await res.json()
    if (data.success) { setAccounts(prev => prev.filter(x => x.id !== delConfirm.id)); flash('Account deleted') }
    else flash('Error: ' + data.error)
    setDelConfirm(null)
  }

  const card: React.CSSProperties = { background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
  const inputStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--admin-border)', fontSize: 14, outline: 'none', background: 'var(--admin-card)', color: 'var(--admin-text)', fontFamily: 'inherit' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)' }}>Login Accounts</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>Create and manage manager / admin sign-in accounts. New accounts get password <strong>{DEFAULT_PASSWORD}</strong>.</p>
      </div>

      {/* Create */}
      <div style={{ ...card, padding: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Create New Account</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@appetie.com"
            onKeyDown={e => e.key === 'Enter' && createAccount()}
            style={{ ...inputStyle, flex: 1, minWidth: 220 }} />
          <select value={role} onChange={e => setRole(e.target.value as 'manager' | 'admin')} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="manager">Manager (manager portal)</option>
            <option value="admin">Admin (both portals)</option>
          </select>
          <button onClick={createAccount} disabled={!email.trim() || creating}
            style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: email.trim() ? '#16a34a' : '#cbd5e1', color: 'white', fontSize: 13, fontWeight: 700, cursor: email.trim() ? 'pointer' : 'not-allowed' }}>
            {creating ? 'Creating…' : 'Create Account'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>Password is set to <strong>{DEFAULT_PASSWORD}</strong> automatically. The user can change it after first login.</p>
      </div>

      {/* List */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--admin-thead)', borderBottom: '1.5px solid var(--admin-border2)' }}>
                {['Email', 'Role', 'Created', 'Last Sign-in', 'Actions'].map((h, i) => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: i === 4 ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((a, idx) => {
                const badge = a.role ? ROLE_BADGE[a.role] : null
                return (
                  <tr key={a.id} style={{ borderBottom: idx < accounts.length - 1 ? '1px solid var(--admin-border2)' : 'none' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--admin-text)' }}>{a.email}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <select value={a.role ?? ''} onChange={e => changeRole(a, e.target.value)}
                        style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--admin-border)', background: badge?.bg ?? 'var(--admin-subcard)', color: badge?.text ?? '#64748b', fontWeight: 700, cursor: 'pointer' }}>
                        <option value="">— none (admin) —</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>{a.created_at?.slice(0, 10)}</td>
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>{a.last_sign_in_at ? a.last_sign_in_at.slice(0, 10) : 'never'}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button onClick={() => resetPassword(a)} title="Reset password to default"
                        style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 6 }}>
                        Reset PW
                      </button>
                      <button onClick={() => setDelConfirm(a)} title="Delete account"
                        style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!loading && accounts.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No accounts.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8' }}>
        <strong>Manager</strong> accounts can sign into the manager portal only. <strong>Admin</strong> accounts can use both the admin and manager portals. Accounts with no role keep admin-panel access.
      </p>

      {delConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 20, padding: '28px 26px', maxWidth: 360, width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>Delete account?</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}><strong>{delConfirm.email}</strong> will no longer be able to sign in.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDelConfirm(null)} style={{ flex: 1, padding: 11, borderRadius: 12, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: 11, borderRadius: 12, border: 'none', background: '#ef4444', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: toast.startsWith('Error') ? '#dc2626' : '#0f172a', color: 'white', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 300, boxShadow: '0 10px 30px rgba(0,0,0,0.25)', maxWidth: '90vw' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
