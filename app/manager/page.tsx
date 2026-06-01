'use client'

import { useEffect, useState } from 'react'
import { SEED_EMPLOYEES } from '@/lib/seed-data'

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
}

const PRIORITY_COLOR: Record<Priority, string> = {
  low: '#22c55e', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444',
}
const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pending', in_progress: 'In Progress', done: 'Done', blocked: 'Blocked',
}
const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: '#64748b', in_progress: '#3b82f6', done: '#22c55e', blocked: '#ef4444',
}
const RESTAURANTS = ['Ghabashi', 'Appetie', 'Piece Bakery']
const RESTAURANT_COLOR: Record<string, string> = {
  'Ghabashi': '#10b981', 'Appetie': '#f59e0b', 'Piece Bakery': '#a855f7',
}
const LEADER_POSITIONS = ['Manager', 'Operation Manager', 'Supervisor', 'Head Chef', 'Bakery Chef']
const isLeader = (e: typeof SEED_EMPLOYEES[0]) =>
  LEADER_POSITIONS.some(lp => e.position.includes(lp))

function formatDuration(startIso: string, endIso?: string, now?: number): string {
  const diff = (endIso ? new Date(endIso).getTime() : (now ?? Date.now())) - new Date(startIso).getTime()
  if (diff < 0) return '0s'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

type TabId = 'approvals' | 'review' | 'active' | 'team'

export default function ManagerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tab, setTab] = useState<TabId>('approvals')
  const [now, setNow] = useState(Date.now())
  const [showModal, setShowModal] = useState(false)
  const [reviewTask, setReviewTask] = useState<Task | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([])
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [draft, setDraft] = useState({
    title: '', description: '', assigned_id: 0,
    branch: '', priority: 'medium' as Priority, due_date: '',
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem('all_tasks')
      if (raw) setTasks(JSON.parse(raw))
    } catch { /**/ }
    const iv = setInterval(() => {
      setNow(Date.now())
      try {
        const raw = localStorage.getItem('all_tasks')
        if (raw) setTasks(JSON.parse(raw))
      } catch { /**/ }
    }, 3000)
    return () => clearInterval(iv)
  }, [])

  // live clock for timers
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  function saveTasks(next: Task[]) {
    setTasks(next)
    localStorage.setItem('all_tasks', JSON.stringify(next))
  }

  function approveTask(id: string) {
    saveTasks(tasks.map(t => t.id === id
      ? { ...t, approved: true, approved_at: new Date().toISOString(), started_at: new Date().toISOString(), status: 'in_progress' }
      : t
    ))
  }

  function rejectTask(id: string) {
    saveTasks(tasks.filter(t => t.id !== id))
  }

  function markDone(task: Task, comment: string) {
    saveTasks(tasks.map(t => t.id === task.id ? {
      ...t, done_at: new Date().toISOString(), asjad_comment: comment, status: 'done',
    } : t))
    setReviewTask(null)
    setReviewComment('')
  }

  function submitTask() {
    if (!draft.title || !draft.assigned_id) return
    const emp = SEED_EMPLOYEES.find(e => e.id === draft.assigned_id)
    if (!emp) return
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: draft.title, description: draft.description,
      assigned_to: emp.name, assigned_id: emp.id,
      branch: draft.branch || emp.branch,
      priority: draft.priority, status: 'in_progress',
      due_date: draft.due_date, created_at: new Date().toISOString(),
      created_by: 'Asjad', created_by_id: 1, created_by_role: 'asjad',
      approved: true, approved_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
    }
    saveTasks([...tasks, newTask])
    setDraft({ title: '', description: '', assigned_id: 0, branch: '', priority: 'medium', due_date: '' })
    setShowModal(false)
  }

  const pendingApprovals = tasks.filter(t => !t.approved)
  const forReview = tasks.filter(t => t.approved && t.completion_submitted && !t.done_at)
  const activeTasks = tasks.filter(t => t.approved && !t.completion_submitted && !t.done_at)
  const doneTasks = tasks.filter(t => !!t.done_at)

  const unpaidCount = SEED_EMPLOYEES.filter(e => !e.salary_paid).length
  const highOtCount = SEED_EMPLOYEES.filter(e => e.ot_hours >= 40).length
  const onVacation = SEED_EMPLOYEES.filter(e => e.vacation_status !== 'none').length

  const tabs: { id: TabId; label: string; count?: number; alert?: boolean }[] = [
    { id: 'approvals', label: 'Approvals', count: pendingApprovals.length },
    { id: 'review', label: 'For Review', count: forReview.length, alert: forReview.length > 0 },
    { id: 'active', label: 'Active Tasks', count: activeTasks.length },
    { id: 'team', label: 'Team' },
  ]

  return (
    <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Operations Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Ghabashi Group · All Branches</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: '#0f172a', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Assign Task
        </button>
      </div>

      {/* Alert banners */}
      {forReview.length > 0 && (
        <div style={{ padding: '12px 16px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, marginBottom: 10, fontSize: 13, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📸</span>
          <strong>{forReview.length} task{forReview.length > 1 ? 's' : ''} submitted for your review</strong>
          <button onClick={() => setTab('review')} style={{ marginInlineStart: 8, background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Review →</button>
        </div>
      )}
      {pendingApprovals.length > 0 && (
        <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚠️</span>
          <strong>{pendingApprovals.length} task{pendingApprovals.length > 1 ? 's' : ''} waiting for your approval</strong>
          <button onClick={() => setTab('approvals')} style={{ marginInlineStart: 8, background: 'none', border: 'none', color: '#f59e0b', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Approve →</button>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Staff', value: SEED_EMPLOYEES.length, color: '#3b82f6', icon: '👥' },
          { label: 'Pending Approval', value: pendingApprovals.length, color: '#f59e0b', icon: '⏳' },
          { label: 'For Review', value: forReview.length, color: '#3b82f6', icon: '📸' },
          { label: 'Active Tasks', value: activeTasks.length, color: '#10b981', icon: '▶' },
          { label: 'Completed', value: doneTasks.length, color: '#22c55e', icon: '✓' },
          { label: 'Unpaid Salaries', value: unpaidCount, color: '#ef4444', icon: '💸' },
        ].map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{card.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 16px', borderRadius: '8px 8px 0 0', border: 'none',
            background: tab === t.id ? 'white' : 'transparent',
            color: tab === t.id ? '#0f172a' : '#64748b',
            fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer',
            borderBottom: tab === t.id ? `2px solid ${t.alert ? '#3b82f6' : '#f59e0b'}` : '2px solid transparent',
            position: 'relative', top: 1, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{
                background: t.alert ? '#3b82f6' : t.id === 'approvals' ? '#f59e0b' : '#0f172a',
                color: 'white', borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Approvals tab ── */}
      {tab === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pendingApprovals.length === 0 ? (
            <Empty text="No pending approvals — all clear ✓" />
          ) : pendingApprovals.map(task => (
            <TaskCard key={task.id} task={task} now={now}>
              <button onClick={() => approveTask(task.id)} style={btnStyle('#22c55e')}>Approve ✓</button>
              <button onClick={() => rejectTask(task.id)} style={btnStyle('transparent', '#ef4444', '#fca5a5')}>Reject</button>
            </TaskCard>
          ))}
        </div>
      )}

      {/* ── For Review tab ── */}
      {tab === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {forReview.length === 0 ? (
            <Empty text="No tasks waiting for review" />
          ) : forReview.map(task => (
            <div key={task.id} style={{ background: 'white', borderRadius: 14, border: '2px solid #bfdbfe', padding: '16px 18px', boxShadow: '0 2px 8px rgba(59,130,246,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 4, borderRadius: 4, background: PRIORITY_COLOR[task.priority], alignSelf: 'stretch', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{task.title}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }}>📸 Completion Submitted</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    👤 {task.assigned_to} · 📍 {task.branch}
                    {task.started_at && <span style={{ marginInlineStart: 8 }}>⏱ {formatDuration(task.started_at, undefined, now)} elapsed</span>}
                  </div>
                  {task.supervisor_note && (
                    <div style={{ fontSize: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#475569', marginBottom: 10 }}>
                      💬 Supervisor note: {task.supervisor_note}
                    </div>
                  )}
                  {/* Photos */}
                  {task.photo_urls && task.photo_urls.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      {task.photo_urls.map((url, i) => (
                        <div key={i} onClick={() => { setLightboxPhotos(task.photo_urls!); setLightboxIdx(i) }}
                          style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', cursor: 'zoom-in', border: '1.5px solid #e2e8f0', flexShrink: 0 }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => { setReviewTask(task); setReviewComment('') }}
                  style={{ ...btnStyle('#0f172a'), flexShrink: 0, whiteSpace: 'nowrap' }}>Review & Done</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Active Tasks tab ── */}
      {tab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activeTasks.length === 0 ? (
            <Empty text="No active tasks" />
          ) : activeTasks.map(task => (
            <TaskCard key={task.id} task={task} now={now} showTimer />
          ))}
          {doneTasks.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 16, marginBottom: 4 }}>Completed</div>
              {doneTasks.map(task => (
                <div key={task.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 18px', opacity: 0.75 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', flex: 1 }}>{task.title}</span>
                    <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>✓ Done</span>
                    {task.started_at && task.done_at && (
                      <span style={{ fontSize: 12, color: '#64748b' }}>⏱ {formatDuration(task.started_at, task.done_at)}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>👤 {task.assigned_to} · By {task.created_by}</div>
                  {task.asjad_comment && (
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 6, padding: '6px 10px', background: '#fef3c7', borderRadius: 7 }}>
                      👑 {task.asjad_comment}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Team tab ── */}
      {tab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {RESTAURANTS.map(rest => {
            const emps = SEED_EMPLOYEES.filter(e => e.restaurant === rest)
            if (emps.length === 0) return null
            const color = RESTAURANT_COLOR[rest]
            const byBranch: Record<string, typeof emps> = {}
            emps.forEach(e => { const b = e.branch || 'Unassigned'; (byBranch[b] = byBranch[b] || []).push(e) })
            const totalOT = emps.reduce((s, e) => s + e.ot_hours, 0)
            const unpaid = emps.filter(e => !e.salary_paid).length
            return (
              <div key={rest} style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ background: `${color}12`, borderBottom: '1px solid #e2e8f0', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{rest}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{emps.length} staff · {totalOT.toFixed(0)}h OT</span>
                  {unpaid > 0 && <span style={{ marginInlineStart: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#fef2f2', color: '#ef4444', fontWeight: 600 }}>{unpaid} unpaid</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  {Object.entries(byBranch).map(([branch, members]) => (
                    <div key={branch} style={{ padding: '12px 16px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{branch}</div>
                      {members.map(emp => (
                        <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: isLeader(emp) ? `${color}22` : '#f1f5f9', color: isLeader(emp) ? color : '#64748b' }}>
                            {isLeader(emp) ? '★' : emp.name[0]}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: isLeader(emp) ? 700 : 400, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name.split(' ')[0]}</div>
                            {emp.position && <div style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.position}</div>}
                          </div>
                          {emp.ot_hours > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: emp.ot_hours >= 40 ? '#ef4444' : '#f59e0b', flexShrink: 0 }}>{emp.ot_hours}h</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Review Work</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>{reviewTask.title} · {reviewTask.assigned_to}</p>
              </div>
              <button onClick={() => setReviewTask(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Timer */}
              {reviewTask.started_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 18 }}>⏱</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TIME TO COMPLETE</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                      {formatDuration(reviewTask.started_at, undefined, now)}
                    </div>
                  </div>
                </div>
              )}

              {/* Supervisor note */}
              {reviewTask.supervisor_note && (
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 9, border: '1px solid #e2e8f0', fontSize: 13, color: '#475569' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Supervisor Note</div>
                  {reviewTask.supervisor_note}
                </div>
              )}

              {/* Photos */}
              {reviewTask.photo_urls && reviewTask.photo_urls.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Work Photos ({reviewTask.photo_urls.length})</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {reviewTask.photo_urls.map((url, i) => (
                      <div key={i} onClick={() => { setLightboxPhotos(reviewTask.photo_urls!); setLightboxIdx(i) }}
                        style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', cursor: 'zoom-in', border: '1.5px solid #e2e8f0' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Your Comment</label>
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3}
                  placeholder="Great job! / Needs improvement on... / ..."
                  style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => (e.target.style.borderColor = '#f59e0b')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setReviewTask(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => markDone(reviewTask, reviewComment)} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: '#22c55e', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }}>
                  Mark Done ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Task Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 18, padding: 26, width: '100%', maxWidth: 440, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Assign Task</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <Field label="Task Title *">
                <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="Enter task title" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#f59e0b')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </Field>
              <Field label="Assign To *">
                <select value={draft.assigned_id} onChange={e => setDraft(d => ({ ...d, assigned_id: +e.target.value }))} style={inputStyle}>
                  <option value={0}>Select employee…</option>
                  {SEED_EMPLOYEES.filter(e => e.id !== 1).map(e => (
                    <option key={e.id} value={e.id}>{e.name} {e.position ? `· ${e.position}` : ''}</option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <textarea value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Optional details…" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Priority">
                  <select value={draft.priority} onChange={e => setDraft(d => ({ ...d, priority: e.target.value as Priority }))} style={inputStyle}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </Field>
                <Field label="Due Date">
                  <input type="date" value={draft.due_date} onChange={e => setDraft(d => ({ ...d, due_date: e.target.value }))} style={inputStyle} />
                </Field>
              </div>
              <button onClick={submitTask} disabled={!draft.title || !draft.assigned_id}
                style={{ padding: '12px', borderRadius: 10, border: 'none', background: draft.title && draft.assigned_id ? '#0f172a' : '#e2e8f0', color: draft.title && draft.assigned_id ? 'white' : '#94a3b8', fontSize: 14, fontWeight: 700, cursor: draft.title && draft.assigned_id ? 'pointer' : 'not-allowed', marginTop: 2 }}>
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxPhotos.length > 0 && (
        <div onClick={() => setLightboxPhotos([])} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + lightboxPhotos.length) % lightboxPhotos.length) }}
            style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 28, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer' }}>‹</button>
          <img src={lightboxPhotos[lightboxIdx]} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 10 }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % lightboxPhotos.length) }}
            style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 28, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer' }}>›</button>
          <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{lightboxIdx + 1} / {lightboxPhotos.length}</div>
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, now, showTimer, children }: { task: Task; now: number; showTimer?: boolean; children?: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ width: 4, borderRadius: 4, background: PRIORITY_COLOR[task.priority], alignSelf: 'stretch', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{task.title}</span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${PRIORITY_COLOR[task.priority]}18`, color: PRIORITY_COLOR[task.priority], fontWeight: 600 }}>{task.priority}</span>
        </div>
        {task.description && <p style={{ margin: '2px 0 4px', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{task.description}</p>}
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8', flexWrap: 'wrap', alignItems: 'center' }}>
          <span>👤 {task.assigned_to}</span>
          {task.branch && <span>📍 {task.branch}</span>}
          {task.due_date && <span>📅 {task.due_date}</span>}
          <span>By {task.created_by}</span>
          {showTimer && task.started_at && (
            <span style={{ fontWeight: 700, color: '#f59e0b', background: '#fef3c7', padding: '2px 8px', borderRadius: 99, fontVariantNumeric: 'tabular-nums' }}>
              ⏱ {formatDuration(task.started_at, undefined, now)}
            </span>
          )}
        </div>
      </div>
      {children && <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>{children}</div>}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: 14 }}>
      {text}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #e2e8f0',
  fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'white',
}

function btnStyle(bg: string, color = 'white', border?: string): React.CSSProperties {
  return {
    padding: '7px 14px', borderRadius: 8, border: border ? `1px solid ${border}` : 'none',
    background: bg, color, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
  }
}
