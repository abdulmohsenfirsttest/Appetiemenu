'use client'
import { useEffect, useState } from 'react'
import { bakeryApi } from '@/lib/bakery-api'

type Summary = { todayRevenue: number; todayOrders: number; pendingOrders: number; lowStock: { id: number; name: string; stock: number }[] }

export default function StaffDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => { bakeryApi.reports.summary().then(setSummary).catch(() => {}) }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2d1f14' }}>{greeting}! 👋</h1>
        <p style={{ color: '#7a6355', fontSize: 13, marginTop: 2 }}>{today}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: "Today's Revenue", value: `$${summary?.todayRevenue.toFixed(2) ?? '—'}`, color: '#16a34a' },
          { label: "Today's Orders", value: summary?.todayOrders ?? '—', color: '#1d4ed8' },
          { label: 'Pending', value: summary?.pendingOrders ?? '—', color: '#d97706' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #e8ddd0', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: '#7a6355', fontWeight: 600, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {(summary?.lowStock?.length ?? 0) > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#c2410c', fontSize: 13, marginBottom: 8 }}>⚠ Low Stock</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {summary!.lowStock.map(p => (
              <span key={p.id} style={{ background: '#fed7aa', color: '#9a3412', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                {p.name}: {p.stock} left
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #e8ddd0', borderRadius: 12, padding: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Your shift</div>
        <p style={{ color: '#7a6355', fontSize: 13, lineHeight: 1.6 }}>
          Go to <strong style={{ color: '#2d1f14' }}>Orders</strong> to take new orders or update existing ones.<br/>
          <span style={{ color: '#c8733a', fontWeight: 600 }}>Remember: every action requires a photo.</span>
        </p>
      </div>
    </div>
  )
}
