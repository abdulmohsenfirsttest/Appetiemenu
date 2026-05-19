'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Ctx = { dark: boolean; toggle: () => void }
const AdminThemeCtx = createContext<Ctx>({ dark: false, toggle: () => {} })

const LIGHT: Record<string, string> = {
  '--admin-bg':      '#f8fafc',
  '--admin-card':    'white',
  '--admin-border':  '#e2e8f0',
  '--admin-border2': '#f1f5f9',
  '--admin-text':    '#0f172a',
  '--admin-thead':   '#f8fafc',
  '--admin-input':   'white',
  '--admin-subcard': '#f8fafc',
  '--admin-header':  'white',
}

const DARK: Record<string, string> = {
  '--admin-bg':      '#0f172a',
  '--admin-card':    '#1e293b',
  '--admin-border':  '#334155',
  '--admin-border2': '#1e293b',
  '--admin-text':    '#f1f5f9',
  '--admin-thead':   '#162032',
  '--admin-input':   '#0f172a',
  '--admin-subcard': '#162032',
  '--admin-header':  '#1e293b',
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(localStorage.getItem('admin-dark') === '1')
  }, [])

  function toggle() {
    setDark(d => {
      const next = !d
      localStorage.setItem('admin-dark', next ? '1' : '0')
      return next
    })
  }

  const vars = mounted && dark ? DARK : LIGHT

  return (
    <AdminThemeCtx.Provider value={{ dark: mounted && dark, toggle }}>
      <div style={vars as React.CSSProperties} data-admin-dark={mounted && dark ? 'true' : 'false'}>
        {children}
      </div>
    </AdminThemeCtx.Provider>
  )
}

export const useAdminTheme = () => useContext(AdminThemeCtx)
