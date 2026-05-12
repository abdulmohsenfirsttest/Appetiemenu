'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_MENU_ITEMS, SEED_EMPLOYEES } from '@/lib/seed-data'

interface Stats {
  totalItems: number
  availableItems: number
  totalEmployees: number
  totalPayroll: number
  onVacation: number
  salaryPaid: number
  salaryPending: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalItems: 0, availableItems: 0, totalEmployees: 0,
    totalPayroll: 0, onVacation: 0, salaryPaid: 0, salaryPending: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

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
      const totalPayroll = SEED_EMPLOYEES.reduce((sum, e) => sum + e.basic_salary, 0)
      setStats({
        totalItems: SEED_MENU_ITEMS.length,
        availableItems: SEED_MENU_ITEMS.filter(i => i.is_available).length,
        totalEmployees: SEED_EMPLOYEES.length,
        totalPayroll,
        onVacation: 0, salaryPaid: 0, salaryPending: SEED_EMPLOYEES.length,
      })
    }
    setLoading(false)
  }

  const cards = [
    { label: 'Total Menu Items', value: stats.totalItems, sub: `${stats.availableItems} available`, icon: '🍽️', color: '#5b8a3c' },
    { label: 'Total Employees', value: stats.totalEmployees, sub: `${stats.onVacation} on vacation`, icon: '👥', color: '#6366f1' },
    { label: 'Monthly Payroll', value: `${stats.totalPayroll.toLocaleString()} SAR`, sub: 'Total net pay', icon: '💰', color: '#f59e0b' },
    { label: 'Salary Paid', value: stats.salaryPaid, sub: `${stats.salaryPending} pending`, icon: '✅', color: '#10b981' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Appetie Restaurant Overview</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="h-8 w-8 rounded-lg bg-gray-200 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ background: card.color + '20' }}>
                {card.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-sm text-gray-600 font-medium mt-0.5">{card.label}</div>
              <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction href="/admin/menu" icon="🍽️" title="Manage Menu" desc="Add, edit, or hide menu items" color="#5b8a3c" />
        <QuickAction href="/admin/hr" icon="👥" title="HR Payroll" desc="Manage employees & OT hours" color="#6366f1" />
        <QuickAction href="/admin/categories" icon="📂" title="Categories" desc="Organize menu categories" color="#f59e0b" />
      </div>

      {/* Branches Overview */}
      <div className="mt-8 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">Branches</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Ar Rayyan', color: '#5b8a3c', bg: '#eaf3e0' },
            { name: 'Hittin', color: '#7c3aed', bg: '#ede9fe' },
            { name: 'Malqa', color: '#2563eb', bg: '#dbeafe' },
          ].map(b => (
            <div key={b.name} className="rounded-xl p-3 text-center" style={{ background: b.bg }}>
              <div className="text-sm font-bold" style={{ color: b.color }}>{b.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">Active</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function QuickAction({ href, icon, title, desc, color }: {
  href: string; icon: string; title: string; desc: string; color: string
}) {
  return (
    <a href={href} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: color + '20' }}>
        {icon}
      </div>
      <div>
        <div className="font-semibold text-gray-900 text-sm">{title}</div>
        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
      </div>
    </a>
  )
}
