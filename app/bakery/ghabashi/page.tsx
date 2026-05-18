'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GhabashiShiftSelect() {
  const router = useRouter()
  const [loading, setLoading] = useState<'morning' | 'closing' | null>(null)

  async function startShift(shift_type: 'morning' | 'closing') {
    setLoading(shift_type)
    try {
      const res = await fetch('/api/bakery/ghabashi/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shift_type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/bakery/ghabashi/${data.id}`)
    } catch {
      setLoading(null)
    }
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#2d1f14' }}>Ghabashi Checklist</div>
        <div style={{ fontSize: 13, color: '#7a6355', marginTop: 6 }}>{today}</div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textAlign: 'center', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>
        Choose your shift
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {([
          { type: 'morning' as const, emoji: '🌅', label: 'Morning Shift', time: 'Opens the restaurant', bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
          { type: 'closing' as const, emoji: '🌙', label: 'Closing Shift', time: 'Closes the restaurant', bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
        ]).map(({ type, emoji, label, time, bg, border, color }) => (
          <button
            key={type}
            onClick={() => startShift(type)}
            disabled={loading !== null}
            style={{
              background: bg, border: `2px solid ${border}`, borderRadius: 16,
              padding: '28px 24px', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 20, textAlign: 'left',
              opacity: loading && loading !== type ? 0.5 : 1,
              transition: 'transform .1s',
            }}
          >
            <span style={{ fontSize: 40 }}>{loading === type ? '⏳' : emoji}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color }}>{label}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{time}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
