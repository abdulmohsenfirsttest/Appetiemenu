'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  REPORT_MONTHS, MONTH_LABELS, PAYMENTS_BY_MONTH, BRANCHES_BY_MONTH, PRODUCTS_BY_MONTH,
  type Month,
} from '@/lib/reports-data'

// ── Formatters ─────────────────────────────────────────────────────────────
const SAR = (n: number) => 'SAR ' + Math.round(n).toLocaleString('en-SA')
const NUM = (n: number) => Math.round(n).toLocaleString('en-SA')
const PCT = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%'

function growthPct(curr: number, prev: number) {
  if (!prev) return null
  return ((curr - prev) / prev) * 100
}

// ── Constants ──────────────────────────────────────────────────────────────
const ALL_BRANCHES = ['Hittin Branch', 'Malqa Branch', 'Ar Rayyan Branch']
const ALL_PAYMENTS = ['Hungerstation', 'Mada', 'Jahez', 'Cash', 'Keeta', 'Ninja', 'The Chefz']

const BRANCH_COLORS: Record<string, string> = {
  'Hittin Branch': '#818cf8',
  'Malqa Branch': '#34d399',
  'Ar Rayyan Branch': '#f59e0b',
}
const PAYMENT_COLORS: Record<string, string> = {
  'Hungerstation': '#ff6b35',
  'Mada': '#25D366',
  'Jahez': '#ef4444',
  'Cash': '#94a3b8',
  'Keeta': '#8b5cf6',
  'Ninja': '#0ea5e9',
  'The Chefz': '#f97316',
}
const MONTH_COLORS = ['#818cf8', '#34d399', '#f59e0b', '#f472b6', '#22d3ee']

type Tab = 'overview' | 'branches' | 'products' | 'payments'
type Metric = 'netSales' | 'grossSales' | 'profit' | 'orders' | 'qty' | 'revenue'

// ── Tiny components ────────────────────────────────────────────────────────
function Chip({ label, active, color, onClick }: { label: string; active: boolean; color?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 99, border: `1.5px solid ${active ? (color || '#818cf8') : 'var(--admin-border)'}`,
      background: active ? `${color || '#818cf8'}18` : 'transparent',
      color: active ? (color || '#818cf8') : '#64748b',
      fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  )
}

function Badge({ value, fontSize = 11 }: { value: number | null; fontSize?: number }) {
  if (value === null) return <span style={{ color: '#64748b', fontSize }}>—</span>
  const up = value >= 0
  return (
    <span style={{
      fontSize, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
      background: up ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)',
      color: up ? '#34d399' : '#ef4444',
    }}>
      {up ? '▲' : '▼'} {PCT(Math.abs(value))}
    </span>
  )
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 5, background: 'var(--admin-border)', borderRadius: 99, overflow: 'hidden', flex: 1, minWidth: 60 }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99 }} />
    </div>
  )
}

