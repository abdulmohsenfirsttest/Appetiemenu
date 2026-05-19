'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/admin/bakery', label: 'Dashboard', exact: true },
  { href: '/admin/bakery/orders', label: 'Orders' },
  { href: '/admin/bakery/products', label: 'Products' },
  { href: '/admin/bakery/customers', label: 'Customers' },
  { href: '/admin/bakery/reports', label: 'Reports' },
  { href: '/admin/bakery/activity', label: 'Activity Log' },
  { href: '/admin/bakery/staff', label: 'Staff' },
]

export default function BakeryAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 22 }}>🥐</span>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--admin-text)' }}>Manager Supervised</h1>
        <Link href="/bakery" target="_blank" style={{ marginLeft: 'auto', fontSize: 12, color: '#25D366', textDecoration: 'none', border: '1px solid #25D366', borderRadius: 6, padding: '4px 10px' }}>
          Staff Portal ↗
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--admin-border)', paddingBottom: 0, overflowX: 'auto' }}>
        {TABS.map(t => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href)
          return (
            <Link key={t.href} href={t.href} style={{
              padding: '8px 16px', fontWeight: active ? 700 : 500, fontSize: 13,
              color: active ? '#c8733a' : '#64748b', textDecoration: 'none',
              borderBottom: active ? '2px solid #c8733a' : '2px solid transparent',
              marginBottom: -2, whiteSpace: 'nowrap', transition: 'all .15s',
            }}>
              {t.label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
