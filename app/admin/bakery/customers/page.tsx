'use client'
import { useEffect, useState } from 'react'
import { bakeryApi } from '@/lib/bakery-api'

type Customer = { id: number; name: string; email: string; phone: string; notes: string; created_at: string; order_count: number; total_spent: number }
const EMPTY = { name: '', email: '', phone: '', notes: '' }

export default function BakeryCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<Partial<Customer> | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => bakeryApi.customers.list().then(setCustomers).catch(() => {})
  useEffect(() => { load() }, [])

  const visible = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.includes(search) || c.phone?.includes(search))

  async function handleSave() {
    if (!modal?.name) return
    setSaving(true)
    try { await bakeryApi.customers.save(modal); await load(); setModal(null) }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function handleDelete(c: Customer) {
    if (!confirm(`Delete "${c.name}"?`)) return
    await bakeryApi.customers.delete(c.id); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--admin-text)' }}>Customers</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{customers.length} registered</div>
        </div>
        <button onClick={() => setModal(EMPTY)} style={{ padding: '8px 18px', background: '#c8733a', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>+ Add Customer</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or phone…" style={{ padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 8, fontSize: 13, width: 280, background: 'var(--admin-input)', color: 'var(--admin-text)' }} />
      </div>

      <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--admin-thead)' }}>
              {['Name','Contact','Orders','Spent','Joined',''].map(h => (
                <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', textAlign: 'left', borderBottom: '1px solid var(--admin-border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--admin-border2)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--admin-text)' }}>{c.name}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                  {c.email && <div>{c.email}</div>}
                  {c.phone && <div>{c.phone}</div>}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--admin-text)' }}>{c.order_count}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#c8733a' }}>${Number(c.total_spent).toFixed(2)}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setModal(c)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--admin-text)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(c)} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No customers found</div>}
      </div>

      {modal && (
        <div className="mobile-modal" style={{ zIndex: 50 }}>
          <div className="mobile-modal-sheet" style={{ background: 'var(--admin-card)', padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20, color: 'var(--admin-text)' }}>{modal.id ? 'Edit Customer' : 'New Customer'}</div>
            <div style={{ display: 'grid', gap: 14 }}>
              {[['Full Name','name'],['Email','email'],['Phone','phone'],['Notes','notes']].map(([label, key]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input value={(modal as Record<string, string>)[key] || ''} onChange={e => setModal(m => ({ ...m!, [key]: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 8, fontSize: 13, background: 'var(--admin-input)', color: 'var(--admin-text)' }} />
                </div>
              ))}
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
