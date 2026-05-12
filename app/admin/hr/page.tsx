'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_EMPLOYEES } from '@/lib/seed-data'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import * as XLSX from 'xlsx'

type VacationStatus = 'none' | 'on_vacation' | 'taken'

interface Employee {
  id: number
  name: string
  iqama: string
  iban: string
  basic_salary: number
  position: string
  branch: string
  shift: string
  ot_hours: number
  ot_rate: number
  ot_pay: number
  net_pay: number
  salary_paid: boolean
  vacation_status: VacationStatus
  restaurant?: string
}

const BRANCHES = ['Ar Rayyan', 'Hittin', 'Malqa', '']
const SHIFTS = ['Morning', 'Night', 'Double Shift', 'Evening', '']
const POSITIONS = ['Manager', 'Operation Manager', 'Head Chef', 'Bakery Chef', 'Grill', 'Pie', 'Cashier / Salad / Prep', 'Pie / Cashier', 'Pie / Grill / Cashier', 'Preparation', 'Salad / Preparation', '']

const BRANCH_COLORS: Record<string, { text: string; bg: string }> = {
  'Ar Rayyan': { text: '#5b8a3c', bg: '#eaf3e0' },
  'Hittin': { text: '#7c3aed', bg: '#ede9fe' },
  'Malqa': { text: '#2563eb', bg: '#dbeafe' },
}

const SHIFT_COLORS: Record<string, { text: string; bg: string }> = {
  'Morning': { text: '#d97706', bg: '#fef3c7' },
  'Night': { text: '#4f46e5', bg: '#e0e7ff' },
  'Double Shift': { text: '#ea580c', bg: '#fff7ed' },
  'Evening': { text: '#db2777', bg: '#fce7f3' },
}

const CHART_COLORS = ['#5b8a3c', '#7c3aed', '#2563eb', '#f59e0b', '#ef4444', '#10b981']

const EMPTY_EMP: Omit<Employee, 'id' | 'ot_rate' | 'ot_pay' | 'net_pay'> = {
  name: '', iqama: '', iban: '', basic_salary: 1500, position: '', branch: 'Ar Rayyan',
  shift: 'Morning', ot_hours: 0, salary_paid: false, vacation_status: 'none', restaurant: 'Appetie',
}

type SortKey = keyof Employee
type SortDir = 'asc' | 'desc'

