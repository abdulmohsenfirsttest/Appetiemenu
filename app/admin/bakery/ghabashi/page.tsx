'use client'
import { useEffect, useState } from 'react'
import RestaurantDashboard from '../RestaurantDashboard'
import { GHABASHI_TASKS } from '@/lib/ghabashi-tasks'

type Completion = { id: number; task_key: string; task_name: string; photo_url: string | null; completed_at: string }
type Shift = { id: number; staff_name: string; shift_type: 'morning' | 'closing'; date: string; status: string; started_at: string; completed_at: string | null; ghabashi_task_completions: Completion[] }

export default function GhabashiAdminPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/bakery/ghabashi/shifts?date=${date}`)
      .then(r => r.json()).then(setShifts).catch(() => {})
  }, [date])

  return (
    <div>
      <RestaurantDashboard restaurantKey="Ghabashi" label="Ghabashi" color="#7c3aed" emoji="🏪" />

      {/* Checklists section */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>🗒️ Shift Checklists</div>
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
          />
        </div>

        {shifts.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            No checklists for this date
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {shifts.map(shift => {
              const tasks = GHABASHI_TASKS[shift.shift_type] || []
              const completions = shift.ghabashi_task_completions || []
              const doneKeys = new Set(completions.map(c => c.task_key))
              const doneCount = tasks.filter(t => doneKeys.has(t.key)).length
              const expanded = expandedId === shift.id
              const color = shift.shift_type === 'morning' ? '#92400e' : '#1e40af'
              const bg = shift.shift_type === 'morning' ? '#fffbeb' : '#eff6ff'

              return (
                <div key={shift.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : shift.id)}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}
                  >
                    <span style={{ fontSize: 22 }}>{shift.shift_type === 'morning' ? '🌅' : '🌙'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                        {shift.staff_name}
                        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: bg, color }}>{shift.shift_type}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {new Date(shift.started_at).toLocaleTimeString()} · {doneCount}/{tasks.length} tasks
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: shift.status === 'completed' ? '#dcfce7' : '#fff7ed', color: shift.status === 'completed' ? '#16a34a' : '#c2410c' }}>
                        {shift.status === 'completed' ? '✓ Done' : 'In Progress'}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{expanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {expanded && (
                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 18px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {tasks.map((task, i) => {
                          const comp = completions.find(c => c.task_key === task.key)
                          const done = !!comp
                          return (
                            <div key={task.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                              <div style={{ minWidth: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#16a34a' : '#f1f5f9', color: done ? 'white' : '#94a3b8', fontWeight: 800, fontSize: done ? 12 : 11, flexShrink: 0 }}>
                                {done ? '✓' : i + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: done ? '#15803d' : '#64748b' }}>{task.name}</div>
                                {done && comp?.completed_at && (
                                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(comp.completed_at).toLocaleTimeString()}</div>
                                )}
                                {done && comp?.photo_url && (
                                  <button onClick={() => setViewPhoto(comp.photo_url!)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', marginTop: 6 }}>
                                    <img src={comp.photo_url} alt="task" style={{ height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid #bbf7d0' }} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Photo lightbox */}
      {viewPhoto && (
        <div onClick={() => setViewPhoto(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: 600, width: '100%' }}>
            <img src={viewPhoto} alt="task" style={{ width: '100%', borderRadius: 12, maxHeight: '80vh', objectFit: 'contain' }} />
            <button onClick={() => setViewPhoto(null)} style={{ position: 'absolute', top: -12, right: -12, background: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
