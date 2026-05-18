'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_EMPLOYEES } from '@/lib/seed-data'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import * as XLSX from 'xlsx'

type VacationStatus = 'none' | 'on_vacation' | 'taken'

interface Employee {
  id: number; name: string; iqama: string; iban: string
  basic_salary: number; position: string; branch: string; shift: string
  ot_hours: number; ot_rate: number; ot_pay: number; net_pay: number
  salary_paid: boolean; vacation_status: VacationStatus; restaurant?: string
}

const BRANCHES = ['Ar Rayyan', 'Hittin', 'Malqa', '']
const SHIFTS = ['Morning', 'Night', 'Double Shift', 'Evening', '']
const POSITIONS = ['Manager', 'Operation Manager', 'Head Chef', 'Bakery Chef', 'Grill', 'Pie', 'Cashier / Salad / Prep', 'Pie / Cashier', 'Pie / Grill / Cashier', 'Preparation', 'Salad / Preparation', '']

const BRANCH_COLORS: Record<string, { text: string; bg: string }> = {
  'Ar Rayyan': { text: '#16a34a', bg: '#dcfce7' },
  'Hittin': { text: '#7c3aed', bg: '#ede9fe' },
  'Malqa': { text: '#2563eb', bg: '#dbeafe' },
}
const SHIFT_COLORS: Record<string, { text: string; bg: string }> = {
  'Morning': { text: '#d97706', bg: '#fef3c7' },
  'Night': { text: '#4f46e5', bg: '#e0e7ff' },
  'Double Shift': { text: '#ea580c', bg: '#fff7ed' },
  'Evening': { text: '#db2777', bg: '#fce7f3' },
}
const CHART_COLORS = ['#25D366', '#7c3aed', '#2563eb', '#f59e0b', '#ef4444', '#10b981']

const EMPTY_EMP: Omit<Employee, 'id' | 'ot_rate' | 'ot_pay' | 'net_pay'> = {
  name: '', iqama: '', iban: '', basic_salary: 1500, position: '', branch: 'Ar Rayyan',
  shift: 'Morning', ot_hours: 0, salary_paid: false, vacation_status: 'none', restaurant: 'Appetie',
}
type SortKey = keyof Employee
type SortDir = 'asc' | 'desc'

/* ── Icons ────────────────────────── */
const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const TrashIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

function ConfirmDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', maxWidth: 360, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.18)', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444' }}>
          <TrashIcon size={22} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Remove Employee?</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}><strong>"{name}"</strong> will be permanently removed.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#ef4444', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Remove</button>
        </div>
      </div>
    </div>
  )
}

