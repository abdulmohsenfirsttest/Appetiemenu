'use client'

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import {
  Violation, BranchEvaluation, currentPeriod, periodLabel, violationsTableReady,
  fetchViolations, fetchBranchEvaluations, deleteViolation,
} from '@/lib/violations-db'

const BRANCH_COLORS: Record<string, { text: string; bg: string }> = {
  'Ar Rayyan': { text: '#16a34a', bg: '#dcfce7' },
  'Hittin': { text: '#7c3aed', bg: '#ede9fe' },
  'Malqa': { text: '#2563eb', bg: '#dbeafe' },
}

type Tab = 'violations' | 'evaluations' | 'report'

export default function AdminViolations() {
  const [ready, setReady] = useState<boolean | null>(null)
  const [tab, setTab] = useState<Tab>('violations')
  const [violations, setViolations] = useState<Violation[]>([])
  const [evals, setEvals] = useState<BranchEvaluation[]>([])
  const [period, setPeriod] = useState(currentPeriod())
  const [filterBranch, setFilterBranch] = useState('all')
  const [delConfirm, setDelConfirm] = useState<Violation | null>(null)

  useEffect(() => {
    violationsTableReady().then(async (ok) => {
      setReady(ok)
      if (ok) {
        setViolations(await fetchViolations())
        setEvals(await fetchBranchEvaluations())
      }
    })
  }, [])

  // All periods present in the data (plus current month), newest first
  const periods = Array.from(new Set([currentPeriod(), ...violations.map(v => v.period), ...evals.map(e => e.period)])).sort().reverse()

  const periodViolations = violations.filter(v => v.period === period && (filterBranch === 'all' || v.branch === filterBranch))
  const periodEvals = evals.filter(e => e.period === period && (filterBranch === 'all' || e.branch === filterBranch))

  // Monthly report: aggregate deductions per employee for the period
  const reportRows = (() => {
    const map = new Map<number, { name: string; branch: string; count: number; total: number }>()
    violations.filter(v => v.period === period).forEach(v => {
      const cur = map.get(v.employee_id) || { name: v.employee_name || `#${v.employee_id}`, branch: v.branch || '', count: 0, total: 0 }
      cur.count += 1
      cur.total += Number(v.deduction_amount || 0)
      map.set(v.employee_id, cur)
    })
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  })()
  const reportTotal = reportRows.reduce((s, r) => s + r.total, 0)

  async function confirmDelete() {
    if (!delConfirm) return
    await deleteViolation(delConfirm.id)
    setViolations(prev => prev.filter(v => v.id !== delConfirm.id))
    setDelConfirm(null)
  }

  function exportReport() {
    const rows = reportRows.map((r, i) => ({
      '#': i + 1, Employee: r.name, Branch: r.branch,
      Violations: r.count, 'Total Deduction (SAR)': r.total.toFixed(2),
    }))
    rows.push({ '#': '' as any, Employee: 'TOTAL', Branch: '', Violations: reportRows.reduce((s, r) => s + r.count, 0), 'Total Deduction (SAR)': reportTotal.toFixed(2) })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Deductions')
    XLSX.writeFile(wb, `Deductions_${period}.xlsx`)
  }

  const card: React.CSSProperties = { background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
  const branchPill = (b: string | null) => {
    const c = b ? BRANCH_COLORS[b] : null
    return <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 600, color: c?.text ?? '#374151', background: c?.bg ?? '#f3f4f6' }}>{b || '—'}</span>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)' }}>Violations & Penalties</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>Manager-logged violations, branch evaluations, and monthly salary deductions</p>
      </div>

      {ready === false && (
        <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
          ⚠️ <strong>Setup needed.</strong> Run <code style={{ background: '#fef3c7', padding: '1px 6px', borderRadius: 6 }}>scripts/violations-schema.sql</code> once in the Supabase SQL Editor, then refresh.
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--admin-subcard)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {([['violations', 'Violations'], ['evaluations', 'Branch Evaluations'], ['report', 'Monthly Report']] as [Tab, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            background: tab === k ? 'var(--admin-card)' : 'transparent', color: tab === k ? 'var(--admin-text)' : '#64748b',
            boxShadow: tab === k ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="admin-select" style={{ maxWidth: 200 }}>
          {periods.map(p => <option key={p} value={p}>{periodLabel(p)}</option>)}
        </select>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="admin-select" style={{ maxWidth: 180 }}>
          <option value="all">All branches</option>
          {['Ar Rayyan', 'Hittin', 'Malqa'].map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        {tab === 'report' && reportRows.length > 0 && (
          <button onClick={exportReport} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#16a34a', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            ⬇ Export Excel
          </button>
        )}
      </div>

      {/* Violations tab */}
      {tab === 'violations' && (
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--admin-thead)', borderBottom: '1.5px solid var(--admin-border2)' }}>
                  {['Employee', 'Branch', 'Violation', 'Comment', 'Deduction', 'Logged by', 'Date', ''].map((h, i) => (
                    <th key={h || i} style={{ padding: '11px 14px', textAlign: i === 4 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periodViolations.map((v, idx) => (
                  <tr key={v.id} style={{ borderBottom: idx < periodViolations.length - 1 ? '1px solid var(--admin-border2)' : 'none' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--admin-text)' }}>{v.employee_name}</td>
                    <td style={{ padding: '11px 14px' }}>{branchPill(v.branch)}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--admin-text)', maxWidth: 220 }}>{v.violation}</td>
                    <td style={{ padding: '11px 14px', color: '#64748b', fontStyle: v.comment ? 'italic' : 'normal', maxWidth: 260 }}>{v.comment || '—'}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>−{Number(v.deduction_amount)} SAR</td>
                    <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{v.logged_by || '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>{v.created_at?.slice(0, 10)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                      <button onClick={() => setDelConfirm(v)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 14 }}>✕</button>
                    </td>
                  </tr>
                ))}
                {periodViolations.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No violations logged for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Branch evaluations tab */}
      {tab === 'evaluations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {periodEvals.length === 0 && <div style={{ ...card, padding: 40, textAlign: 'center', color: '#94a3b8' }}>No branch evaluations for this period.</div>}
          {periodEvals.map(e => (
            <div key={e.id} style={{ ...card, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {branchPill(e.branch)}
                  <span style={{ color: '#f59e0b', fontSize: 18, letterSpacing: 2 }}>{'★'.repeat(e.rating)}<span style={{ color: '#cbd5e1' }}>{'★'.repeat(5 - e.rating)}</span></span>
                </div>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{e.evaluated_by || ''} · {e.created_at?.slice(0, 10)}</span>
              </div>
              {e.comment && <p style={{ fontSize: 14, color: 'var(--admin-text)', marginTop: 10, fontStyle: 'italic' }}>"{e.comment}"</p>}
            </div>
          ))}
        </div>
      )}

      {/* Monthly report tab */}
      {tab === 'report' && (
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--admin-border2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)' }}>Salary Deductions — {periodLabel(period)}</h2>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#dc2626' }}>Total: −{reportTotal.toFixed(2)} SAR</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--admin-thead)', borderBottom: '1.5px solid var(--admin-border2)' }}>
                  {['#', 'Employee', 'Branch', 'Violations', 'Total Deducted'].map((h, i) => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: i >= 3 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportRows.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--admin-border2)' }}>
                    <td style={{ padding: '11px 14px', color: '#94a3b8' }}>{idx + 1}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--admin-text)' }}>{r.name}</td>
                    <td style={{ padding: '11px 14px' }}>{branchPill(r.branch)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: '#64748b' }}>{r.count}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>−{r.total.toFixed(2)} SAR</td>
                  </tr>
                ))}
                {reportRows.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No deductions for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 20, padding: '28px 26px', maxWidth: 360, width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>Delete violation?</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>The <strong>−{Number(delConfirm.deduction_amount)} SAR</strong> deduction for <strong>{delConfirm.employee_name}</strong> will be removed.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDelConfirm(null)} style={{ flex: 1, padding: 11, borderRadius: 12, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: 11, borderRadius: 12, border: 'none', background: '#ef4444', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
