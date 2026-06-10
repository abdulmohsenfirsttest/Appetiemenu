'use client'

import { useState, useEffect, useCallback } from 'react'

type Credential = { employee_id: number; username: string; created_at: string }

export default function CredentialsPage() {
  const [creds, setCreds] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ employee_id: '', username: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/supervisor-credentials')
      if (res.ok) setCreds(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function flash(type: 'ok' | 'err', text: string) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3500)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.employee_id || !form.username || !form.password) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/supervisor-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: parseInt(form.employee_id),
          username: form.username,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) { flash('err', data.error || 'Failed to save'); return }
      flash('ok', 'Supervisor saved successfully')
      setForm({ employee_id: '', username: '', password: '' })
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this supervisor credential? They will lose access immediately.')) return
    setDeletingId(id)
    try {
      await fetch('/api/admin/supervisor-credentials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: id }),
      })
      flash('ok', 'Credential removed')
      await load()
    } finally {
      setDeletingId(null)
    }
  }

  function editCred(c: Credential) {
    setForm({ employee_id: String(c.employee_id), username: c.username, password: '' })
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>Supervisor Credentials</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Manage login credentials for each supervisor. Passwords are stored hashed — you cannot view them, only reset.
        </p>
      </div>

      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 600,
          background: msg.type === 'ok' ? 'rgba(37,211,102,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.type === 'ok' ? 'rgba(37,211,102,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.type === 'ok' ? '#25D366' : '#f87171',
        }}>
          {msg.text}
        </div>
      )}

      {/* Add / Edit Form */}
      <div style={{
        background: 'var(--admin-card)', border: '1px solid var(--admin-border)',
        borderRadius: 14, padding: '24px', marginBottom: 24,
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', margin: '0 0 18px' }}>
          {form.employee_id && creds.find(c => String(c.employee_id) === form.employee_id) ? 'Update Credentials' : 'Add Supervisor'}
        </h2>
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Employee ID
            </label>
            <input
              type="number"
              value={form.employee_id}
              onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
              placeholder="e.g. 1001"
              required
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                background: 'var(--admin-bg)', border: '1.5px solid var(--admin-border)',
                color: 'var(--admin-text)', fontSize: 13, boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="e.g. ahmed.ali"
              required
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                background: 'var(--admin-bg)', border: '1.5px solid var(--admin-border)',
                color: 'var(--admin-text)', fontSize: 13, boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder={form.employee_id && creds.find(c => String(c.employee_id) === form.employee_id) ? 'Leave blank to keep' : 'New password'}
              required={!form.employee_id || !creds.find(c => String(c.employee_id) === form.employee_id)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                background: 'var(--admin-bg)', border: '1.5px solid var(--admin-border)',
                color: 'var(--admin-text)', fontSize: 13, boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: saving ? '#334155' : '#818cf8',
              color: 'white', fontSize: 13, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>

      {/* List */}
      <div style={{
        background: 'var(--admin-card)', border: '1px solid var(--admin-border)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>
            {creds.length} Supervisor{creds.length !== 1 ? 's' : ''}
          </span>
          <button onClick={load} style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>Loading…</div>
        ) : creds.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
            No supervisors yet. Add one above.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                {['Employee ID', 'Username', 'Created', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creds.map((c, i) => (
                <tr key={c.employee_id} style={{ borderBottom: i < creds.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--admin-text)', fontWeight: 600 }}>
                    #{c.employee_id}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--admin-text)' }}>
                    {c.username}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 12, color: '#64748b' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => editCred(c)}
                        style={{
                          padding: '5px 12px', borderRadius: 6, border: '1px solid var(--admin-border)',
                          background: 'transparent', color: 'var(--admin-text)', fontSize: 12,
                          cursor: 'pointer', fontWeight: 600,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.employee_id)}
                        disabled={deletingId === c.employee_id}
                        style={{
                          padding: '5px 12px', borderRadius: 6, border: 'none',
                          background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 12,
                          cursor: 'pointer', fontWeight: 600,
                        }}
                      >
                        {deletingId === c.employee_id ? '…' : 'Remove'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
