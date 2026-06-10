'use client'
import { useEffect, useState } from 'react'
import { fetchTasks } from '@/lib/tasks-db'

type Priority = 'low' | 'medium' | 'high' | 'urgent'
type TaskStatus = 'pending' | 'in_progress' | 'done' | 'blocked'

interface Task {
  id: string; title: string; description: string
  assigned_to: string; assigned_id: number; branch: string
  priority: Priority; status: TaskStatus; due_date: string; created_at: string
  created_by: string; created_by_id: number; created_by_role: 'asjad' | 'supervisor'
  approved: boolean; approved_at?: string; started_at?: string
  completion_submitted?: boolean; photo_urls?: string[]; supervisor_note?: string
  asjad_comment?: string; done_at?: string
  redo_requested?: boolean; redo_reason?: string
}

const PRIORITY_COLOR: Record<Priority, string> = {
  low: '#22c55e', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444',
}
const STATUS_COLOR: Record<TaskStatus, { bg: string; text: string }> = {
  pending:     { bg: '#f1f5f9', text: '#64748b' },
  in_progress: { bg: '#eff6ff', text: '#1d4ed8' },
  done:        { bg: '#f0fdf4', text: '#16a34a' },
  blocked:     { bg: '#fef2f2', text: '#dc2626' },
}
const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pending', in_progress: 'In Progress', done: 'Done', blocked: 'Blocked',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function OperationsMonitor() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<'all' | TaskStatus | 'review'>('all')
  const [lightbox, setLightbox] = useState<string[] | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [detail, setDetail] = useState<Task | null>(null)

  useEffect(() => {
    async function load() {
      const data = await fetchTasks()
      setTasks(data as Task[])
    }
    load()
    const iv = setInterval(load, 3000)
    return () => clearInterval(iv)
  }, [])

  const approvals = tasks.filter(t => !t.approved && t.created_by_role === 'asjad')
  const review    = tasks.filter(t => t.completion_submitted && !t.done_at && t.status !== 'done')
  const active    = tasks.filter(t => t.approved && t.status === 'in_progress' && !t.completion_submitted)
  const done      = tasks.filter(t => t.status === 'done')
  const blocked   = tasks.filter(t => t.status === 'blocked')

  const visible = filter === 'all' ? tasks
    : filter === 'review' ? review
    : tasks.filter(t => t.status === filter)

  const stats = [
    { label: 'Pending Approval', value: approvals.length, color: '#f59e0b', key: 'pending' },
    { label: 'Awaiting Review',  value: review.length,    color: '#8b5cf6', key: 'review'  },
    { label: 'In Progress',      value: active.length,    color: '#3b82f6', key: 'in_progress' },
    { label: 'Done',             value: done.length,      color: '#16a34a', key: 'done'    },
    { label: 'Blocked',          value: blocked.length,   color: '#ef4444', key: 'blocked' },
    { label: 'Total',            value: tasks.length,     color: '#64748b', key: 'all'     },
  ] as const

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--admin-text)' }}>Operations Monitor</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Live task activity between Operation Manager &amp; Supervisors · refreshes every 3s</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Live</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="admin-grid-3" style={{ gap: 12, marginBottom: 20 }}>
        {stats.map(s => (
          <button key={s.key} onClick={() => setFilter(s.key as typeof filter)}
            style={{ background: filter === s.key ? s.color : 'var(--admin-card)', border: `2px solid ${filter === s.key ? s.color : 'var(--admin-border)'}`, borderRadius: 12, padding: '16px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: filter === s.key ? 'white' : s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: filter === s.key ? 'rgba(255,255,255,0.8)' : '#64748b', marginTop: 2 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'in_progress', 'review', 'done', 'blocked'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: filter === f ? '#0f172a' : '#f1f5f9',
            color: filter === f ? 'white' : '#64748b',
          }}>
            {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f === 'review' ? 'Awaiting Review' : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task list */}
      {visible.length === 0 ? (
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 48, textAlign: 'center', color: '#94a3b8' }}>
          No tasks found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.slice().reverse().map(task => {
            const sc = STATUS_COLOR[task.status]
            return (
              <div key={task.id} onClick={() => setDetail(task)}
                style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  {/* Priority dot */}
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: PRIORITY_COLOR[task.priority], flexShrink: 0, marginTop: 5 }} />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--admin-text)' }}>{task.title}</span>
                      {task.completion_submitted && task.status !== 'done' && (
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#f3e8ff', color: '#7c3aed', fontWeight: 700 }}>REVIEW PENDING</span>
                      )}
                      {task.redo_requested && (
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#fef2f2', color: '#dc2626', fontWeight: 700 }}>REDO</span>
                      )}
                      {!task.approved && task.created_by_role === 'asjad' && (
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#fffbeb', color: '#d97706', fontWeight: 700 }}>NEEDS APPROVAL</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#64748b' }}>
                      <span><strong>{task.assigned_to}</strong></span>
                      <span>📍 {task.branch}</span>
                      <span>By: {task.created_by}</span>
                      <span>{timeAgo(task.created_at)}</span>
                    </div>
                    {task.description && (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>{task.description}</div>
                    )}
                    {/* Photo thumbnails */}
                    {task.photo_urls && task.photo_urls.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {task.photo_urls.map((url, i) => (
                          <img key={i} src={url} alt="" onClick={e => { e.stopPropagation(); setLightbox(task.photo_urls!); setLightboxIdx(i) }}
                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--admin-border)', cursor: 'pointer' }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right side */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 700, background: sc.bg, color: sc.text }}>
                      {STATUS_LABEL[task.status]}
                    </span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 600, background: '#f1f5f9', color: PRIORITY_COLOR[task.priority] }}>
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>Due: {task.due_date}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="mobile-modal" onClick={() => setDetail(null)} style={{ zIndex: 200 }}>
          <div className="mobile-modal-sheet" onClick={e => e.stopPropagation()} style={{ background: 'var(--admin-card)', maxWidth: 560 }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--admin-text)' }}>{detail.title}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Created {timeAgo(detail.created_at)} by {detail.created_by}</div>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#475569', flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Status badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, fontWeight: 700, background: STATUS_COLOR[detail.status].bg, color: STATUS_COLOR[detail.status].text }}>
                  {STATUS_LABEL[detail.status]}
                </span>
                <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, fontWeight: 700, background: '#f1f5f9', color: PRIORITY_COLOR[detail.priority] }}>
                  {detail.priority} priority
                </span>
                {detail.completion_submitted && detail.status !== 'done' && (
                  <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: '#f3e8ff', color: '#7c3aed', fontWeight: 700 }}>Awaiting Review</span>
                )}
                {detail.redo_requested && (
                  <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: '#fef2f2', color: '#dc2626', fontWeight: 700 }}>Redo Requested</span>
                )}
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  ['Assigned To', detail.assigned_to],
                  ['Branch', detail.branch],
                  ['Due Date', detail.due_date || '—'],
                  ['Approved', detail.approved ? `Yes (${detail.approved_at ? timeAgo(detail.approved_at) : ''})` : 'No'],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: 'var(--admin-subcard)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {detail.description && (
                <div style={{ background: 'var(--admin-subcard)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Description</div>
                  <div style={{ fontSize: 13, color: 'var(--admin-text)', lineHeight: 1.5 }}>{detail.description}</div>
                </div>
              )}

              {/* Supervisor note */}
              {detail.supervisor_note && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: '#92400e', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Supervisor Note</div>
                  <div style={{ fontSize: 13, color: '#78350f' }}>{detail.supervisor_note}</div>
                </div>
              )}

              {/* Redo reason */}
              {detail.redo_reason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: '#991b1b', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Redo Reason</div>
                  <div style={{ fontSize: 13, color: '#7f1d1d' }}>{detail.redo_reason}</div>
                </div>
              )}

              {/* Asjad comment */}
              {detail.asjad_comment && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: '#1e40af', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Manager Comment</div>
                  <div style={{ fontSize: 13, color: '#1e3a8a' }}>{detail.asjad_comment}</div>
                </div>
              )}

              {/* Photos */}
              {detail.photo_urls && detail.photo_urls.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Completion Photos</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {detail.photo_urls.map((url, i) => (
                      <img key={i} src={url} alt="" onClick={() => { setLightbox(detail.photo_urls!); setLightboxIdx(i); setDetail(null) }}
                        style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--admin-border)', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(null)}>
          <img src={lightbox[lightboxIdx]} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12 }} onClick={e => e.stopPropagation()} />
          {lightbox.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + lightbox.length) % lightbox.length) }}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: 'white', fontSize: 18, cursor: 'pointer' }}>‹</button>
              <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % lightbox.length) }}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: 'white', fontSize: 18, cursor: 'pointer' }}>›</button>
            </>
          )}
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: 'white', fontSize: 18, cursor: 'pointer' }}>✕</button>
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{lightboxIdx + 1} / {lightbox.length}</div>
        </div>
      )}
    </div>
  )
}
