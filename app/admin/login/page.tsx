'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLogin() {
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

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'var(--font-dm-sans), sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 8px 24px rgba(37,211,102,0.4)' }}>
            <Image src="/logo.png" alt="Appetie" width={38} height={38} style={{ filter: 'brightness(0) invert(1)', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 6 }}>Admin Panel</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Sign in to manage Appetie</p>
        </div>

        {/* Card */}
        <div style={{ background: '#1e293b', borderRadius: 20, padding: '32px 28px', border: '1px solid #334155', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Email Address
              </label>
              <input
                type="email" value={email} required autoComplete="email"
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@appetie.com"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #334155', background: '#0f172a', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => (e.target.style.borderColor = '#25D366')}
                onBlur={e => (e.target.style.borderColor = '#334155')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Password
              </label>
              <input
                type="password" value={password} required autoComplete="current-password"
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #334155', background: '#0f172a', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => (e.target.style.borderColor = '#25D366')}
                onBlur={e => (e.target.style.borderColor = '#334155')}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '13px', borderRadius: 12, border: 'none', marginTop: 4,
              background: '#25D366', color: 'white', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s',
              opacity: loading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(37,211,102,0.4)',
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 12, color: '#334155' }}>
          Appetie Restaurant Management · اباتاي
        </p>

      </div>
    </div>
  )
}
