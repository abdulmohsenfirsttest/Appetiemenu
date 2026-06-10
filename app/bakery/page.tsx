'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bakeryApi } from '@/lib/bakery-api'

export default function BakeryLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await bakeryApi.auth.login(username, password)
      router.push('/bakery/dashboard')
    } catch {
      setError('Invalid username or password')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2d1f14' }}>Manager Supervised</h1>
          <p style={{ color: '#7a6355', fontSize: 13, marginTop: 4 }}>Staff Portal — Sign in to your account</p>
        </div>
        <div style={{ background: 'white', border: '1px solid #e8ddd0', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,.06)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7a6355', display: 'block', marginBottom: 4 }}>Username</label>
              <input autoFocus value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8ddd0', borderRadius: 8, fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7a6355', display: 'block', marginBottom: 4 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8ddd0', borderRadius: 8, fontSize: 14 }} />
            </div>
            {error && <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
            <button type="submit" disabled={loading || !username || !password} style={{ width: '100%', padding: '11px', background: '#c8733a', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
