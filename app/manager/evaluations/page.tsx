'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { supabase } from '@/lib/supabase'
import { SEED_EMPLOYEES } from '@/lib/seed-data'
import {
  Violation, currentPeriod, periodLabel, violationsTableReady,
  fetchViolations, addViolation, fetchBranchEvaluations, addBranchEvaluation, BranchEvaluation,
} from '@/lib/violations-db'

const BRANCHES = ['Ar Rayyan', 'Hittin', 'Malqa']
const BRANCH_COLORS: Record<string, { text: string; bg: string }> = {
  'Ar Rayyan': { text: '#16a34a', bg: '#dcfce7' },
  'Hittin': { text: '#7c3aed', bg: '#ede9fe' },
  'Malqa': { text: '#2563eb', bg: '#dbeafe' },
}

interface Emp { id: number; name: string; position: string; branch: string; basic_salary: number }

function Stars({ value, onChange, size = 28 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)}
          style={{ background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default', padding: 0, lineHeight: 1, color: n <= value ? '#f59e0b' : '#cbd5e1', fontSize: size }}>
          ★
        </button>
      ))}
    </div>
  )
}

export default function ManagerEvaluations() {
  const period = currentPeriod()
  const [ready, setReady] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [branch, setBranch] = useState('')
  const [employees, setEmployees] = useState<Emp[]>([])
  const [violations, setViolations] = useState<Violation[]>([])
  const [evals, setEvals] = useState<BranchEvaluation[]>([])

  // branch rating draft
  const [rating, setRating] = useState(0)
  const [branchComment, setBranchComment] = useState('')
  const [savingEval, setSavingEval] = useState(false)

  // violation modal
  const [vModal, setVModal] = useState<{ emp: Emp } | null>(null)
  const [vText, setVText] = useState('')
  const [vAmount, setVAmount] = useState('')
  const [vComment, setVComment] = useState('')
  const [savingV, setSavingV] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    sb.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
    violationsTableReady().then(async (ok) => {
      setReady(ok)
      const { data } = await supabase.from('employees').select('id, name, position, branch, basic_salary').order('name')
      const raw = (data && data.length ? data : SEED_EMPLOYEES) as Emp[]
      setEmployees(raw)
      if (ok) {
        setViolations(await fetchViolations({ period }))
        setEvals(await fetchBranchEvaluations({ period }))
      }
    })
  }, [])

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const branchEmployees = employees.filter(e => e.branch === branch)
  const branchViolations = violations.filter(v => v.branch === branch)
  const existingEval = evals.find(e => e.branch === branch)

  async function saveEval() {
    if (!branch || !rating) return
    setSavingEval(true)
    const { error } = await addBranchEvaluation({ branch, rating, comment: branchComment || null, period, evaluated_by: email })
    if (!error) {
      flash('Branch evaluation saved ✓')
      setEvals(await fetchBranchEvaluations({ period }))
      setRating(0); setBranchComment('')
    } else flash('Error: ' + error)
    setSavingEval(false)
  }

  async function saveViolation() {
    if (!vModal || !vText.trim()) return
    setSavingV(true)
    const { error } = await addViolation({
      employee_id: vModal.emp.id, employee_name: vModal.emp.name, branch,
      violation: vText.trim(), comment: vComment.trim() || null,
      deduction_amount: Number(vAmount) || 0, period, logged_by: email,
    })
    if (!error) {
      flash(`Violation logged for ${vModal.emp.name} ✓`)
      setViolations(await fetchViolations({ period }))
      setVModal(null); setVText(''); setVAmount(''); setVComment('')
    } else flash('Error: ' + error)
    setSavingV(false)
  }

  const card: React.CSSProperties = { background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Evaluations & Violations</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>{periodLabel(period)} · rate branch performance and log employee violations</p>
      </div>

      {ready === false && (
        <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
          ⚠️ <strong>Setup needed.</strong> Run <code style={{ background: '#fef3c7', padding: '1px 6px', borderRadius: 6 }}>scripts/violations-schema.sql</code> once in the Supabase SQL Editor, then refresh.
        </div>
      )}

      {/* Branch selector */}
      <div style={{ ...card, padding: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Select Branch</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {BRANCHES.map(b => {
            const c = BRANCH_COLORS[b]
            const active = branch === b
            return (
              <button key={b} onClick={() => { setBranch(b); setRating(0); setBranchComment('') }}
                style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: '1.5px solid', borderColor: active ? c.text : '#e2e8f0', background: active ? c.bg : 'white', color: active ? c.text : '#475569' }}>
                {b}
              </button>
            )
          })}
        </div>
      </div>

      {!branch && <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', padding: 24 }}>Pick a branch to begin.</p>}

      {branch && (
        <>
          {/* Branch evaluation */}
          <div style={{ ...card, padding: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Branch Performance — {branch}</h2>
            {existingEval && (
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                Already rated this month: <strong style={{ color: '#f59e0b' }}>{'★'.repeat(existingEval.rating)}</strong>
                {existingEval.comment ? ` — "${existingEval.comment}"` : ''}. Submitting again adds a new entry.
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
              <Stars value={rating} onChange={setRating} />
              <textarea value={branchComment} onChange={e => setBranchComment(e.target.value)} rows={2}
                placeholder="Comment on the branch's overall performance (optional)…" style={inputStyle} />
              <button onClick={saveEval} disabled={!rating || savingEval}
                style={{ alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 10, border: 'none', background: rating ? '#f59e0b' : '#cbd5e1', color: 'white', fontSize: 13, fontWeight: 700, cursor: rating ? 'pointer' : 'not-allowed' }}>
                {savingEval ? 'Saving…' : 'Save Branch Rating'}
              </button>
            </div>
          </div>

          {/* Employees in branch */}
          <div style={{ ...card, padding: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Employees — {branch} ({branchEmployees.length})</h2>
            {branchEmployees.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 14 }}>No employees recorded for this branch.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {branchEmployees.map(emp => {
                  const empViolations = branchViolations.filter(v => v.employee_id === emp.id)
                  const total = empViolations.reduce((s, v) => s + Number(v.deduction_amount), 0)
                  return (
                    <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 10, background: '#f8fafc' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{emp.name}</p>
                        <p style={{ fontSize: 12, color: '#64748b' }}>{emp.position || '—'}
                          {empViolations.length > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {empViolations.length} violation{empViolations.length > 1 ? 's' : ''} · −{total} SAR</span>}
                        </p>
                      </div>
                      <button onClick={() => { setVModal({ emp }); setVText(''); setVAmount(''); setVComment('') }}
                        style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 9, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        + Violation
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* This month's violations for the branch */}
          {branchViolations.length > 0 && (
            <div style={{ ...card, padding: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Logged this month — {branch}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {branchViolations.map(v => (
                  <div key={v.id} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{v.employee_name}</span>
                      <span style={{ fontWeight: 700, color: '#dc2626', fontSize: 14, flexShrink: 0 }}>−{Number(v.deduction_amount)} SAR</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#334155', marginTop: 2 }}>{v.violation}</p>
                    {v.comment && <p style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontStyle: 'italic' }}>"{v.comment}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Violation modal */}
      {vModal && (
        <div onClick={() => setVModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 18, padding: 24, maxWidth: 440, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>Log Violation</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>{vModal.emp.name} · {branch}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Violation</label>
                <input value={vText} onChange={e => setVText(e.target.value)} autoFocus placeholder="e.g. Arrived 45 min late" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Deduction (SAR)</label>
                <input type="number" min="0" step="any" value={vAmount} onChange={e => setVAmount(e.target.value)} placeholder="0" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Comment / details</label>
                <textarea value={vComment} onChange={e => setVComment(e.target.value)} rows={3} placeholder="Explain the violation…" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setVModal(null)} style={{ flex: 1, padding: 11, borderRadius: 11, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveViolation} disabled={!vText.trim() || savingV} style={{ flex: 2, padding: 11, borderRadius: 11, border: 'none', background: vText.trim() ? '#dc2626' : '#cbd5e1', fontSize: 13, fontWeight: 700, color: 'white', cursor: vText.trim() ? 'pointer' : 'not-allowed' }}>
                {savingV ? 'Saving…' : 'Log Violation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: toast.startsWith('Error') ? '#dc2626' : '#0f172a', color: 'white', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 300, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
