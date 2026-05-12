'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_MENU_ITEMS, SEED_EMPLOYEES } from '@/lib/seed-data'
import Link from 'next/link'

interface Stats {
  totalItems: number; availableItems: number; totalEmployees: number
  totalPayroll: number; onVacation: number; salaryPaid: number; salaryPending: number
}

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
  </svg>
)
const IconPeople = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconMoney = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/>
    <path d="M6 12h.01M18 12h.01"/>
  </svg>
)
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalItems: 0, availableItems: 0, totalEmployees: 0,
    totalPayroll: 0, onVacation: 0, salaryPaid: 0, salaryPending: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    try {
      const [{ data: items }, { data: emps }] = await Promise.all([
        supabase.from('menu_items').select('id, is_available'),
        supabase.from('employees').select('id, basic_salary, ot_pay, salary_paid, vacation_status'),
      ])
      const menuItems = items && items.length > 0 ? items : SEED_MENU_ITEMS
      const employees = emps && emps.length > 0 ? emps : SEED_EMPLOYEES
      const totalPayroll = employees.reduce((sum: number, e: any) => {
        const otPay = e.ot_pay ?? (e.basic_salary / 30 / 8 * 1.25 * (e.ot_hours || 0))
        return sum + (e.basic_salary || 0) + otPay
      }, 0)
      setStats({
        totalItems: menuItems.length,
        availableItems: menuItems.filter((i: any) => i.is_available !== false).length,
        totalEmployees: employees.length,
        totalPayroll: Math.round(totalPayroll),
        onVacation: employees.filter((e: any) => e.vacation_status === 'on_vacation').length,
        salaryPaid: employees.filter((e: any) => e.salary_paid).length,
        salaryPending: employees.filter((e: any) => !e.salary_paid).length,
      })
    } catch {
      const totalPayroll = SEED_EMPLOYEES.reduce((s, e) => s + e.basic_salary, 0)
      setStats({
        totalItems: SEED_MENU_ITEMS.length,
        availableItems: SEED_MENU_ITEMS.filter(i => i.is_available).length,
        totalEmployees: SEED_EMPLOYEES.length, totalPayroll,
        onVacation: 0, salaryPaid: 0, salaryPending: SEED_EMPLOYEES.length,
      })
    }
    setLoading(false)
  }

  const cards = [
    { label: 'Menu Items', value: stats.totalItems, sub: `${stats.availableItems} available`, icon: <IconMenu />, color: '#25D366' },
    { label: 'Employees', value: stats.totalEmployees, sub: `${stats.onVacation} on vacation`, icon: <IconPeople />, color: '#6366f1' },
    { label: 'Monthly Payroll', value: `${stats.totalPayroll.toLocaleString()} SAR`, sub: 'Total net pay', icon: <IconMoney />, color: '#f59e0b' },
    { label: 'Salary Paid', value: stats.salaryPaid, sub: `${stats.salaryPending} pending`, icon: <IconCheck />, color: '#10b981' },
  ]

  const actions = [
    { href: '/admin/menu', icon: <IconMenu />, color: '#25D366', title: 'Manage Menu', desc: 'Add, edit, or hide items' },
    { href: '/admin/hr', icon: <IconPeople />, color: '#6366f1', title: 'HR & Payroll', desc: 'Employees & OT tracking' },
    { href: '/admin/categories', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ), color: '#f59e0b', title: 'Categories', desc: 'Organize menu sections' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>Welcome back — here's your restaurant overview.</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 110, background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} className="shimmer" />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {cards.map((card, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: '20px 20px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.color, borderRadius: '16px 16px 0 0' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{card.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 4 }}>{card.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{card.sub}</div>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: card.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {actions.map((a, i) => (
            <Link key={i} href={a.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                onMouseOut={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, flexShrink: 0 }}>
                  {a.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{a.desc}</div>
                </div>
                <div style={{ color: '#cbd5e1', flexShrink: 0 }}><IconArrow /></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Branches */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Branches</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { name: 'Ar Rayyan', location: 'Ar Rayyan District', color: '#25D366', bg: '#dcfce7' },
            { name: 'Hittin', location: 'Hittin District', color: '#7c3aed', bg: '#ede9fe' },
            { name: 'Malqa', location: 'Malqa District', color: '#2563eb', bg: '#dbeafe' },
          ].map(b => (
            <div key={b.name} style={{ background: 'white', borderRadius: 14, padding: '16px 20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: b.color, flexShrink: 0 }}>
                {b.name[0]}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{b.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{b.location}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '3px 10px', borderRadius: 20 }}>Active</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
