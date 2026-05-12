'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/menu', label: 'Menu Management', icon: '🍽️' },
  { href: '/admin/categories', label: 'Categories', icon: '📂' },
  { href: '/admin/hr', label: 'Appetie HR', icon: '👥' },
  { href: '/admin/branches', label: 'Branches', icon: '📍' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <html lang="en" dir="ltr">
      <body className="h-screen overflow-hidden bg-gray-50 font-sans text-gray-800 flex">
        {/* Sidebar */}
        <div className={`${collapsed ? 'w-14' : 'w-52'} bg-white border-r border-gray-200 flex flex-col shrink-0 h-screen transition-all duration-200`}>
          {/* Logo */}
          <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: '#eaf3e0' }}>
              🥗
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-bold text-gray-800 leading-tight">Appetie</div>
                <div className="text-[10px] text-gray-400">Admin Panel</div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(c => !c)}
              className="ml-auto text-gray-400 hover:text-gray-600 text-xs"
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-2">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] transition-colors ${
                  isActive(item.href, item.exact)
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && isActive(item.href, item.exact) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#5b8a3c' }} />
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom link to customer menu */}
          <div className="border-t border-gray-100 p-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 text-[11px] text-gray-400 hover:text-gray-600 px-1 py-1"
            >
              <span>🔗</span>
              {!collapsed && <span>View Customer Menu</span>}
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 h-screen overflow-y-auto">
          {children}
        </div>
      </body>
    </html>
  )
}