function calcOT(basic: number, otHrs: number, multiplier: number) {
  const rate = basic / 30 / 8 * multiplier
  const pay = rate * otHrs
  return { ot_rate: rate, ot_pay: pay, net_pay: basic + pay }
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

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data } = await supabase.from('employees').select('*').order('id')
    if (data && data.length > 0) {
      setEmployees(data.map(recompute))
    } else {
      setEmployees(SEED_EMPLOYEES.map(e => {
        const { ot_rate, ot_pay, net_pay } = calcOT(e.basic_salary, e.ot_hours, multiplier)
        return { ...e, ot_rate, ot_pay, net_pay } as Employee
      }))
    }
    setLoading(false)
  }

  function recompute(e: any): Employee {
    const { ot_rate, ot_pay, net_pay } = calcOT(e.basic_salary, e.ot_hours, multiplier)
    return { ...e, ot_rate, ot_pay, net_pay }
  }

  function recomputeAll(mult: number, emps: Employee[]) {
    return emps.map(e => {
      const { ot_rate, ot_pay, net_pay } = calcOT(e.basic_salary, e.ot_hours, mult)
      return { ...e, ot_rate, ot_pay, net_pay }
    })
  }

  function handleMultiplierChange(v: number) {
    setMultiplier(v)
    setEmployees(prev => recomputeAll(v, prev))
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

  async function deleteEmp(id: number) {
    if (!confirm('Delete this employee?')) return
    await supabase.from('employees').delete().eq('id', id)
    setEmployees(prev => prev.filter(e => e.id !== id))
  }

  function openAdd() {
    const { ot_rate, ot_pay, net_pay } = calcOT(EMPTY_EMP.basic_salary, 0, multiplier)
    setModal({ open: true, emp: { ...EMPTY_EMP, ot_rate, ot_pay, net_pay } })
  }

  function openEdit(emp: Employee) {
    setModal({ open: true, emp: { ...emp } })
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
      setModal({ open: false, emp: null })
      loadData()
    } catch (err: any) {
      setStatus('Error: ' + err.message)
    }
    setSaving(false)
  }

  function exportExcel() {
    const rows = filtered.map((e, i) => ({
      '#': i + 1,
      Name: e.name,
      Iqama: e.iqama,
      IBAN: e.iban,
      Position: e.position,
      Branch: e.branch,
      Shift: e.shift,
      'Basic SAR': e.basic_salary,
      'OT Hours': e.ot_hours,
      'OT Rate': e.ot_rate.toFixed(4),
      'OT Pay': e.ot_pay.toFixed(2),
      'Net Pay': e.net_pay.toFixed(2),
      'Salary Paid': e.salary_paid ? 'Yes' : 'No',
      Vacation: e.vacation_status,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll')
    XLSX.writeFile(wb, `Appetie_Payroll_${new Date().toLocaleString('default', { month: 'long' })}_2025.xlsx`)
  }

  function importExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(ws)
      setStatus(`Imported ${rows.length} rows (preview only - not saved to Supabase yet)`)
    }
    reader.readAsArrayBuffer(file)
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
      const va = a[sort.key] ?? 0
      const vb = b[sort.key] ?? 0
      if (va < vb) return sort.dir === 'asc' ? -1 : 1
      if (va > vb) return sort.dir === 'asc' ? 1 : -1
      return 0
    })

  // Summary stats
  const totalBasic = employees.reduce((s, e) => s + e.basic_salary, 0)
  const totalOTHrs = employees.reduce((s, e) => s + e.ot_hours, 0)
  const totalOTPay = employees.reduce((s, e) => s + e.ot_pay, 0)
  const totalNet = employees.reduce((s, e) => s + e.net_pay, 0)
  const paidCount = employees.filter(e => e.salary_paid).length
  const vacationCount = employees.filter(e => e.vacation_status === 'on_vacation').length

  // Chart data
  const topOT = [...employees]
    .filter(e => e.ot_hours > 0)
    .sort((a, b) => b.ot_hours - a.ot_hours)
    .slice(0, 8)
    .map(e => ({ name: e.name.split(' ')[0], hrs: e.ot_hours }))

  const branchSalary = ['Ar Rayyan', 'Hittin', 'Malqa'].map((b, i) => ({
    name: b,
    value: Math.round(employees.filter(e => e.branch === b).reduce((s, e) => s + e.net_pay, 0)),
    color: CHART_COLORS[i],
  })).filter(b => b.value > 0)

  const summaryCards = [
    { label: 'Total Employees', value: employees.length, icon: '👥', color: '#5b8a3c' },
    { label: 'Total Basic', value: `${totalBasic.toLocaleString()} SAR`, icon: '💵', color: '#6366f1' },
    { label: 'Total OT Hours', value: totalOTHrs.toFixed(1), icon: '⏱️', color: '#f59e0b' },
    { label: 'Total OT Cost', value: `${totalOTPay.toFixed(0)} SAR`, icon: '💸', color: '#ef4444' },
    { label: 'Total Net Pay', value: `${totalNet.toFixed(0)} SAR`, icon: '💰', color: '#10b981' },
    { label: 'Salary Paid', value: `${paidCount} / ${employees.length}`, icon: '✅', color: '#0891b2' },
    { label: 'On Vacation', value: vacationCount, icon: '🏖️', color: '#d97706' },
  ]

  function SortIcon({ k }: { k: string }) {
    if (sort.key !== k) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-brand ml-1" style={{ color: '#5b8a3c' }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Appetie HR</h1>
          <p className="text-sm text-gray-500 mt-1">January 2025 Payroll · {employees.length} employees</p>
        </div>
        <div className="flex items-center gap-3">
          {/* OT Multiplier */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <span className="text-xs text-gray-500 font-medium">OT:</span>
            {[1.0, 1.25, 1.5].map(v => (
              <button key={v} onClick={() => handleMultiplierChange(v)}
                className={`text-xs px-2 py-1 rounded-lg font-semibold transition ${
                  multiplier === v ? 'text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
                style={multiplier === v ? { background: '#5b8a3c' } : {}}>
                {v}x
              </button>
            ))}
          </div>
          <button onClick={openAdd}
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90"
            style={{ background: '#5b8a3c' }}>
            + Add Employee
          </button>
        </div>
      </div>

      {status && <p className="text-sm text-gray-500 mb-4">{status}</p>}

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
          {summaryCards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-xl mb-1">{card.icon}</div>
              <div className="text-lg font-bold text-gray-900 leading-tight">{card.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {!loading && (topOT.length > 0 || branchSalary.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {topOT.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Top OT Hours</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topOT} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="hrs" fill="#5b8a3c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {branchSalary.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Net Pay by Branch</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={branchSalary} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {branchSalary.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
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
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input type="text" placeholder="Search employees..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
          <option value="all">All Branches</option>
          {BRANCHES.filter(b => b).map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterShift} onChange={e => setFilterShift(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
          <option value="all">All Shifts</option>
          {SHIFTS.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
          ⬇ Export Excel
        </button>
        <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
          ⬆ Import Excel
          <input type="file" accept=".xlsx,.xls" className="hidden" onChange={importExcel} />
        </label>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-3 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer" onClick={() => sortBy('id')}>#<SortIcon k="id" /></th>
                <th className="text-left px-3 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer" onClick={() => sortBy('name')}>Name<SortIcon k="name" /></th>
                <th className="text-left px-3 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer" onClick={() => sortBy('position')}>Position<SortIcon k="position" /></th>
                <th className="text-left px-3 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer" onClick={() => sortBy('branch')}>Branch<SortIcon k="branch" /></th>
                <th className="text-left px-3 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer" onClick={() => sortBy('shift')}>Shift<SortIcon k="shift" /></th>
                <th className="text-right px-3 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer" onClick={() => sortBy('basic_salary')}>Basic<SortIcon k="basic_salary" /></th>
                <th className="text-right px-3 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer" onClick={() => sortBy('ot_hours')}>OT Hrs<SortIcon k="ot_hours" /></th>
                <th className="text-right px-3 py-3 text-xs font-bold text-gray-400 uppercase">OT Rate</th>
                <th className="text-right px-3 py-3 text-xs font-bold text-gray-400 uppercase">OT Pay</th>
                <th className="text-right px-3 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer" onClick={() => sortBy('net_pay')}>Net Pay<SortIcon k="net_pay" /></th>
                <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase">Paid</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase">Vacation</th>
                <th className="text-right px-3 py-3 text-xs font-bold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp, idx) => {
                const branchColor = BRANCH_COLORS[emp.branch]
                const shiftColor = SHIFT_COLORS[emp.shift]
                const isEditingThis = editingOT === emp.id

                return (
                  <tr key={emp.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-gray-900 max-w-[160px] truncate">{emp.name}</p>
                      <p className="text-[10px] text-gray-400">{emp.iqama || '–'}</p>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs max-w-[120px] truncate">{emp.position || '–'}</td>
                    <td className="px-3 py-2.5">
                      {emp.branch ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={branchColor ? { color: branchColor.text, background: branchColor.bg } : { color: '#374151', background: '#f3f4f6' }}>
                          {emp.branch}
                        </span>
                      ) : <span className="text-gray-300">–</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {emp.shift ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={shiftColor ? { color: shiftColor.text, background: shiftColor.bg } : { color: '#374151', background: '#f3f4f6' }}>
                          {emp.shift}
                        </span>
                      ) : <span className="text-gray-300">–</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">{emp.basic_salary.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right">
                      {isEditingThis ? (
                        <input
                          type="number" value={otDraft} autoFocus
                          onChange={e => setOtDraft(e.target.value)}
                          onBlur={() => saveOTInline(emp)}
                          onKeyDown={e => e.key === 'Enter' && saveOTInline(emp)}
                          className="w-16 border border-gray-300 rounded px-1.5 py-0.5 text-xs text-right focus:outline-none"
                        />
                      ) : (
                        <span
                          onClick={() => { setEditingOT(emp.id); setOtDraft(String(emp.ot_hours)) }}
                          className="cursor-pointer hover:underline font-medium"
                          style={emp.ot_hours > 0 ? { color: '#5b8a3c' } : { color: '#9ca3af' }}
                          title="Click to edit">
                          {emp.ot_hours || '0'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-500 text-xs">{emp.ot_rate.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{emp.ot_pay.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right font-bold" style={{ color: '#5b8a3c' }}>{emp.net_pay.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button onClick={() => toggleSalaryPaid(emp)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition text-sm font-bold ${
                          emp.salary_paid ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'
                        }`}>
                        {emp.salary_paid ? '✓' : '✗'}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button onClick={() => cycleVacation(emp)}
                        className={`text-xs px-2 py-1 rounded-full font-semibold transition ${
                          emp.vacation_status === 'on_vacation' ? 'bg-amber-50 text-amber-600' :
                          emp.vacation_status === 'taken' ? 'bg-blue-50 text-blue-600' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                        {emp.vacation_status === 'on_vacation' ? '🏖 On Leave' :
                         emp.vacation_status === 'taken' ? '✓ Taken' : 'None'}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button onClick={() => openEdit(emp)} className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 mr-1.5">Edit</button>
                      <button onClick={() => deleteEmp(emp.id)} className="text-xs px-2.5 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50">Del</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Modal */}
      {modal.open && modal.emp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{modal.emp.id ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setModal({ open: false, emp: null })} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                  <input type="text" value={modal.emp.name || ''}
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, name: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Iqama No.</label>
                  <input type="text" value={modal.emp.iqama || ''}
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, iqama: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">IBAN</label>
                  <input type="text" value={modal.emp.iban || ''}
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, iban: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Basic Salary (SAR)</label>
                  <input type="number" value={modal.emp.basic_salary || ''}
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, basic_salary: Number(e.target.value) } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">OT Hours</label>
                  <input type="number" value={modal.emp.ot_hours ?? ''}
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, ot_hours: Number(e.target.value) } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Position</label>
                  <input list="positions" type="text" value={modal.emp.position || ''}
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, position: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                  <datalist id="positions">
                    {POSITIONS.filter(p => p).map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Branch</label>
                  <select value={modal.emp.branch || ''}
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, branch: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="">Select...</option>
                    {BRANCHES.filter(b => b).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Shift</label>
                  <select value={modal.emp.shift || ''}
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, shift: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="">Select...</option>
                    {SHIFTS.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Restaurant</label>
                  <input list="restaurants" type="text" value={modal.emp.restaurant || ''}
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, restaurant: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                  <datalist id="restaurants">
                    <option value="Appetie" />
                    <option value="Ghabashi" />
                    <option value="Bakery" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Vacation Status</label>
                  <select value={modal.emp.vacation_status || 'none'}
                    onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, vacation_status: e.target.value as VacationStatus } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="none">None</option>
                    <option value="on_vacation">On Vacation</option>
                    <option value="taken">Taken</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="spaid" checked={modal.emp.salary_paid ?? false}
                  onChange={e => setModal(m => ({ ...m, emp: { ...m.emp!, salary_paid: e.target.checked } }))} />
                <label htmlFor="spaid" className="text-sm text-gray-700">Salary Paid</label>
              </div>

              {/* OT Preview */}
              {(modal.emp.basic_salary || 0) > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
                  <p>OT Rate: <strong>{(((modal.emp.basic_salary || 0) / 30 / 8) * multiplier).toFixed(4)} SAR/hr</strong></p>
                  <p>OT Pay: <strong>{((((modal.emp.basic_salary || 0) / 30 / 8) * multiplier) * (modal.emp.ot_hours || 0)).toFixed(2)} SAR</strong></p>
                  <p>Net Pay: <strong style={{ color: '#5b8a3c' }}>{((modal.emp.basic_salary || 0) + (((modal.emp.basic_salary || 0) / 30 / 8) * multiplier) * (modal.emp.ot_hours || 0)).toFixed(2)} SAR</strong></p>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setModal({ open: false, emp: null })}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveEmp} disabled={saving}
                className="flex-1 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                style={{ background: '#5b8a3c' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
