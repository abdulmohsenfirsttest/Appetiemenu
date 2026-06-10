'use client'
import Link from 'next/link'
import { SEED_EMPLOYEES } from '@/lib/seed-data'

type Emp = typeof SEED_EMPLOYEES[0]

const SHIFT_COLORS: Record<string, { text: string; bg: string }> = {
  'Morning':      { text: '#d97706', bg: '#fef3c7' },
  'Evening':      { text: '#db2777', bg: '#fce7f3' },
  'Night':        { text: '#4f46e5', bg: '#e0e7ff' },
  'Double Shift': { text: '#ea580c', bg: '#fff7ed' },
}

const POSITION_COLORS: Record<string, string> = {
  'Supervisor': '#7c3aed',
  'Manager': '#7c3aed',
  'Operation Manager': '#7c3aed',
  'Head Chef': '#16a34a',
}

function EmpRow({ emp }: { emp: Emp }) {
  const sc = SHIFT_COLORS[emp.shift] || { text: '#64748b', bg: '#f1f5f9' }
  const isSup = ['Supervisor','Manager','Operation Manager','Head Chef'].includes(emp.position)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--admin-border2)' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: isSup ? '#7c3aed' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: isSup ? 'white' : '#475569' }}>{emp.name[0]}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
        {emp.position && <div style={{ fontSize: 11, color: POSITION_COLORS[emp.position] || '#64748b', fontWeight: 500 }}>{emp.position}</div>}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {emp.shift && <span style={{ background: sc.bg, color: sc.text, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{emp.shift}</span>}
        <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{emp.basic_salary.toLocaleString()}</span>
      </div>
    </div>
  )
}

export default function RestaurantDashboard({ restaurantKey, label, color, emoji }: {
  restaurantKey: string; label: string; color: string; emoji?: string
}) {
  const emps = SEED_EMPLOYEES.filter(e => e.restaurant === restaurantKey)
  const supervisors = emps.filter(e => ['Supervisor','Manager','Operation Manager','Head Chef'].includes(e.position))
  const totalSalary = emps.reduce((s, e) => s + e.basic_salary, 0)
  const branches = [...new Set(emps.map(e => e.branch).filter(Boolean))]

  const byBranch = branches.reduce<Record<string, Emp[]>>((acc, b) => {
    acc[b] = emps.filter(e => e.branch === b)
    return acc
  }, {})
  const noBranch = emps.filter(e => !e.branch)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Link href="/admin/bakery" style={{ fontSize: 12, color: '#64748b', textDecoration: 'none', border: '1px solid var(--admin-border)', borderRadius: 6, padding: '4px 10px' }}>← Back</Link>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)', margin: 0 }}>{label}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Staff', value: emps.length, color },
          { label: 'Supervisors', value: supervisors.length, color: '#7c3aed' },
          { label: 'Total Salary', value: `${totalSalary.toLocaleString()} SAR`, color: '#16a34a' },
          { label: 'Branches', value: branches.length, color: '#2563eb' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {branches.map(branch => (
        <div key={branch} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: '16px 20px', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--admin-text)', marginBottom: 4 }}>{branch}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{byBranch[branch].length} employees</div>
          {byBranch[branch].map(e => <EmpRow key={e.id} emp={e} />)}
        </div>
      ))}

      {noBranch.length > 0 && (
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--admin-text)', marginBottom: 4 }}>Unassigned</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{noBranch.length} employees</div>
          {noBranch.map(e => <EmpRow key={e.id} emp={e} />)}
        </div>
      )}
    </div>
  )
}
