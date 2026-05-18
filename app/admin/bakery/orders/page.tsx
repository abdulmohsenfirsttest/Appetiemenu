'use client'
import { useEffect, useState } from 'react'
import { bakeryApi } from '@/lib/bakery-api'
import { BakeryOrder } from '@/lib/bakery-db'

type OrderWithPhoto = BakeryOrder & { photo_url?: string | null }

const STATUSES = ['pending','preparing','ready','completed','cancelled']
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fff7ed', color: '#c2410c' },
  preparing:  { bg: '#eff6ff', color: '#1d4ed8' },
  ready:      { bg: '#eef2ff', color: '#4338ca' },
  completed:  { bg: '#f0fdf4', color: '#16a34a' },
  cancelled:  { bg: '#f8fafc', color: '#94a3b8' },
}

export default function BakeryOrders() {
  const [orders, setOrders] = useState<OrderWithPhoto[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState<OrderWithPhoto | null>(null)

  const load = () => {
    const params: Record<string, string> = {}
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    bakeryApi.orders.list(params).then(setOrders).catch(() => {})
  }

  useEffect(() => { load() }, [dateFrom, dateTo])

  const visible = orders.filter(o => statusFilter === 'all' || o.status === statusFilter)
  const revenue = visible.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0)

  async function updateStatus(orderId: number, status: string) {
    const fd = new FormData(); fd.append('order_id', String(orderId)); fd.append('status', status)
    await bakeryApi.orders.updateStatus(fd); load()
  }

  async function deleteOrder(id: number) {
    if (!confirm('Delete this order?')) return
    await bakeryApi.orders.delete(id); load()
  }

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Orders</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>{visible.length} orders · {revenue.toFixed(2)} SAR revenue</div>

      {/* Date filter */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>📅 Date range:</span>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
        <span style={{ color: '#94a3b8' }}>to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
        {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(''); setDateTo('') }} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 12 }}>Clear</button>}
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: statusFilter === s ? '#c8733a' : '#f1f5f9',
            color: statusFilter === s ? 'white' : '#64748b',
          }}>{s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['#', 'Customer', 'Created By', 'Total', 'Status', 'Date', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(o => {
              const sc = STATUS_COLORS[o.status] || { bg: '#f8fafc', color: '#64748b' }
              return (
                <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#94a3b8', fontSize: 12 }}>#{String(o.id).padStart(4, '0')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setModal(o)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#c8733a', textDecoration: 'underline', textDecorationColor: '#c8733a50' }}>
                      {o.customer_name}
                    </button>
                    {o.photo_url && <span style={{ marginLeft: 6, fontSize: 11 }}>📷</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 600 }}>{o.created_by_name || '—'}</div>
                      {o.created_by_role && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, fontWeight: 700, background: o.created_by_role === 'admin' ? '#fce7f3' : '#dbeafe', color: o.created_by_role === 'admin' ? '#be185d' : '#1d4ed8' }}>{o.created_by_role}</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#c8733a' }}>{Number(o.total).toFixed(2)} SAR</td>
                  <td style={{ padding: '12px 16px' }}>
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#94a3b8' }}>{new Date(o.created_at).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => deleteOrder(o.id)} style={{ padding: '4px 10px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>Del</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visible.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No orders found</div>}
      </div>

      {/* Order Detail Modal */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{modal.customer_name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Order #{String(modal.id).padStart(4, '0')} · {new Date(modal.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => setModal(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#475569' }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Photo */}
              {modal.photo_url && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>📷 Photo</div>
                  <img src={modal.photo_url} alt="Order photo" style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 260, border: '1px solid #e2e8f0' }} />
                </div>
              )}

              {/* Status & Staff */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>STATUS</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: STATUS_COLORS[modal.status]?.color || '#0f172a' }}>{modal.status[0].toUpperCase() + modal.status.slice(1)}</div>
                </div>
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>CREATED BY</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{modal.created_by_name || '—'}</div>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Order Items</div>
                {(modal.items || []).length === 0
                  ? <div style={{ fontSize: 13, color: '#94a3b8' }}>No items</div>
                  : (modal.items || []).map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.product_name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>× {item.quantity} · {Number(item.price).toFixed(2)} SAR each</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#c8733a' }}>{(Number(item.price) * item.quantity).toFixed(2)} SAR</div>
                    </div>
                  ))
                }
              </div>

              {/* Notes */}
              {modal.notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>NOTE</div>
                  <div style={{ fontSize: 13, color: '#78350f' }}>{modal.notes}</div>
                </div>
              )}

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #e2e8f0', paddingTop: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Total</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#c8733a' }}>{Number(modal.total).toFixed(2)} SAR</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
