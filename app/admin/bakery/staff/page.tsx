'use client'
import { useEffect, useState } from 'react'
import { bakeryApi } from '@/lib/bakery-api'
import { BakeryStaff } from '@/lib/bakery-db'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EMPTY: any = { name: '', username: '', password: '', role: 'staff' }

export default function BakeryStaffPage() {
  const [staff, setStaff] = useState<BakeryStaff[]>([])
  const [modal, setModal] = useState<Partial<BakeryStaff & { password: string }> | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => bakeryApi.staff.list().then(setStaff).catch(() => {})
  useEffect(() => { load() }, [])

  async function handleSave() {
    if (!modal?.name || !modal?.username) return
    setSaving(true)
    try {
      await bakeryApi.staff.save(modal); await load(); setModal(null)
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function handleDelete(s: BakeryStaff) {
    if (!confirm(`Remove "${s.name}"?`)) return
    await bakeryApi.staff.delete(s.id); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--admin-text)' }}>Staff Accounts</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{staff.length} accounts</div>
        </div>
        <button onClick={() => setModal(EMPTY)} style={{ padding: '8px 18px', background: '#c8733a', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>+ Add Staff</button>
      </div>

      <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--admin-thead)' }}>
              {['Name','Username','Role','Joined',''].map(h => (
                <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', textAlign: 'left', borderBottom: '1px solid var(--admin-border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--admin-border2)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: s.role === 'admin' ? '#fce7f3' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: s.role === 'admin' ? '#be185d' : '#1d4ed8' }}>
                      {s.name[0]}
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13, color: 'var(--admin-text)' }}>@{s.username}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 700, background: s.role === 'admin' ? '#fce7f3' : '#dbeafe', color: s.role === 'admin' ? '#be185d' : '#1d4ed8' }}>{s.role}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setModal({ ...s, password: '' })} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--admin-text)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(s)} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No staff accounts</div>}
      </div>

      {modal && (
        <div className="mobile-modal" style={{ zIndex: 50 }}>
          <div className="mobile-modal-sheet" style={{ background: 'var(--admin-card)', padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20, color: 'var(--admin-text)' }}>{modal.id ? 'Edit Staff' : 'Add Staff'}</div>
            <div style={{ display: 'grid', gap: 14 }}>
              {[['Full Name','name'],['Username','username']].map(([label, key]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input value={(modal as Record<string, string>)[key] || ''} onChange={e => setModal(m => ({ ...m!, [key]: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 8, fontSize: 13, background: 'var(--admin-input)', color: 'var(--admin-text)' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>{modal.id ? 'New Password (blank = keep)' : 'Password *'}</label>
                <input type="password" value={modal.password || ''} onChange={e => setModal(m => ({ ...m!, password: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 8, fontSize: 13, background: 'var(--admin-input)', color: 'var(--admin-text)' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Role</label>
                <select value={modal.role} onChange={e => setModal(m => ({ ...m!, role: e.target.value as 'admin' | 'staff' }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 8, fontSize: 13, background: 'var(--admin-input)', color: 'var(--admin-text)' }}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setModal(null)} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--admin-text)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: '#c8733a', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
