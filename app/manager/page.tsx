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
  approved: boolean; approved_at?: string
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

const OT_RATE = 14.58
const BRANCHES = ['Ar Rayyan', 'Malqa', 'Hittin']
const RESTAURANTS = ['Ghabashi', 'Appetie', 'Piece Bakery']
const RESTAURANT_COLOR: Record<string, string> = {
  'Ghabashi': '#10b981', 'Appetie': '#f59e0b', 'Piece Bakery': '#a855f7',
}
const LEADER_POSITIONS = ['Manager', 'Operation Manager', 'Supervisor', 'Head Chef', 'Bakery Chef']
const isLeader = (e: typeof SEED_EMPLOYEES[0]) =>
  LEADER_POSITIONS.some(lp => e.position.includes(lp))

function calcTotal(e: typeof SEED_EMPLOYEES[0]) {
  return e.basic_salary + e.ot_hours * OT_RATE
}

type TabId = 'approvals' | 'tasks' | 'team'

export default function ManagerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tab, setTab] = useState<TabId>('approvals')
  const [showModal, setShowModal] = useState(false)
  const [draft, setDraft] = useState({
    title: '', description: '', assigned_id: 0,
    branch: '', priority: 'medium' as Priority, due_date: '',
  })
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('all_tasks')
      if (raw) setTasks(JSON.parse(raw))
    } catch { /**/ }
  }, [])

  function saveTasks(next: Task[]) {
    setTasks(next)
    localStorage.setItem('all_tasks', JSON.stringify(next))
  }

  function approveTask(id: string) {
    saveTasks(tasks.map(t => t.id === id
      ? { ...t, approved: true, approved_at: new Date().toISOString(), status: 'pending' }
      : t
    ))
  }

  function rejectTask(id: string) {
    saveTasks(tasks.filter(t => t.id !== id))
  }

  function updateStatus(id: string, status: TaskStatus) {
    saveTasks(tasks.map(t => t.id === id ? { ...t, status } : t))
  }

  function submitTask() {
    if (!draft.title || !draft.assigned_id) return
    const emp = SEED_EMPLOYEES.find(e => e.id === draft.assigned_id)
    if (!emp) return
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: draft.title,
      description: draft.description,
      assigned_to: emp.name,
      assigned_id: emp.id,
      branch: draft.branch || emp.branch,
      priority: draft.priority,
      status: 'pending',
      due_date: draft.due_date,
      created_at: new Date().toISOString(),
      created_by: 'Asjad',
      created_by_id: 1,
      created_by_role: 'asjad',
      approved: true,
      approved_at: new Date().toISOString(),
    }
    saveTasks([...tasks, newTask])
    setDraft({ title: '', description: '', assigned_id: 0, branch: '', priority: 'medium', due_date: '' })
    setShowModal(false)
  }

  const pendingApprovals = tasks.filter(t => !t.approved)
  const approvedTasks = tasks.filter(t => t.approved)
  const myTasks = tasks.filter(t => t.approved && t.created_by_role === 'asjad')

  const unpaidCount = SEED_EMPLOYEES.filter(e => !e.salary_paid).length
  const highOtCount = SEED_EMPLOYEES.filter(e => e.ot_hours >= 40).length
  const onVacation = SEED_EMPLOYEES.filter(e => e.vacation_status !== 'none').length

  const displayTasks = tab === 'approvals' ? pendingApprovals : tab === 'tasks' ? myTasks : approvedTasks

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'approvals', label: 'Approvals', count: pendingApprovals.length },
    { id: 'tasks', label: 'My Tasks', count: myTasks.length },
    { id: 'team', label: 'Team Overview' },
  ]

  return (
    <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Operations Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Ghabashi Group · All Branches</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: '#0f172a', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Assign Task
        </button>
      </div>

      {/* Alert banners */}
      {pendingApprovals.length > 0 && (
        <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚠️</span>
          <strong>{pendingApprovals.length} task{pendingApprovals.length > 1 ? 's' : ''} waiting for your approval</strong>
          <button onClick={() => setTab('approvals')} style={{ marginInlineStart: 8, background: 'none', border: 'none', color: '#f59e0b', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Review →</button>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Staff', value: SEED_EMPLOYEES.length, color: '#3b82f6', icon: '👥' },
          { label: 'Pending Approvals', value: pendingApprovals.length, color: '#f59e0b', icon: '⏳' },
          { label: 'Unpaid Salaries', value: unpaidCount, color: '#ef4444', icon: '💸' },
          { label: 'High OT (40h+)', value: highOtCount, color: '#f97316', icon: '⏰' },
          { label: 'On Vacation', value: onVacation, color: '#a855f7', icon: '✈️' },
        ].map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 18px', borderRadius: '8px 8px 0 0', border: 'none',
            background: tab === t.id ? 'white' : 'transparent',
            color: tab === t.id ? '#0f172a' : '#64748b',
            fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer',
            borderBottom: tab === t.id ? '2px solid #f59e0b' : '2px solid transparent',
            transition: 'all 0.15s', position: 'relative', top: 1,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{ background: t.id === 'approvals' ? '#f59e0b' : '#0f172a', color: 'white', borderRadius: 99, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab !== 'team' ? (
        <div>
          {displayTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: 14 }}>
              {tab === 'approvals' ? 'No pending approvals — all clear ✓' : 'No tasks yet'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayTasks.map(task => (
                <div key={task.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: 4, borderRadius: 4, background: PRIORITY_COLOR[task.priority], alignSelf: 'stretch', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{task.title}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${PRIORITY_COLOR[task.priority]}20`, color: PRIORITY_COLOR[task.priority], fontWeight: 600 }}>{task.priority}</span>
                      {task.approved && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${STATUS_COLOR[task.status]}20`, color: STATUS_COLOR[task.status], fontWeight: 600 }}>{STATUS_LABEL[task.status]}</span>
                      )}
                    </div>
                    {task.description && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{task.description}</p>}
                    <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12, color: '#94a3b8', flexWrap: 'wrap' }}>
                      <span>👤 {task.assigned_to}</span>
                      {task.branch && <span>📍 {task.branch}</span>}
                      {task.due_date && <span>📅 {task.due_date}</span>}
                      <span>🖊 By {task.created_by}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    {!task.approved ? (
                      <>
                        <button onClick={() => approveTask(task.id)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#22c55e', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                        <button onClick={() => rejectTask(task.id)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #fca5a5', background: 'transparent', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                      </>
                    ) : (
                      <select value={task.status} onChange={e => updateStatus(task.id, e.target.value as TaskStatus)}
                        style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, color: '#0f172a', cursor: 'pointer', outline: 'none' }}>
                        {(Object.keys(STATUS_LABEL) as TaskStatus[]).map(s => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Team overview by restaurant */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {RESTAURANTS.map(rest => {
            const emps = SEED_EMPLOYEES.filter(e => e.restaurant === rest)
            if (emps.length === 0) return null
            const color = RESTAURANT_COLOR[rest]
            const byBranch: Record<string, typeof emps> = {}
            emps.forEach(e => { const b = e.branch || 'Unassigned'; (byBranch[b] = byBranch[b] || []).push(e) })
            const totalOT = emps.reduce((s, e) => s + e.ot_hours, 0)
            const unpaid = emps.filter(e => !e.salary_paid).length

            return (
              <div key={rest} style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ background: `${color}15`, borderBottom: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{rest}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{emps.length} staff</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>·</span>
                  <span style={{ fontSize: 12, color: '#f97316' }}>{totalOT.toFixed(0)}h OT total</span>
                  {unpaid > 0 && <span style={{ marginInlineStart: 'auto', fontSize: 11, padding: '3px 10px', borderRadius: 99, background: '#fef2f2', color: '#ef4444', fontWeight: 600 }}>{unpaid} unpaid</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 0 }}>
                  {Object.entries(byBranch).map(([branch, members]) => (
                    <div key={branch} style={{ padding: '14px 18px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{branch}</div>
                      {members.map(emp => (
                        <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                            background: isLeader(emp) ? `${color}25` : '#f1f5f9',
                            color: isLeader(emp) ? color : '#475569',
                          }}>
                            {isLeader(emp) ? '★' : emp.name[0]}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: isLeader(emp) ? 700 : 500, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{emp.name.split(' ')[0]}</div>
                            {emp.position && <div style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{emp.position}</div>}
                          </div>
                          {emp.ot_hours > 0 && (
                            <span style={{ marginInlineStart: 'auto', fontSize: 10, fontWeight: 700, color: emp.ot_hours >= 40 ? '#ef4444' : '#f59e0b', flexShrink: 0 }}>{emp.ot_hours}h</span>
                          )}
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

      {/* Assign Task Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 18, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Assign Task</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Task Title *</label>
                <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="Enter task title"
                  style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => (e.target.style.borderColor = '#f59e0b')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Assign To *</label>
                <select value={draft.assigned_id} onChange={e => setDraft(d => ({ ...d, assigned_id: +e.target.value }))}
                  style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', cursor: 'pointer', background: 'white' }}>
                  <option value={0}>Select employee…</option>
                  {SEED_EMPLOYEES.filter(e => e.id !== 1).map(e => (
                    <option key={e.id} value={e.id}>{e.name} {e.position ? `· ${e.position}` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</label>
                <textarea value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} rows={3} placeholder="Optional details…"
                  style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => (e.target.style.borderColor = '#f59e0b')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Priority</label>
                  <select value={draft.priority} onChange={e => setDraft(d => ({ ...d, priority: e.target.value as Priority }))}
                    style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', cursor: 'pointer', background: 'white', boxSizing: 'border-box' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Due Date</label>
                  <input type="date" value={draft.due_date} onChange={e => setDraft(d => ({ ...d, due_date: e.target.value }))}
                    style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }} />
                </div>
              </div>
              <button onClick={submitTask} disabled={!draft.title || !draft.assigned_id}
                style={{ padding: '12px', borderRadius: 10, border: 'none', background: draft.title && draft.assigned_id ? '#0f172a' : '#e2e8f0', color: draft.title && draft.assigned_id ? 'white' : '#94a3b8', fontSize: 14, fontWeight: 700, cursor: draft.title && draft.assigned_id ? 'pointer' : 'not-allowed', marginTop: 4 }}>
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