function KpiCard({ label, value, sub, color, trend }: { label: string; value: string; sub?: string; color?: string; trend?: number | null }) {
  return (
    <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color || '#818cf8', borderRadius: '14px 14px 0 0' }} />
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || 'var(--admin-text)', marginBottom: 4, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {sub && <span style={{ fontSize: 12, color: '#64748b' }}>{sub}</span>}
        {trend !== undefined && <Badge value={trend ?? null} />}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('overview')

  // Filters
  const [selMonths, setSelMonths] = useState<Set<Month>>(new Set())
  const [selBranches, setSelBranches] = useState<Set<string>>(new Set())
  const [selPayments, setSelPayments] = useState<Set<string>>(new Set())
  const [productSearch, setProductSearch] = useState('')
  const [productSort, setProductSort] = useState<Metric>('qty')
  const [productDir, setProductDir] = useState<'desc' | 'asc'>('desc')
  const [metric, setMetric] = useState<Metric>('netSales')
  const [showFilters, setShowFilters] = useState(true)

  const activeMonths = useMemo<Month[]>(
    () => selMonths.size > 0 ? REPORT_MONTHS.filter(m => selMonths.has(m)) : [...REPORT_MONTHS],
    [selMonths]
  )
  const activeBranches = useMemo(
    () => selBranches.size > 0 ? ALL_BRANCHES.filter(b => selBranches.has(b)) : ALL_BRANCHES,
    [selBranches]
  )
  const activePayments = useMemo(
    () => selPayments.size > 0 ? ALL_PAYMENTS.filter(p => selPayments.has(p)) : ALL_PAYMENTS,
    [selPayments]
  )

  function toggleMonth(m: Month) {
    setSelMonths(prev => { const s = new Set(prev); s.has(m) ? s.delete(m) : s.add(m); return s })
  }
  function toggleBranch(b: string) {
    setSelBranches(prev => { const s = new Set(prev); s.has(b) ? s.delete(b) : s.add(b); return s })
  }
  function togglePayment(p: string) {
    setSelPayments(prev => { const s = new Set(prev); s.has(p) ? s.delete(p) : s.add(p); return s })
  }
  function clearAll() {
    setSelMonths(new Set()); setSelBranches(new Set()); setSelPayments(new Set()); setProductSearch('')
  }
  const hasFilters = selMonths.size > 0 || selBranches.size > 0 || selPayments.size > 0 || productSearch

  // ── Per-month aggregates ─────────────────────────────────────────────────
  const monthlyStats = useMemo(() => REPORT_MONTHS.map((m, i) => {
    const bs = BRANCHES_BY_MONTH[m].filter(b => activeBranches.includes(b.branch))
    const ps = PAYMENTS_BY_MONTH[m].filter(p => activePayments.includes(p.method))
    const netSales = bs.reduce((s, b) => s + b.netSales, 0)
    const grossSales = bs.reduce((s, b) => s + b.grossSales, 0)
    const profit = bs.reduce((s, b) => s + b.profit, 0)
    const orders = bs.reduce((s, b) => s + b.orderCount, 0)
    const taxes = bs.reduce((s, b) => s + b.taxes, 0)
    const discount = bs.reduce((s, b) => s + b.discount, 0)
    const returns = bs.reduce((s, b) => s + b.returnAmount, 0)
    const payNet = ps.reduce((s, p) => s + p.netAmount, 0)
    const topProd = [...PRODUCTS_BY_MONTH[m]].sort((a, b) => b.netQty - a.netQty)[0]
    return { month: m, label: MONTH_LABELS[m], color: MONTH_COLORS[i], netSales, grossSales, profit, orders, taxes, discount, returns, payNet, topProd }
  }), [activeBranches, activePayments])

  const filteredMonthStats = useMemo(
    () => monthlyStats.filter(s => activeMonths.includes(s.month)),
    [monthlyStats, activeMonths]
  )

  const totals = useMemo(() => ({
    netSales: filteredMonthStats.reduce((s, r) => s + r.netSales, 0),
    grossSales: filteredMonthStats.reduce((s, r) => s + r.grossSales, 0),
    profit: filteredMonthStats.reduce((s, r) => s + r.profit, 0),
    orders: filteredMonthStats.reduce((s, r) => s + r.orders, 0),
  }), [filteredMonthStats])

  // ── Branch agg ───────────────────────────────────────────────────────────
  const branchAgg = useMemo(() => {
    const map: Record<string, { netSales: number; grossSales: number; profit: number; orders: number; taxes: number; discount: number; returnAmount: number; voidAmount: number }> = {}
    activeMonths.forEach(m => {
      BRANCHES_BY_MONTH[m].filter(b => activeBranches.includes(b.branch)).forEach(b => {
        if (!map[b.branch]) map[b.branch] = { netSales: 0, grossSales: 0, profit: 0, orders: 0, taxes: 0, discount: 0, returnAmount: 0, voidAmount: 0 }
        map[b.branch].netSales += b.netSales
        map[b.branch].grossSales += b.grossSales
        map[b.branch].profit += b.profit
        map[b.branch].orders += b.orderCount
        map[b.branch].taxes += b.taxes
        map[b.branch].discount += b.discount
        map[b.branch].returnAmount += b.returnAmount
        map[b.branch].voidAmount += b.voidAmount
      })
    })
    const total = Object.values(map).reduce((s, b) => s + b.netSales, 0)
    return activeBranches.filter(b => map[b]).map(b => ({ branch: b, ...map[b], share: total ? Math.round((map[b].netSales / total) * 100) : 0 }))
  }, [activeMonths, activeBranches])

  // Branch per-month for comparison table
  const branchByMonth = useMemo(() => {
    return activeBranches.map(branch => {
      const byMonth = activeMonths.map(m => {
        const row = BRANCHES_BY_MONTH[m].find(b => b.branch === branch)
        return { month: m, netSales: row?.netSales || 0, orders: row?.orderCount || 0, profit: row?.profit || 0, grossSales: row?.grossSales || 0 }
      })
      return { branch, byMonth }
    })
  }, [activeMonths, activeBranches])

  // ── Product agg ──────────────────────────────────────────────────────────
  const productAgg = useMemo(() => {
    const map: Record<string, { netSales: number; netQty: number; profit: number; returnQty: number; byMonth: Record<string, { netSales: number; netQty: number }> }> = {}
    activeMonths.forEach(m => {
      PRODUCTS_BY_MONTH[m].forEach(p => {
        if (!map[p.name]) map[p.name] = { netSales: 0, netQty: 0, profit: 0, returnQty: 0, byMonth: {} }
        map[p.name].netSales += p.netSales
        map[p.name].netQty += p.netQty
        map[p.name].profit += p.profit
        map[p.name].returnQty += p.returnQty
        if (!map[p.name].byMonth[m]) map[p.name].byMonth[m] = { netSales: 0, netQty: 0 }
        map[p.name].byMonth[m].netSales += p.netSales
        map[p.name].byMonth[m].netQty += p.netQty
      })
    })
    const search = productSearch.toLowerCase()
    return Object.entries(map)
      .filter(([name]) => !search || name.toLowerCase().includes(search))
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => {
        const dir = productDir === 'desc' ? 1 : -1
        if (productSort === 'qty') return dir * (b.netQty - a.netQty)
        if (productSort === 'revenue') return dir * (b.netSales - a.netSales)
        return dir * (b.profit - a.profit)
      })
  }, [activeMonths, productSearch, productSort, productDir])

  // ── Payment agg ──────────────────────────────────────────────────────────
  const paymentAgg = useMemo(() => {
    const map: Record<string, { netAmount: number; count: number; returnAmount: number; byMonth: Record<string, number> }> = {}
    activeMonths.forEach(m => {
      PAYMENTS_BY_MONTH[m].filter(p => activePayments.includes(p.method)).forEach(p => {
        if (!map[p.method]) map[p.method] = { netAmount: 0, count: 0, returnAmount: 0, byMonth: {} }
        map[p.method].netAmount += p.netAmount
        map[p.method].count += p.count
        map[p.method].returnAmount += p.returnAmount
        map[p.method].byMonth[m] = (map[p.method].byMonth[m] || 0) + p.netAmount
      })
    })
    const total = Object.values(map).reduce((s, p) => s + p.netAmount, 0)
    return Object.entries(map).map(([method, v]) => ({ method, ...v, share: total ? Math.round((v.netAmount / total) * 100) : 0 }))
      .sort((a, b) => b.netAmount - a.netAmount)
  }, [activeMonths, activePayments])

  const maxBranchNet = Math.max(...branchAgg.map(b => b.netSales), 1)
  const maxProductVal = Math.max(...productAgg.map(p => productSort === 'qty' ? p.netQty : p.netSales), 1)
  const maxMonthNet = Math.max(...filteredMonthStats.map(s => s.netSales), 1)

  // KPI trend: compare first vs last selected month
  const kpiTrend = useMemo(() => {
    if (filteredMonthStats.length < 2) return null
    const first = filteredMonthStats[0]
    const last = filteredMonthStats[filteredMonthStats.length - 1]
    return {
      netSales: growthPct(last.netSales, first.netSales),
      orders: growthPct(last.orders, first.orders),
      profit: growthPct(last.profit, first.profit),
    }
  }, [filteredMonthStats])

  const tabStyle = (t: Tab) => ({
    padding: '9px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
    background: tab === t ? '#818cf8' : 'transparent',
    color: tab === t ? 'white' : '#64748b',
    transition: 'all 0.15s',
  })

  const metricLabel: Record<Metric, string> = { netSales: 'Net Sales', grossSales: 'Gross Sales', profit: 'Profit', orders: 'Orders', qty: 'Qty Sold', revenue: 'Revenue' }
  const metricValue = (s: typeof filteredMonthStats[0], m: Metric) => {
    if (m === 'netSales') return SAR(s.netSales)
    if (m === 'grossSales') return SAR(s.grossSales)
    if (m === 'profit') return SAR(s.profit)
    if (m === 'orders') return NUM(s.orders)
    return '—'
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--admin-text)', margin: 0, letterSpacing: '-0.02em' }}>Sales Reports</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Ghabashi · Jan – May 2026 ·{' '}
            <span style={{ color: '#818cf8', fontWeight: 600 }}>{activeMonths.length} month{activeMonths.length !== 1 ? 's' : ''} selected</span>
            {selBranches.size > 0 && <span style={{ color: '#34d399', fontWeight: 600 }}> · {selBranches.size} branch{selBranches.size !== 1 ? 'es' : ''}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {hasFilters && (
            <button onClick={clearAll} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Clear Filters
            </button>
          )}
          <button onClick={() => setShowFilters(f => !f)} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--admin-text)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* ── Filter Panel ────────────────────────────────────────────── */}
      {showFilters && (
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto 1fr', gap: '16px 24px', alignItems: 'start', flexWrap: 'wrap' }}>

            {/* Months */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Months</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {REPORT_MONTHS.map((m, i) => (
                  <Chip key={m} label={MONTH_LABELS[m].split(' ')[0]} active={selMonths.has(m)} color={MONTH_COLORS[i]} onClick={() => toggleMonth(m)} />
                ))}
              </div>
            </div>

            {/* Branches */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Branches</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ALL_BRANCHES.map(b => (
                  <Chip key={b} label={b.replace(' Branch', '')} active={selBranches.has(b)} color={BRANCH_COLORS[b]} onClick={() => toggleBranch(b)} />
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Payment Methods</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ALL_PAYMENTS.map(p => (
                  <Chip key={p} label={p} active={selPayments.has(p)} color={PAYMENT_COLORS[p]} onClick={() => togglePayment(p)} />
                ))}
              </div>
            </div>

            {/* Product Search */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Search Products</div>
              <input
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="e.g. Philly, Grill Chicken…"
                style={{ width: '100%', padding: '7px 12px', borderRadius: 8, border: '1.5px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: 13, boxSizing: 'border-box', maxWidth: 260 }}
              />
            </div>

          </div>
        </div>
      )}

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <KpiCard label="Net Sales" value={SAR(totals.netSales)} sub={`${NUM(totals.orders)} orders`} color="#818cf8" trend={kpiTrend?.netSales} />
        <KpiCard label="Gross Sales" value={SAR(totals.grossSales)} color="#0ea5e9" />
        <KpiCard label="Net Profit" value={SAR(totals.profit)} color="#34d399" trend={kpiTrend?.profit} />
        <KpiCard label="Top Product" value={productAgg[0]?.name?.split(' ').slice(0, 3).join(' ') || '—'} sub={productAgg[0] ? NUM(productAgg[0].netQty) + ' sold · ' + SAR(productAgg[0].netSales) : ''} color="#f59e0b" />
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 5, width: 'fit-content' }}>
        {(['overview', 'branches', 'products', 'payments'] as Tab[]).map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          OVERVIEW TAB
      ══════════════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Metric picker */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['netSales', 'grossSales', 'profit', 'orders'] as Metric[]).map(m => (
              <button key={m} onClick={() => setMetric(m)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--admin-border)', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: metric === m ? '#818cf8' : 'var(--admin-card)', color: metric === m ? 'white' : '#64748b' }}>
                {metricLabel[m]}
              </button>
            ))}
          </div>

          {/* Visual bars */}
          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 18 }}>Monthly {metricLabel[metric]}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredMonthStats.map(s => {
                const val = metric === 'netSales' ? s.netSales : metric === 'grossSales' ? s.grossSales : metric === 'profit' ? s.profit : s.orders
                const maxVal = Math.max(...filteredMonthStats.map(x => metric === 'netSales' ? x.netSales : metric === 'grossSales' ? x.grossSales : metric === 'profit' ? x.profit : x.orders), 1)
                return (
                  <div key={s.month} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 100, fontSize: 12, fontWeight: 700, color: s.color, flexShrink: 0 }}>{s.label.split(' ')[0]}</div>
                    <div style={{ flex: 1, height: 32, background: 'var(--admin-bg)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: '100%', width: `${Math.round((val / maxVal) * 100)}%`, background: `${s.color}30`, borderRadius: 8, transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                        <div style={{ height: '60%', width: `${Math.round((val / maxVal) * 100)}%`, background: s.color, borderRadius: 4, position: 'absolute', left: 0, top: '20%' }} />
                      </div>
                    </div>
                    <div style={{ width: 130, textAlign: 'right', fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', flexShrink: 0 }}>
                      {metricValue(s, metric)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detailed table with MoM */}
          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, overflow: 'auto' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>Monthly Breakdown</span>
              <span style={{ fontSize: 11, color: '#64748b' }}>MoM = month-over-month change</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  {['Month', 'Gross Sales', 'Net Sales', 'Profit', 'Taxes', 'Discount', 'Orders', 'Avg Order', 'MoM Sales'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMonthStats.map((s, i) => {
                  const prev = filteredMonthStats[i - 1]
                  const mom = prev ? growthPct(s.netSales, prev.netSales) : null
                  return (
                    <tr key={s.month} style={{ borderBottom: i < filteredMonthStats.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>{s.label.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--admin-text)' }}>{SAR(s.grossSales)}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: s.color }}>{SAR(s.netSales)}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#34d399' }}>{SAR(s.profit)}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#64748b' }}>{SAR(s.taxes)}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#f59e0b' }}>{SAR(s.discount)}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--admin-text)' }}>{NUM(s.orders)}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--admin-text)' }}>{s.orders ? SAR(s.netSales / s.orders) : '—'}</td>
                      <td style={{ padding: '13px 16px' }}><Badge value={mom} /></td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--admin-border)', background: 'rgba(129,140,248,0.05)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: 'var(--admin-text)' }}>Total</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>{SAR(totals.grossSales)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: '#818cf8' }}>{SAR(totals.netSales)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#34d399' }}>{SAR(totals.profit)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{SAR(filteredMonthStats.reduce((s, r) => s + r.taxes, 0))}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#f59e0b' }}>{SAR(filteredMonthStats.reduce((s, r) => s + r.discount, 0))}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>{NUM(totals.orders)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--admin-text)' }}>{totals.orders ? SAR(totals.netSales / totals.orders) : '—'}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          BRANCHES TAB
      ══════════════════════════════════════════════════════════════ */}
      {tab === 'branches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Branch KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {branchAgg.map(b => (
              <div key={b.branch} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: BRANCH_COLORS[b.branch] || '#818cf8' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: BRANCH_COLORS[b.branch] || '#818cf8' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{b.branch}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: BRANCH_COLORS[b.branch] || '#818cf8', marginBottom: 4, letterSpacing: '-0.02em' }}>{SAR(b.netSales)}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>{NUM(b.orders)} orders · {b.share}% of total</div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <div><div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Profit</div><div style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>{SAR(b.profit)}</div></div>
                  <div><div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Avg Order</div><div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>{b.orders ? SAR(b.netSales / b.orders) : '—'}</div></div>
                </div>
                <MiniBar pct={b.share} color={BRANCH_COLORS[b.branch] || '#818cf8'} />
              </div>
            ))}
          </div>

          {/* Month-by-month comparison per branch */}
          {activeMonths.length > 1 && (
            <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, overflow: 'auto' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>Branch × Month Comparison</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Branch</th>
                    {activeMonths.map((m, i) => (
                      <th key={m} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: MONTH_COLORS[REPORT_MONTHS.indexOf(m)], textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {MONTH_LABELS[m].split(' ')[0]}
                      </th>
                    ))}
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {branchByMonth.map((b, i) => (
                    <tr key={b.branch} style={{ borderBottom: i < branchByMonth.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: BRANCH_COLORS[b.branch] || '#818cf8' }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', whiteSpace: 'nowrap' }}>{b.branch}</span>
                        </div>
                      </td>
                      {b.byMonth.map((bm, j) => {
                        const prev = b.byMonth[j - 1]
                        const mom = prev ? growthPct(bm.netSales, prev.netSales) : null
                        return (
                          <td key={bm.month} style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: BRANCH_COLORS[b.branch] || '#818cf8' }}>{SAR(bm.netSales)}</div>
                            {mom !== null && <Badge value={mom} fontSize={10} />}
                          </td>
                        )
                      })}
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: 'var(--admin-text)' }}>
                        {SAR(b.byMonth.reduce((s, bm) => s + bm.netSales, 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--admin-border)', background: 'rgba(129,140,248,0.05)' }}>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 800, color: 'var(--admin-text)' }}>Total</td>
                    {activeMonths.map(m => {
                      const t = BRANCHES_BY_MONTH[m].filter(b => activeBranches.includes(b.branch)).reduce((s, b) => s + b.netSales, 0)
                      return <td key={m} style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: '#818cf8' }}>{SAR(t)}</td>
                    })}
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 800, color: '#818cf8' }}>{SAR(totals.netSales)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Branch detail table */}
          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, overflow: 'auto' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>Full Branch Details</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  {['Branch', 'Gross Sales', 'Net Sales', 'Profit', 'Taxes', 'Discount', 'Returns', 'Voids', 'Orders', 'Avg Order'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {branchAgg.map((b, i) => (
                  <tr key={b.branch} style={{ borderBottom: i < branchAgg.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: BRANCH_COLORS[b.branch] || '#818cf8' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', whiteSpace: 'nowrap' }}>{b.branch}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--admin-text)' }}>{SAR(b.grossSales)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: BRANCH_COLORS[b.branch] || '#818cf8' }}>{SAR(b.netSales)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#34d399' }}>{SAR(b.profit)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#64748b' }}>{SAR(b.taxes)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#f59e0b' }}>{SAR(b.discount)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#ef4444' }}>{SAR(b.returnAmount)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#ef4444' }}>{SAR(b.voidAmount)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--admin-text)' }}>{NUM(b.orders)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--admin-text)' }}>{b.orders ? SAR(b.netSales / b.orders) : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--admin-border)', background: 'rgba(129,140,248,0.05)' }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 800, color: 'var(--admin-text)' }}>Total</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700 }}>{SAR(branchAgg.reduce((s, b) => s + b.grossSales, 0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 800, color: '#818cf8' }}>{SAR(branchAgg.reduce((s, b) => s + b.netSales, 0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#34d399' }}>{SAR(branchAgg.reduce((s, b) => s + b.profit, 0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{SAR(branchAgg.reduce((s, b) => s + b.taxes, 0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#f59e0b' }}>{SAR(branchAgg.reduce((s, b) => s + b.discount, 0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#ef4444' }}>{SAR(branchAgg.reduce((s, b) => s + b.returnAmount, 0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#ef4444' }}>{SAR(branchAgg.reduce((s, b) => s + b.voidAmount, 0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700 }}>{NUM(branchAgg.reduce((s, b) => s + b.orders, 0))}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PRODUCTS TAB
      ══════════════════════════════════════════════════════════════ */}
      {tab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>Sort by:</span>
            {(['qty', 'revenue', 'profit'] as const).map(s => (
              <button key={s} onClick={() => setProductSort(s)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--admin-border)', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: productSort === s ? '#f59e0b' : 'var(--admin-card)', color: productSort === s ? 'white' : '#64748b' }}>
                {s === 'qty' ? 'Quantity Sold' : s === 'revenue' ? 'Revenue' : 'Profit'}
              </button>
            ))}
            <button onClick={() => setProductDir(d => d === 'desc' ? 'asc' : 'desc')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--admin-border)', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: 'var(--admin-card)', color: 'var(--admin-text)' }}>
              {productDir === 'desc' ? '▼ High → Low' : '▲ Low → High'}
            </button>
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>{productAgg.length} products</span>
          </div>

          {/* Month comparison table for products (when multiple months selected) */}
          {activeMonths.length > 1 ? (
            <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, overflow: 'auto' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>Product × Month Comparison</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rank</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                    {activeMonths.map(m => (
                      <th key={m} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: MONTH_COLORS[REPORT_MONTHS.indexOf(m)], textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {MONTH_LABELS[m].split(' ')[0]} {productSort === 'qty' ? '(qty)' : '(SAR)'}
                      </th>
                    ))}
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productAgg.map((p, i) => (
                    <tr key={p.name} style={{ borderBottom: i < Math.min(productAgg.length, 30) - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: i < 3 ? '#f59e0b' : i < 10 ? '#818cf830' : 'var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: i < 3 ? 'white' : '#64748b' }}>
                          {i + 1}
                        </div>
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</td>
                      {activeMonths.map((m, j) => {
                        const val = productSort === 'qty' ? (p.byMonth[m]?.netQty || 0) : (p.byMonth[m]?.netSales || 0)
                        const prevM = activeMonths[j - 1]
                        const prevVal = prevM ? (productSort === 'qty' ? (p.byMonth[prevM]?.netQty || 0) : (p.byMonth[prevM]?.netSales || 0)) : null
                        const mom = prevVal !== null ? growthPct(val, prevVal) : null
                        return (
                          <td key={m} style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: 13, fontWeight: val > 0 ? 600 : 400, color: val > 0 ? 'var(--admin-text)' : '#475569' }}>
                              {productSort === 'qty' ? NUM(val) : SAR(val)}
                            </div>
                            {mom !== null && val > 0 && <Badge value={mom} fontSize={10} />}
                          </td>
                        )
                      })}
                      <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 800, color: productSort === 'qty' ? '#f59e0b' : '#818cf8' }}>
                        {productSort === 'qty' ? NUM(p.netQty) : SAR(p.netSales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Single month — rank view */
            <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>Product Ranking</span>
              </div>
              <div style={{ maxHeight: 640, overflowY: 'auto' }}>
                {productAgg.map((p, i) => (
                  <div key={p.name} style={{ padding: '11px 20px', borderBottom: i < productAgg.length - 1 ? '1px solid var(--admin-border)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: i < 3 ? '#f59e0b' : i < 10 ? '#818cf820' : 'var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: i < 3 ? 'white' : '#64748b', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <MiniBar pct={Math.round((( productSort === 'qty' ? p.netQty : p.netSales) / maxProductVal) * 100)} color={i < 3 ? '#f59e0b' : '#818cf8'} />
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>{SAR(p.netSales)}</div>
                      <div style={{ fontSize: 12, color: '#f59e0b' }}>{NUM(p.netQty)} sold</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PAYMENTS TAB
      ══════════════════════════════════════════════════════════════ */}
      {tab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Payment cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {paymentAgg.map(p => (
              <div key={p.method} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: PAYMENT_COLORS[p.method] || '#818cf8' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: PAYMENT_COLORS[p.method] || '#818cf8' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.method}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: PAYMENT_COLORS[p.method] || '#818cf8', marginBottom: 2, letterSpacing: '-0.01em' }}>{SAR(p.netAmount)}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{NUM(p.count)} orders · {p.share}%</div>
                <MiniBar pct={p.share} color={PAYMENT_COLORS[p.method] || '#818cf8'} />
              </div>
            ))}
          </div>

          {/* Month-by-month payment comparison */}
          {activeMonths.length > 1 && (
            <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, overflow: 'auto' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>Payment × Month Comparison</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Method</th>
                    {activeMonths.map(m => (
                      <th key={m} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: MONTH_COLORS[REPORT_MONTHS.indexOf(m)], textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {MONTH_LABELS[m].split(' ')[0]}
                      </th>
                    ))}
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentAgg.map((p, i) => (
                    <tr key={p.method} style={{ borderBottom: i < paymentAgg.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: PAYMENT_COLORS[p.method] || '#818cf8' }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{p.method}</span>
                        </div>
                      </td>
                      {activeMonths.map((m, j) => {
                        const val = p.byMonth[m] || 0
                        const prevM = activeMonths[j - 1]
                        const prevVal = prevM ? (p.byMonth[prevM] || 0) : null
                        const mom = prevVal !== null ? growthPct(val, prevVal) : null
                        return (
                          <td key={m} style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: PAYMENT_COLORS[p.method] || '#818cf8' }}>{SAR(val)}</div>
                            {mom !== null && <Badge value={mom} fontSize={10} />}
                          </td>
                        )
                      })}
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: PAYMENT_COLORS[p.method] || '#818cf8' }}>{SAR(p.netAmount)}</td>
                      <td style={{ padding: '12px 16px', minWidth: 130 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <MiniBar pct={p.share} color={PAYMENT_COLORS[p.method] || '#818cf8'} />
                          <span style={{ fontSize: 11, color: '#64748b', minWidth: 28 }}>{p.share}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--admin-border)', background: 'rgba(129,140,248,0.05)' }}>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 800, color: 'var(--admin-text)' }}>Total</td>
                    {activeMonths.map(m => {
                      const t = PAYMENTS_BY_MONTH[m].filter(p => activePayments.includes(p.method)).reduce((s, p) => s + p.netAmount, 0)
                      return <td key={m} style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: '#818cf8' }}>{SAR(t)}</td>
                    })}
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 800, color: '#818cf8' }}>{SAR(paymentAgg.reduce((s, p) => s + p.netAmount, 0))}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#64748b' }}>100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Single month payment table */}
          {activeMonths.length <= 1 && (
            <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>Payment Methods Detail</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    {['Method', 'Net Amount', 'Orders', 'Avg Order', 'Returns', 'Share'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paymentAgg.map((p, i) => (
                    <tr key={p.method} style={{ borderBottom: i < paymentAgg.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: PAYMENT_COLORS[p.method] || '#818cf8' }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{p.method}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: PAYMENT_COLORS[p.method] || '#818cf8' }}>{SAR(p.netAmount)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--admin-text)' }}>{NUM(p.count)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--admin-text)' }}>{p.count ? SAR(p.netAmount / p.count) : '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#ef4444' }}>{SAR(p.returnAmount)}</td>
                      <td style={{ padding: '12px 16px', minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <MiniBar pct={p.share} color={PAYMENT_COLORS[p.method] || '#818cf8'} />
                          <span style={{ fontSize: 12, color: '#64748b', minWidth: 28 }}>{p.share}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--admin-border)', background: 'rgba(129,140,248,0.05)' }}>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 800, color: 'var(--admin-text)' }}>Total</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 800, color: '#818cf8' }}>{SAR(paymentAgg.reduce((s, p) => s + p.netAmount, 0))}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700 }}>{NUM(paymentAgg.reduce((s, p) => s + p.count, 0))}</td>
                    <td />
                    <td style={{ padding: '11px 16px', fontSize: 13, color: '#ef4444' }}>{SAR(paymentAgg.reduce((s, p) => s + p.returnAmount, 0))}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#64748b' }}>100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
