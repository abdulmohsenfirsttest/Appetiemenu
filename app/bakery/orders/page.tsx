'use client'
import { useEffect, useRef, useState } from 'react'
import { bakeryApi } from '@/lib/bakery-api'
import { BakeryOrder, BakeryProduct } from '@/lib/bakery-db'

type CartItem = { product_id: number; product_name: string; price: number; quantity: number }

function PhotoModal({ title, onClose, onConfirm, saving, children }: {
  title: string; onClose: () => void; saving: boolean
  onConfirm: (photo: File) => void; children: React.ReactNode
}) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mobile-modal" style={{ zIndex: 100 }}>
      <div className="mobile-modal-sheet" style={{ background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>×</button>
        </div>
        <div style={{ padding: '16px 24px' }}>
          <div style={{ marginBottom: 16 }}>{children}</div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', display: 'block', marginBottom: 6 }}>📷 Photo required</label>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e => {
              const f = e.target.files?.[0]; if (!f) return
              setPhoto(f); setPreview(URL.createObjectURL(f))
            }} style={{ display: 'none' }} />
            {preview ? (
              <div style={{ position: 'relative' }}>
                <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <button onClick={() => { setPhoto(null); setPreview(null) }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: 'white', cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '24px 0', border: '2px dashed #e8ddd0', borderRadius: 10, background: '#faf8f5', cursor: 'pointer', color: '#7a6355', fontSize: 13 }}>
                📷 Tap to take or upload photo
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '0 24px 20px' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          <button onClick={() => photo && onConfirm(photo)} disabled={saving || !photo} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: '#c8733a', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: !photo ? .5 : 1 }}>
            {saving ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StaffOrders() {
  const [orders, setOrders] = useState<BakeryOrder[]>([])
  const [products, setProducts] = useState<BakeryProduct[]>([])
  const [showNew, setShowNew] = useState(false)
  const [statusModal, setStatusModal] = useState<BakeryOrder | null>(null)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  // new order state
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [qty, setQty] = useState(1)
  const [customerName, setCustomerName] = useState('Walk-in')
  const [notes, setNotes] = useState('')

  // status update state
  const [newStatus, setNewStatus] = useState('')

  const load = () => bakeryApi.orders.list({ today: '1' }).then(setOrders).catch(() => {})

  useEffect(() => {
    load()
    bakeryApi.products.list().then(setProducts).catch(() => {})
  }, [])

  const addToCart = () => {
    const p = products.find(p => p.id === Number(selectedProduct)); if (!p) return
    setCart(prev => {
      const ex = prev.find(i => i.product_id === p.id)
      if (ex) return prev.map(i => i.product_id === p.id ? { ...i, quantity: i.quantity + qty } : i)
      return [...prev, { product_id: p.id, product_name: p.name, price: Number(p.price), quantity: qty }]
    })
    setSelectedProduct(''); setQty(1)
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  async function handleCreate(photo: File) {
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('customer_name', customerName || 'Walk-in')
      fd.append('items', JSON.stringify(cart))
      fd.append('notes', notes)
      fd.append('photo', photo)
      await bakeryApi.orders.create(fd)
      setCart([]); setCustomerName('Walk-in'); setNotes(''); setShowNew(false)
      await load()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function handleStatus(photo: File) {
    if (!statusModal) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('order_id', String(statusModal.id))
      fd.append('status', newStatus)
      fd.append('photo', photo)
      await bakeryApi.orders.updateStatus(fd)
      setStatusModal(null); await load()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  const STATUS_COLORS: Record<string, string> = { pending: '#d97706', preparing: '#1d4ed8', ready: '#4338ca', completed: '#16a34a', cancelled: '#94a3b8' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#2d1f14' }}>Today&apos;s Orders</h1>
          <p style={{ fontSize: 12, color: '#7a6355', marginTop: 2 }}>{orders.length} orders today</p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ padding: '9px 18px', background: '#c8733a', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>+ New Order</button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 12, border: '1px solid #e8ddd0', color: '#7a6355' }}>No orders today yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map(o => (
            <div key={o.id} style={{ background: 'white', border: '1px solid #e8ddd0', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>#{String(o.id).padStart(4,'0')}</span>
                <span style={{ fontWeight: 700, flex: 1 }}>{o.customer_name}</span>
                <span style={{ fontWeight: 700, color: '#c8733a' }}>${Number(o.total).toFixed(2)}</span>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, fontWeight: 700, background: '#f1f5f9', color: STATUS_COLORS[o.status] || '#64748b' }}>
                  {o.status}
                </span>
                <button onClick={() => { setStatusModal(o); setNewStatus(o.status) }} style={{ padding: '6px 12px', background: '#c8733a', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  📷 Update
                </button>
                <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', fontSize: 12 }}>
                  {expanded === o.id ? '▲' : '▼'}
                </button>
              </div>
              {expanded === o.id && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '10px 16px', background: '#faf8f5' }}>
                  {o.items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
                      <span>{item.product_name} × {item.quantity}</span>
                      <span style={{ fontWeight: 600 }}>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {o.notes && <div style={{ marginTop: 6, fontSize: 12, color: '#7a6355', fontStyle: 'italic' }}>Note: {o.notes}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New order modal */}
      {showNew && (
        <PhotoModal title="New Order" onClose={() => setShowNew(false)} saving={saving} onConfirm={handleCreate}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Customer name</label>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={{ flex: 1, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                <option value="">Select product…</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${Number(p.price).toFixed(2)}</option>)}
              </select>
              <input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} style={{ width: 56, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
              <button onClick={addToCart} disabled={!selectedProduct} style={{ padding: '8px 14px', background: '#c8733a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Add</button>
            </div>
            {cart.length > 0 && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                {cart.map(item => (
                  <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #f1f5f9', gap: 8, fontSize: 13 }}>
                    <span style={{ flex: 1, fontWeight: 600 }}>{item.product_name}</span>
                    <button onClick={() => setCart(c => c.map(i => i.product_id === item.product_id ? { ...i, quantity: Math.max(1, i.quantity-1) } : i))} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, width: 24, height: 24, cursor: 'pointer' }}>-</button>
                    <span style={{ fontWeight: 700, width: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => setCart(c => c.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity+1 } : i))} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, width: 24, height: 24, cursor: 'pointer' }}>+</button>
                    <span style={{ fontWeight: 700, width: 56, textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => setCart(c => c.filter(i => i.product_id !== item.product_id))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16 }}>×</button>
                  </div>
                ))}
                <div style={{ padding: '8px 12px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>Total</span><span style={{ color: '#c8733a' }}>${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Special instructions…" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, resize: 'vertical' }} />
          </div>
        </PhotoModal>
      )}

      {/* Status update modal */}
      {statusModal && (
        <PhotoModal title={`Update Order #${String(statusModal.id).padStart(4,'0')}`} onClose={() => setStatusModal(null)} saving={saving} onConfirm={handleStatus}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>New Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
              {['pending','preparing','ready','completed','cancelled'].map(s => <option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}
            </select>
            <div style={{ marginTop: 8, fontSize: 13, color: '#64748b', background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
              Current: <strong>{statusModal.status}</strong> → <strong style={{ color: '#c8733a' }}>{newStatus}</strong>
            </div>
          </div>
        </PhotoModal>
      )}
    </div>
  )
}