function calcOT(basic: number, otHrs: number, multiplier: number) {
  const rate = basic / 30 / 8 * multiplier
  return { ot_rate: rate, ot_pay: rate * otHrs, net_pay: basic + rate * otHrs }
}

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/></svg>
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points={dir === 'asc' ? '5 12 12 5 19 12' : '5 12 12 19 19 12'}/></svg>
}

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [multiplier, setMultiplier] = useState(1.25)
  const [modal, setModal] = useState<{ open: boolean; emp: Partial<Employee> | null }>({ open: false, emp: null })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterBranch, setFilterBranch] = useState('all')
  const [filterShift, setFilterShift] = useState('all')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'id', dir: 'asc' })
  const [editingOT, setEditingOT] = useState<number | null>(null)
  const [otDraft, setOtDraft] = useState('')
  const [status, setStatus] = useState('')
  const [delConfirm, setDelConfirm] = useState<{ id: number; name: string } | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data } = await supabase.from('employees').select('*').order('id')
    if (data && data.length > 0) {
      setEmployees(data.map(e => recompute(e, multiplier)))
    } else {
      setEmployees(SEED_EMPLOYEES.map(e => {
        const { ot_rate, ot_pay, net_pay } = calcOT(e.basic_salary, e.ot_hours, multiplier)
        return { ...e, ot_rate, ot_pay, net_pay } as Employee
      }))
    }
    setLoading(false)
  }

  function recompute(e: any, mult: number): Employee {
    const { ot_rate, ot_pay, net_pay } = calcOT(e.basic_salary, e.ot_hours, mult)
    return { ...e, ot_rate, ot_pay, net_pay }
  }

  function handleMultiplierChange(v: number) {
    setMultiplier(v)
    setEmployees(prev => prev.map(e => recompute(e, v)))
  }

  async function toggleSalaryPaid(emp: Employee) {
    const updated = { ...emp, salary_paid: !emp.salary_paid }
    setEmployees(prev => prev.map(e => e.id === emp.id ? updated : e))
    await supabase.from('employees').update({ salary_paid: updated.salary_paid }).eq('id', emp.id)
  }

  async function cycleVacation(emp: Employee) {
    const next: VacationStatus = emp.vacation_status === 'none' ? 'on_vacation' : emp.vacation_status === 'on_vacation' ? 'taken' : 'none'
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, vacation_status: next } : e))
    await supabase.from('employees').update({ vacation_status: next }).eq('id', emp.id)
  }

  async function saveOTInline(emp: Employee) {
    const hrs = parseFloat(otDraft) || 0
    const { ot_rate, ot_pay, net_pay } = calcOT(emp.basic_salary, hrs, multiplier)
    const updated = { ...emp, ot_hours: hrs, ot_rate, ot_pay, net_pay }
    setEmployees(prev => prev.map(e => e.id === emp.id ? updated : e))
    setEditingOT(null)
    await supabase.from('employees').update({ ot_hours: hrs, ot_rate, ot_pay, net_pay }).eq('id', emp.id)
  }

  async function confirmDeleteEmp() {
    if (!delConfirm) return
    await supabase.from('employees').delete().eq('id', delConfirm.id)
    setEmployees(prev => prev.filter(e => e.id !== delConfirm.id))
    setDelConfirm(null)
  }

  function openAdd() {
    const { ot_rate, ot_pay, net_pay } = calcOT(EMPTY_EMP.basic_salary, 0, multiplier)
    setModal({ open: true, emp: { ...EMPTY_EMP, ot_rate, ot_pay, net_pay } })
  }

  async function saveEmp() {
    if (!modal.emp) return
    setSaving(true)
    const e = modal.emp
    const { ot_rate, ot_pay, net_pay } = calcOT(e.basic_salary || 0, e.ot_hours || 0, multiplier)
    const payload = { ...e, ot_rate, ot_pay, net_pay }
    try {
      if (e.id) {
        const { error } = await supabase.from('employees').update(payload).eq('id', e.id)
        if (error) throw error
      } else {
        const newId = Math.max(...employees.map(x => x.id), 0) + 1
        const { error } = await supabase.from('employees').insert({ ...payload, id: newId })
        if (error) throw error
      }
      setModal({ open: false, emp: null }); loadData()
    } catch (err: any) { setStatus('Error: ' + err.message) }
    setSaving(false)
  }

  function exportExcel() {
    const rows = filtered.map((e, i) => ({
      '#': i + 1, Name: e.name, Iqama: e.iqama, IBAN: e.iban,
      Position: e.position, Branch: e.branch, Shift: e.shift,
      'Basic SAR': e.basic_salary, 'OT Hours': e.ot_hours,
      'OT Rate': e.ot_rate.toFixed(4), 'OT Pay': e.ot_pay.toFixed(2),
      'Net Pay': e.net_pay.toFixed(2), 'Salary Paid': e.salary_paid ? 'Yes' : 'No',
      Vacation: e.vacation_status,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll')
    XLSX.writeFile(wb, `Appetie_Payroll_${new Date().toLocaleString('default', { month: 'long' })}_2025.xlsx`)
  }

  function sortBy(key: SortKey) {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const filtered = employees
    .filter(e => {
      const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.position.toLowerCase().includes(search.toLowerCase())
      const matchBranch = filterBranch === 'all' || e.branch === filterBranch
      const matchShift = filterShift === 'all' || e.shift === filterShift
      return matchSearch && matchBranch && matchShift
    })
    .sort((a, b) => {
      const va = a[sort.key] ?? 0; const vb = b[sort.key] ?? 0
      if (va < vb) return sort.dir === 'asc' ? -1 : 1
      if (va > vb) return sort.dir === 'asc' ? 1 : -1
      return 0
    })

  const totalBasic = employees.reduce((s, e) => s + e.basic_salary, 0)
  const totalOTHrs = employees.reduce((s, e) => s + e.ot_hours, 0)
  const totalOTPay = employees.reduce((s, e) => s + e.ot_pay, 0)
  const totalNet = employees.reduce((s, e) => s + e.net_pay, 0)
  const paidCount = employees.filter(e => e.salary_paid).length
  const vacationCount = employees.filter(e => e.vacation_status === 'on_vacation').length

  const topOT = [...employees].filter(e => e.ot_hours > 0).sort((a, b) => b.ot_hours - a.ot_hours).slice(0, 8).map(e => ({ name: e.name.split(' ')[0], hrs: e.ot_hours }))
  const branchSalary = ['Ar Rayyan', 'Hittin', 'Malqa'].map((b, i) => ({
    name: b, color: CHART_COLORS[i],
    value: Math.round(employees.filter(e => e.branch === b).reduce((s, e) => s + e.net_pay, 0)),
  })).filter(b => b.value > 0)

  const summaryCards = [
    { label: 'Employees', value: employees.length, color: '#25D366' },
    { label: 'Basic Salary', value: `${totalBasic.toLocaleString()} SAR`, color: '#6366f1' },
    { label: 'OT Hours', value: totalOTHrs.toFixed(1), color: '#f59e0b' },
    { label: 'OT Cost', value: `${totalOTPay.toFixed(0)} SAR`, color: '#ef4444' },
    { label: 'Net Pay', value: `${totalNet.toFixed(0)} SAR`, color: '#10b981' },
    { label: 'Salary Paid', value: `${paidCount} / ${employees.length}`, color: '#0891b2' },
    { label: 'On Vacation', value: vacationCount, color: '#d97706' },
  ]

  const TH = ({ label, sortKey }: { label: string; sortKey?: SortKey }) => (
    <th style={{ padding: '11px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', cursor: sortKey ? 'pointer' : 'default', userSelect: 'none' }}
      onClick={() => sortKey && sortBy(sortKey)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        {sortKey && <SortArrow active={sort.key === sortKey} dir={sort.dir} />}
      </span>
    </th>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>HR & Payroll</h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>{employees.length} employees · Current month payroll</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* OT Multiplier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '6px 10px' }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginRight: 4 }}>OT:</span>
            {[1.0, 1.25, 1.5].map(v => (
              <button key={v} onClick={() => handleMultiplierChange(v)} style={{
                padding: '4px 10px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: multiplier === v ? '#25D366' : 'transparent', color: multiplier === v ? 'white' : '#64748b',
                transition: 'all 0.15s',
              }}>{v}x</button>
            ))}
          </div>
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#25D366', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,211,102,0.35)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Employee
          </button>
        </div>
      </div>

      {status && <div style={{ padding: '10px 16px', background: '#fef2f2', borderRadius: 10, fontSize: 13, color: '#dc2626', border: '1px solid #fecaca' }}>{status}</div>}

      {/* Summary Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
          {Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ height: 80, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9' }} className="shimmer" />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
          {summaryCards.map((card, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderTop: `3px solid ${card.color}` }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: 4 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {!loading && (topOT.length > 0 || branchSalary.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {topOT.length > 0 && (
            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Top OT Hours</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topOT} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="hrs" fill="#25D366" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {branchSalary.length > 0 && (
            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Net Pay by Branch</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={branchSalary} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {branchSalary.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${Number(v).toLocaleString()} SAR`} />
                  <Legend iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="admin-input" style={{ paddingLeft: 34 }} />
        </div>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="admin-select" style={{ width: 'auto', minWidth: 140 }}>
          <option value="all">All Branches</option>
          {BRANCHES.filter(b => b).map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterShift} onChange={e => setFilterShift(e.target.value)} className="admin-select" style={{ width: 'auto', minWidth: 120 }}>
          <option value="all">All Shifts</option>
          {SHIFTS.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: 'white', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' }}>
                <TH label="#" sortKey="id" />
                <TH label="Name" sortKey="name" />
                <TH label="Position" sortKey="position" />
                <TH label="Branch" sortKey="branch" />
                <TH label="Shift" sortKey="shift" />
                <th style={{ padding: '11px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => sortBy('basic_salary')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Basic <SortArrow active={sort.key === 'basic_salary'} dir={sort.dir} /></span>
                </th>
                <th style={{ padding: '11px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => sortBy('ot_hours')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>OT Hrs <SortArrow active={sort.key === 'ot_hours'} dir={sort.dir} /></span>
                </th>
                <th style={{ padding: '11px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OT Rate</th>
                <th style={{ padding: '11px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OT Pay</th>
                <th style={{ padding: '11px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => sortBy('net_pay')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Net Pay <SortArrow active={sort.key === 'net_pay'} dir={sort.dir} /></span>
                </th>
                <th style={{ padding: '11px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paid</th>
                <th style={{ padding: '11px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vacation</th>
                <th style={{ padding: '11px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, idx) => {
                const branchColor = BRANCH_COLORS[emp.branch]
                const shiftColor = SHIFT_COLORS[emp.shift]
                const isEditingThis = editingOT === emp.id
                return (
                  <tr key={emp.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}
                    onMouseOver={e => (e.currentTarget.style.background = '#fafbfc')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '11px 12px', color: '#94a3b8', fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <p style={{ fontWeight: 600, color: '#0f172a', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>{emp.iqama || '–'}</p>
                    </td>
                    <td style={{ padding: '11px 12px', color: '#64748b', fontSize: 12, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.position || '–'}</td>
                    <td style={{ padding: '11px 12px' }}>
                      {emp.branch ? (
                        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 600,
                          color: branchColor?.text ?? '#374151', background: branchColor?.bg ?? '#f3f4f6' }}>
                          {emp.branch}
                        </span>
                      ) : <span style={{ color: '#cbd5e1' }}>–</span>}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      {emp.shift ? (
                        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 600,
                          color: shiftColor?.text ?? '#374151', background: shiftColor?.bg ?? '#f3f4f6' }}>
                          {emp.shift}
                        </span>
                      ) : <span style={{ color: '#cbd5e1' }}>–</span>}
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{emp.basic_salary.toLocaleString()}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'right' }}>
                      {isEditingThis ? (
                        <input type="number" value={otDraft} autoFocus
                          onChange={e => setOtDraft(e.target.value)}
                          onBlur={() => saveOTInline(emp)}
                          onKeyDown={e => e.key === 'Enter' && saveOTInline(emp)}
                          style={{ width: 64, border: '1.5px solid #25D366', borderRadius: 7, padding: '3px 8px', fontSize: 12, textAlign: 'right', outline: 'none', background: 'white' }} />
                      ) : (
                        <span onClick={() => { setEditingOT(emp.id); setOtDraft(String(emp.ot_hours)) }}
                          title="Click to edit"
                          style={{ cursor: 'pointer', fontWeight: 600, color: emp.ot_hours > 0 ? '#25D366' : '#94a3b8', borderBottom: '1px dashed', borderColor: emp.ot_hours > 0 ? '#25D366' : '#cbd5e1' }}>
                          {emp.ot_hours || '0'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', color: '#64748b', fontSize: 12 }}>{emp.ot_rate.toFixed(2)}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', color: '#475569' }}>{emp.ot_pay.toFixed(2)}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 800, color: '#25D366' }}>{emp.net_pay.toFixed(2)}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                      <button onClick={() => toggleSalaryPaid(emp)} title={emp.salary_paid ? 'Mark unpaid' : 'Mark paid'}
                        style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: emp.salary_paid ? '#dcfce7' : '#fef2f2', color: emp.salary_paid ? '#16a34a' : '#ef4444', transition: 'all 0.15s' }}>
                        {emp.salary_paid ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                      <button onClick={() => cycleVacation(emp)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                        background: emp.vacation_status === 'on_vacation' ? '#fef3c7' : emp.vacation_status === 'taken' ? '#dbeafe' : '#f1f5f9',
                        color: emp.vacation_status === 'on_vacation' ? '#d97706' : emp.vacation_status === 'taken' ? '#2563eb' : '#94a3b8' }}>
                        {emp.vacation_status === 'on_vacation' ? 'On Leave' : emp.vacation_status === 'taken' ? 'Taken' : 'None'}
                      </button>
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button className="ibtn ibtn-edit" onClick={() => setModal({ open: true, emp: { ...emp } })} title="Edit"><PencilIcon /></button>
                        <button className="ibtn ibtn-del" onClick={() => setDelConfirm({ id: emp.id, name: emp.name })} title="Delete"><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={13} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No employees found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Modal */}
      {modal.open && modal.emp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 25px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderTop: '4px solid #25D366', borderRadius: '20px 20px 0 0', padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{modal.emp.id ? 'Edit Employee' : 'Add Employee'}</h2>
              <button className="ibtn ibtn-edit" onClick={() => setModal({ open: false, emp: null })}><CloseIcon /></button>
            </div>
            <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Full Name</label>
                <input type="text" value={modal.emp.name || ''} className="admin-input"
                  onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, name: e.target.value } }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Iqama No.</label>
                  <input type="text" value={modal.emp.iqama || ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, iqama: e.target.value } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>IBAN</label>
                  <input type="text" value={modal.emp.iban || ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, iban: e.target.value } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Basic Salary (SAR)</label>
                  <input type="number" value={modal.emp.basic_salary || ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, basic_salary: Number(e.target.value) } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>OT Hours</label>
                  <input type="number" value={modal.emp.ot_hours ?? ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, ot_hours: Number(e.target.value) } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Position</label>
                  <input list="positions" type="text" value={modal.emp.position || ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, position: e.target.value } }))} />
                  <datalist id="positions">{POSITIONS.filter(p => p).map(p => <option key={p} value={p} />)}</datalist>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Branch</label>
                  <select value={modal.emp.branch || ''} className="admin-select"
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, branch: e.target.value } }))}>
                    <option value="">Select...</option>
                    {BRANCHES.filter(b => b).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Shift</label>
                  <select value={modal.emp.shift || ''} className="admin-select"
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, shift: e.target.value } }))}>
                    <option value="">Select...</option>
                    {SHIFTS.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Restaurant</label>
                  <input list="restaurants" type="text" value={modal.emp.restaurant || ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, restaurant: e.target.value } }))} />
                  <datalist id="restaurants"><option value="Appetie" /><option value="Ghabashi" /><option value="Piece Bakery" /></datalist>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Vacation Status</label>
                  <select value={modal.emp.vacation_status || 'none'} className="admin-select"
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, vacation_status: e.target.value as VacationStatus } }))}>
                    <option value="none">None</option>
                    <option value="on_vacation">On Vacation</option>
                    <option value="taken">Taken</option>
                  </select>
                </div>
              </div>

              {/* OT Preview */}
              {(modal.emp.basic_salary || 0) > 0 && (
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'OT Rate', value: `${(((modal.emp.basic_salary || 0) / 30 / 8) * multiplier).toFixed(3)} SAR/hr` },
                    { label: 'OT Pay', value: `${((((modal.emp.basic_salary || 0) / 30 / 8) * multiplier) * (modal.emp.ot_hours || 0)).toFixed(2)} SAR` },
                    { label: 'Net Pay', value: `${((modal.emp.basic_salary || 0) + (((modal.emp.basic_salary || 0) / 30 / 8) * multiplier) * (modal.emp.ot_hours || 0)).toFixed(2)} SAR`, green: true },
                  ].map(r => (
                    <div key={r.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{r.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: (r as any).green ? '#25D366' : '#0f172a' }}>{r.value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
                <input type="checkbox" id="spaid" checked={modal.emp.salary_paid ?? false}
                  onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, salary_paid: e.target.checked } }))} />
                <label htmlFor="spaid" style={{ fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Salary Paid</label>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
              <button onClick={() => setModal({ open: false, emp: null })} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveEmp} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: '#25D366', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : 'Save Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && <ConfirmDialog name={delConfirm.name} onConfirm={confirmDeleteEmp} onCancel={() => setDelConfirm(null)} />}
    </div>
  )
}
