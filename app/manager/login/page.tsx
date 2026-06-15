'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function ManagerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    const role = (data.user.app_metadata as { role?: string } | undefined)?.role
    const allowed = role === 'manager' || role === 'admin' || data.user.email === 'asjad@appetie.com'
    if (!allowed) {
      await supabase.auth.signOut()
      setError('Access denied. This portal is for managers only.')
      setLoading(false)
      return
    }

    router.push('/manager')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'var(--font-dm-sans), sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(245,158,11,0.2)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Operation Manager</h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>Ghabashi Operations · أسجد</p>
        </div>

        {/* Card */}
        <div style={{ background: '#1e293b', borderRadius: 20, padding: '30px 26px', border: '1px solid #334155', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {error && (
              <div style={{ padding: '11px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: 13, color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
              <input type="email" value={email} required autoComplete="email"
                onChange={e => setEmail(e.target.value)}
                placeholder="asjad@appetie.com"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 11, border: '1.5px solid #334155', background: '#0f172a', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => (e.target.style.borderColor = '#f59e0b')}
                onBlur={e => (e.target.style.borderColor = '#334155')} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
              <input type="password" value={password} required autoComplete="current-password"
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 11, border: '1.5px solid #334155', background: '#0f172a', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => (e.target.style.borderColor = '#f59e0b')}
                onBlur={e => (e.target.style.borderColor = '#334155')} />
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '13px', borderRadius: 11, border: 'none', marginTop: 4,
              background: loading ? '#92400e' : '#f59e0b', color: 'white', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(245,158,11,0.4)',
            }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#1e293b' }}>
          Appetie · Ghabashi Operations
        </p>
      </div>
    </div>
  )
}
