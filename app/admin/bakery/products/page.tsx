'use client'
import { useEffect, useState } from 'react'
import { bakeryApi } from '@/lib/bakery-api'
import { BakeryProduct } from '@/lib/bakery-db'

const CATS = ['Bread','Cake','Pastry','Muffin','Cookie','Drink','Other']
const UNITS = ['piece','loaf','slice','whole','dozen','box','bag']
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EMPTY: any = { name:'',category:'Bread',price:'',cost:'',stock:'',unit:'piece' }

export default function BakeryProducts() {
  const [products, setProducts] = useState<BakeryProduct[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<Partial<BakeryProduct & { price: string; cost: string; stock: string }> | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => bakeryApi.products.list().then(setProducts).catch(() => {})
  useEffect(() => { load() }, [])

  const visible = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  async function handleSave() {
    if (!modal?.name) return
    setSaving(true)
    try {
      await bakeryApi.products.save({ ...modal, price: Number(modal.price), cost: Number(modal.cost), stock: Number(modal.stock) })
      await load(); setModal(null)
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function handleDelete(p: BakeryProduct) {
    if (!confirm(`Delete "${p.name}"?`)) return
    await bakeryApi.products.delete(p.id); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--admin-text)' }}>Products</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{products.length} items</div>
        </div>
        <button onClick={() => setModal(EMPTY)} style={{ padding: '8px 18px', background: '#c8733a', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>+ Add Product</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 8, fontSize: 13, width: 260, background: 'var(--admin-input)', color: 'var(--admin-text)' }} />
      </div>

      <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--admin-thead)' }}>
              {['Product','Category','Price','Cost','Stock',''].map(h => (
                <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b', textAlign: 'left', borderBottom: '1px solid var(--admin-border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--admin-border2)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--admin-text)' }}>{p.name}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{p.category}</span></td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#c8733a' }}>${Number(p.price).toFixed(2)}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>${Number(p.cost).toFixed(2)}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: p.stock === 0 ? '#dc2626' : p.stock < 5 ? '#d97706' : '#16a34a' }}>{p.stock}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setModal({ ...p, price: String(p.price), cost: String(p.cost), stock: String(p.stock) } as any)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#0f172a', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(p)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No products found</div>}
      </div>

      {modal && (
        <div className="mobile-modal" style={{ zIndex: 50 }}>
          <div className="mobile-modal-sheet" style={{ background: 'var(--admin-card)', padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20, color: 'var(--admin-text)' }}>{modal.id ? 'Edit Product' : 'New Product'}</div>
            <div style={{ display: 'grid', gap: 14 }}>
              {[['Name','name','text'],['Price ($)','price','number'],['Cost ($)','cost','number'],['Stock','stock','number']].map(([label, key, type]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input type={type} value={(modal as Record<string, string>)[key] || ''} onChange={e => setModal(m => ({ ...m!, [key]: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 8, fontSize: 13, background: 'var(--admin-input)', color: 'var(--admin-text)' }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Category</label>
                  <select value={modal.category} onChange={e => setModal(m => ({ ...m!, category: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 8, fontSize: 13, background: 'var(--admin-input)', color: 'var(--admin-text)' }}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Unit</label>
                  <select value={modal.unit} onChange={e => setModal(m => ({ ...m!, unit: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 8, fontSize: 13, background: 'var(--admin-input)', color: 'var(--admin-text)' }}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
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
