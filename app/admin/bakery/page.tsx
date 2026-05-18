'use client'
import Link from 'next/link'
import { SEED_EMPLOYEES } from '@/lib/seed-data'

const RESTAURANTS = [
  { name: 'Ghabashi', slug: 'ghabashi', key: 'Ghabashi', color: '#7c3aed', bg: '#ede9fe', emoji: '🏪' },
  { name: 'Appetie', slug: 'appetie', key: 'Appetie', color: '#16a34a', bg: '#dcfce7', emoji: '🥗' },
  { name: 'Piece Bakery', slug: 'piece-bakery', key: 'Piece Bakery', color: '#c8733a', bg: '#fff7ed', emoji: '🥐' },
]

export default function ManagerSupervisedDashboard() {
  return (
    <div>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Select a restaurant to view its staff dashboard</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {RESTAURANTS.map(r => {
          const emps = SEED_EMPLOYEES.filter(e => e.restaurant === r.key)
          const supervisors = emps.filter(e => e.position === 'Supervisor' || e.position === 'Manager' || e.position === 'Operation Manager')
          const branches = [...new Set(emps.map(e => e.branch).filter(Boolean))]
          const totalSalary = emps.reduce((s, e) => s + e.basic_salary, 0)
          return (
            <Link key={r.slug} href={`/admin/bakery/${r.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', border: `2px solid ${r.color}25`, borderRadius: 16, padding: 28, cursor: 'pointer', transition: 'box-shadow .15s', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}
                onMouseOver={e => (e.currentTarget.style.boxShadow = `0 6px 20px ${r.color}30`)}
                onMouseOut={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.06)')}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>{r.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 12 }}>{r.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>Total Staff</span>
                    <span style={{ fontWeight: 700, color: r.color }}>{emps.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>Supervisors</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{supervisors.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>Total Salary</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{totalSalary.toLocaleString()} SAR</span>
                  </div>
                  {branches.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {branches.map(b => (
                        <span key={b} style={{ background: r.bg, color: r.color, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{b}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
