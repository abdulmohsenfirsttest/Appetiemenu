'use client'
import { useEffect, useState } from 'react'
import { bakeryApi } from '@/lib/bakery-api'

type Summary = { todayRevenue: number; todayOrders: number; totalProducts: number; totalCustomers: number; pendingOrders: number; lowStock: { id: number; name: string; stock: number }[] }

function StatCard({ label, value, color = '#0f172a', bg = '#f8fafc' }: { label: string; value: string | number; color?: string; bg?: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  )
}

export default function BakeryDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => { bakeryApi.reports.summary().then(setSummary).catch(() => {}) }, [])

  if (!summary) return <div style={{ color: '#94a3b8' }}>Loading…</div>

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Today's Revenue" value={`$${summary.todayRevenue.toFixed(2)}`} color="#16a34a" />
        <StatCard label="Today's Orders" value={summary.todayOrders} color="#1d4ed8" />
        <StatCard label="Pending Orders" value={summary.pendingOrders} color="#d97706" />
        <StatCard label="Products" value={summary.totalProducts} />
        <StatCard label="Customers" value={summary.totalCustomers} />
      </div>

      {summary.lowStock.length > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#c2410c', fontSize: 14, marginBottom: 10 }}>⚠ Low Stock Alert</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {summary.lowStock.map(p => (
              <span key={p.id} style={{ background: '#fed7aa', color: '#9a3412', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                {p.name}: {p.stock} left
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Quick links</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[['Orders', '/admin/bakery/orders'], ['Products', '/admin/bakery/products'], ['Activity Log', '/admin/bakery/activity'], ['Staff', '/admin/bakery/staff']].map(([label, href]) => (
            <a key={href} href={href} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
