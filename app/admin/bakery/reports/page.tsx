'use client'
import { useEffect, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { bakeryApi } from '@/lib/bakery-api'

const COLORS = ['#c8733a','#25D366','#1d4ed8','#7c3aed','#dc2626','#d97706','#be185d','#0891b2']

export default function BakeryReports() {
  const [range, setRange] = useState(7)
  const [sales, setSales] = useState<{ date: string; orders: number; revenue: number }[]>([])
  const [top, setTop] = useState<{ product_name: string; qty: number; revenue: number }[]>([])

  useEffect(() => {
    bakeryApi.reports.sales(range).then(setSales).catch(() => {})
    bakeryApi.reports.topProducts().then(setTop).catch(() => {})
  }, [range])

  const totalRevenue = sales.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = sales.reduce((s, d) => s + d.orders, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Sales Reports</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[7,14,30].map(d => (
            <button key={d} onClick={() => setRange(d)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: range === d ? '#c8733a' : '#f1f5f9', color: range === d ? 'white' : '#64748b' }}>{d}d</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[['Revenue', `$${totalRevenue.toFixed(2)}`, '#16a34a'], ['Orders', totalOrders, '#1d4ed8'], ['Avg Order', `$${totalOrders ? (totalRevenue/totalOrders).toFixed(2) : '0.00'}`, '#c8733a']].map(([label, value, color]) => (
          <div key={label as string} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: color as string }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Revenue Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sales}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c8733a" stopOpacity={0.25}/><stop offset="95%" stopColor="#c8733a" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }}/>
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }}/>
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#c8733a" fill="url(#rev)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Orders per Day</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }}/>
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }}/>
              <Tooltip />
              <Bar dataKey="orders" radius={[4,4,0,0]}>
                {sales.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {top.length > 0 && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Top Products by Revenue</div>
          {top.map((p, i) => (
            <div key={p.product_name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: COLORS[i], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{p.product_name}</span>
                  <span style={{ fontWeight: 700, color: '#c8733a', fontSize: 13 }}>${p.revenue.toFixed(2)}</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: COLORS[i], width: `${(p.revenue / top[0].revenue) * 100}%`, borderRadius: 99 }}/>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{p.qty} units sold</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
