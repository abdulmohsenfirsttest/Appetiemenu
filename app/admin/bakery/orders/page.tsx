'use client'
import { useEffect, useState } from 'react'
import { bakeryApi } from '@/lib/bakery-api'
import { BakeryOrder } from '@/lib/bakery-db'

const STATUSES = ['pending','preparing','ready','completed','cancelled']
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#fff7ed', color: '#c2410c' }, preparing: { bg: '#eff6ff', color: '#1d4ed8' },
  ready: { bg: '#eef2ff', color: '#4338ca' }, completed: { bg: '#f0fdf4', color: '#16a34a' },
  cancelled: { bg: '#f8fafc', color: '#94a3b8' },
}

export default function BakeryOrders() {
  const [orders, setOrders] = useState<BakeryOrder[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded] = useState<number | null>(null)

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
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>{visible.length} orders · ${revenue.toFixed(2)} revenue</div>

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
              {['#','Customer','Created By','Total','Status','Date',''].map(h => (
                <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(o => {
              const sc = STATUS_COLORS[o.status] || { bg: '#f8fafc', color: '#64748b' }
              return (
                <>
                  <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#94a3b8', fontSize: 12 }}>#{String(o.id).padStart(4,'0')}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{o.customer_name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 12 }}>
                        <div style={{ fontWeight: 600 }}>{o.created_by_name || '—'}</div>
                        {o.created_by_role && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, fontWeight: 700, background: o.created_by_role === 'admin' ? '#fce7f3' : '#dbeafe', color: o.created_by_role === 'admin' ? '#be185d' : '#1d4ed8' }}>{o.created_by_role}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#c8733a' }}>${Number(o.total).toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#94a3b8' }}>{new Date(o.created_at).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontSize: 12, cursor: 'pointer' }}>{expanded === o.id ? '▲' : '▼'}</button>
                        <button onClick={() => deleteOrder(o.id)} style={{ padding: '4px 10px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr key={`${o.id}-expanded`}>
                      <td colSpan={7} style={{ padding: '8px 16px 16px', background: '#f8fafc' }}>
                        {(o.items || []).map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, borderBottom: '1px solid #e2e8f0' }}>
                            <span>{item.product_name} × {item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {o.notes && <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>Note: {o.notes}</div>}
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
        {visible.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No orders found</div>}
      </div>
    </div>
  )
}
