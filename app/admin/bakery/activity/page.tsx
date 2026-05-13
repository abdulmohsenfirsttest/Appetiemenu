'use client'
import { useEffect, useState } from 'react'
import { bakeryApi } from '@/lib/bakery-api'
import type { BakeryActivity } from '@/lib/bakery-db'

export default function BakeryActivity() {
  const [logs, setLogs] = useState<BakeryActivity[]>([])
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => { bakeryApi.activity.list().then(setLogs).catch(() => {}) }, [])

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Activity Log</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>All staff actions with photo proof</div>

      {logs.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>No activity yet</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {logs.map(log => (
          <div key={log.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: log.staff_role === 'admin' ? '#fce7f3' : '#dbeafe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 15,
                color: log.staff_role === 'admin' ? '#be185d' : '#1d4ed8',
              }}>
                {log.staff_name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700 }}>{log.staff_name}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 700, background: log.staff_role === 'admin' ? '#fce7f3' : '#dbeafe', color: log.staff_role === 'admin' ? '#be185d' : '#1d4ed8' }}>
                    {log.staff_role}
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#374151', marginBottom: log.photo_url ? 12 : 0 }}>{log.detail}</p>
                {log.photo_url ? (
                  <img
                    src={log.photo_url}
                    alt="proof"
                    onClick={() => setLightbox(log.photo_url)}
                    style={{ height: 100, width: 140, objectFit: 'cover', borderRadius: 8, border: '2px solid #e2e8f0', cursor: 'pointer', display: 'block' }}
                  />
                ) : (
                  <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No photo attached</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <img src={lightbox} alt="full" style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: 12 }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
