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

  const btn = (label: string, onClick: () => void, color = '#0f172a', bg = '#f1f5f9') => (
    <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: bg, color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{label}</button>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Products</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{products.length} items</div>
        </div>
        <button onClick={() => setModal(EMPTY)} style={{ padding: '8px 18px', background: '#c8733a', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>+ Add Product</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, width: 260 }} />
      </div>

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Product','Category','Price','Cost','Stock',''].map(h => (
                <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{p.category}</span></td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#c8733a' }}>${Number(p.price).toFixed(2)}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>${Number(p.cost).toFixed(2)}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: p.stock === 0 ? '#dc2626' : p.stock < 5 ? '#d97706' : '#16a34a' }}>{p.stock}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {btn('Edit', () => setModal({ ...p, price: String(p.price), cost: String(p.cost), stock: String(p.stock) } as any))}
                    {btn('Delete', () => handleDelete(p), '#dc2626', '#fef2f2')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No products found</div>}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480 }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>{modal.id ? 'Edit Product' : 'New Product'}</div>
            <div style={{ display: 'grid', gap: 14 }}>
              {[['Name','name','text'],['Price ($)','price','number'],['Cost ($)','cost','number'],['Stock','stock','number']].map(([label, key, type]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input type={type} value={(modal as Record<string, string>)[key] || ''} onChange={e => setModal(m => ({ ...m!, [key]: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Category</label>
                  <select value={modal.category} onChange={e => setModal(m => ({ ...m!, category: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Unit</label>
                  <select value={modal.unit} onChange={e => setModal(m => ({ ...m!, unit: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setModal(null)} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: '#c8733a', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
