'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_EMPLOYEES } from '@/lib/seed-data'

interface Employee {
  id: number; name: string; position: string; branch: string; shift: string; restaurant?: string
}

type Priority = 'low' | 'medium' | 'high'
type TaskStatus = 'pending' | 'in_progress' | 'done'

interface Task {
  id: string; title: string; description: string
  assigned_to: string; assigned_id: number; branch: string
  priority: Priority; status: TaskStatus; due_date: string; created_at: string
  created_by: string; created_by_id: number; created_by_role: 'asjad' | 'supervisor'
  approved: boolean; approved_at?: string; started_at?: string
  completion_submitted?: boolean; photo_urls?: string[]; supervisor_note?: string
  asjad_comment?: string; done_at?: string
}

const PRIORITY_COLORS: Record<Priority, { text: string; bg: string; label: string }> = {
  low:    { text: '#16a34a', bg: '#dcfce7', label: 'Low'    },
  medium: { text: '#d97706', bg: '#fef3c7', label: 'Medium' },
  high:   { text: '#ef4444', bg: '#fef2f2', label: 'High'   },
}
const LEADER_POSITIONS = ['Supervisor', 'Manager', 'Head Chef', 'Bakery Chef', 'Operation Manager']

function loadAllTasks(): Task[] {
  try { return JSON.parse(localStorage.getItem('all_tasks') || '[]') } catch { return [] }
}
function saveAllTasks(tasks: Task[]) {
  localStorage.setItem('all_tasks', JSON.stringify(tasks))
}
function formatDuration(startIso: string, endIso?: string): string {
  const diff = (endIso ? new Date(endIso).getTime() : Date.now()) - new Date(startIso).getTime()
  if (diff < 0) return '0s'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function SupervisorPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [supervisorId, setSupervisorId] = useState<number | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [modal, setModal] = useState(false)
  const [draft, setDraft] = useState({ title: '', description: '', assigned_id: 0, priority: 'medium' as Priority, due_date: '' })

  const [completionTaskId, setCompletionTaskId] = useState<string | null>(null)
  const [completionFiles, setCompletionFiles] = useState<File[]>([])
  const [completionNote, setCompletionNote] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([])
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('supervisor_identity')
    if (saved) setSupervisorId(Number(saved))
    loadData()
    setTasks(loadAllTasks())
  }, [])

  async function loadData() {
    setLoading(true)
    const { data } = await supabase.from('employees').select('*').order('id')
    setEmployees(data && data.length > 0 ? data : SEED_EMPLOYEES)
    setLoading(false)
  }

  function selectSupervisor(id: number) {
    setSupervisorId(id)
    localStorage.setItem('supervisor_identity', String(id))
  }

  const supervisors = employees.filter(e => LEADER_POSITIONS.some(lp => e.position?.includes(lp)) && e.id !== 1)
  const me = employees.find(e => e.id === supervisorId)
  const myTeam = me ? employees.filter(e => e.branch === me.branch && e.shift === me.shift && e.id !== supervisorId && e.id !== 1) : []
  const myTasks = tasks.filter(t => t.created_by_id === supervisorId)
  const today = new Date().toISOString().slice(0, 10)

  function submitTask() {
    if (!draft.title.trim() || !draft.assigned_id || !me || !supervisorId) return
    const assigned = employees.find(e => e.id === draft.assigned_id)
    if (!assigned) return
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: draft.title, description: draft.description,
      assigned_to: assigned.name, assigned_id: draft.assigned_id,
      branch: assigned.branch, priority: draft.priority,
      status: 'pending', due_date: draft.due_date,
      created_at: new Date().toISOString(),
      created_by: me.name, created_by_id: supervisorId,
      created_by_role: 'supervisor', approved: false,
    }
    const updated = [newTask, ...loadAllTasks()]
    saveAllTasks(updated)
    setTasks(updated)
    setDraft({ title: '', description: '', assigned_id: 0, priority: 'medium', due_date: '' })
    setModal(false)
  }

  function deleteTask(id: string) {
    const updated = loadAllTasks().filter(t => t.id !== id)
    saveAllTasks(updated)
    setTasks(updated)
  }

  async function submitCompletion() {
    if (!completionTaskId) return
    setUploading(true)
    const urls: string[] = []
    for (const file of completionFiles) {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${completionTaskId}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('task-photos').upload(path, file, { upsert: true })
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('task-photos').getPublicUrl(data.path)
        urls.push(publicUrl)
      }
    }
    const latest = loadAllTasks()
    const updated = latest.map(t => t.id === completionTaskId ? {
      ...t, completion_submitted: true,
      photo_urls: urls.length > 0 ? urls : t.photo_urls,
      supervisor_note: completionNote,
      status: 'in_progress' as TaskStatus,
    } : t)
    saveAllTasks(updated)
    setTasks(updated)
    setCompletionTaskId(null)
    setCompletionFiles([])
    setCompletionNote('')
    setUploading(false)
  }

  const completionTask = completionTaskId ? myTasks.find(t => t.id === completionTaskId) : null

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[1, 2, 3].map(i => <div key={i} style={{ height: 64, borderRadius: 12, background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
    </div>
  )

  /* ── Identity picker ── */
  if (!supervisorId || !me) return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Who are you?</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Select your name to continue</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {supervisors.map(s => (
          <button key={s.id} onClick={() => selectSupervisor(s.id)} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
            background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 14,
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px #6366f122' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {s.position?.includes('Manager') ? '👑' : '🔑'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{s.name.split(' ')[0]}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.position} · {s.branch} · {s.shift}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        ))}
      </div>
    </div>
  )

  const pendingCount = myTasks.filter(t => !t.approved).length
  const activeCount = myTasks.filter(t => t.approved && !t.completion_submitted && !t.done_at).length
  const reviewCount = myTasks.filter(t => t.completion_submitted && !t.done_at).length
  const doneCount = myTasks.filter(t => !!t.done_at).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header card */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔑</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{me.name.split(' ')[0]}</div>
            <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>{me.position} · {me.branch} · {me.shift}</div>
          </div>
          <button onClick={() => { setSupervisorId(null); localStorage.removeItem('supervisor_identity') }}
            style={{ padding: '7px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 12, color: '#64748b', cursor: 'pointer', fontWeight: 600 }}>
            Switch
          </button>
          <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#6366f1', border: 'none', borderRadius: 11, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Awaiting Asjad', value: pendingCount, color: '#d97706' },
          { label: 'In Progress', value: activeCount, color: '#2563eb' },
          { label: 'Submitted', value: reviewCount, color: '#7c3aed' },
          { label: 'Done', value: doneCount, color: '#16a34a' },
        ].map((c, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '13px 14px', border: '1px solid #e2e8f0', borderTop: `3px solid ${c.color}` }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>My Tasks</h2>
        {myTasks.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>No tasks yet — assign your first task</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myTasks.map(task => {
              const pc = PRIORITY_COLORS[task.priority as Priority] ?? PRIORITY_COLORS.medium
              const isOverdue = task.due_date && task.due_date < today && !task.done_at
              const isDone = !!task.done_at
              const isSubmitted = task.completion_submitted && !isDone
              const isActive = task.approved && !task.completion_submitted && !isDone

              return (
                <div key={task.id} style={{
                  background: 'white', borderRadius: 13,
                  border: `1px solid ${isDone ? '#bbf7d0' : isSubmitted ? '#c7d2fe' : '#e2e8f0'}`,
                  padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)', opacity: isDone ? 0.8 : 1,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{task.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: pc.text, background: pc.bg }}>{pc.label}</span>
                      {!task.approved && <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 20, color: '#d97706', background: '#fef3c7' }}>⏳ Awaiting Asjad</span>}
                      {isActive && <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: '#2563eb', background: '#dbeafe' }}>▶ In Progress</span>}
                      {isSubmitted && <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: '#7c3aed', background: '#ede9fe' }}>📸 Awaiting Review</span>}
                      {isDone && <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: '#15803d', background: '#dcfce7' }}>✓ Done</span>}
                    </div>

                    {task.description && <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 6px', lineHeight: 1.5 }}>{task.description}</p>}

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 12, color: '#94a3b8' }}>
                      <span>→ {task.assigned_to.split(' ')[0]}</span>
                      {task.due_date && <span style={{ color: isOverdue ? '#ef4444' : '#94a3b8' }}>{isOverdue ? '⚠ ' : ''}{task.due_date}</span>}
                      {isActive && task.started_at && (
                        <span style={{ fontWeight: 700, color: '#f59e0b', background: '#fef3c7', padding: '1px 8px', borderRadius: 99, fontVariantNumeric: 'tabular-nums' }}>
                          ⏱ {formatDuration(task.started_at)}
                        </span>
                      )}
                      {isDone && task.started_at && task.done_at && (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>⏱ {formatDuration(task.started_at, task.done_at)}</span>
                      )}
                    </div>

                    {/* Asjad's comment */}
                    {isDone && task.asjad_comment && (
                      <div style={{ marginTop: 8, padding: '7px 10px', background: '#fef3c7', borderRadius: 7, fontSize: 12, color: '#92400e' }}>
                        <strong>👑 Asjad:</strong> {task.asjad_comment}
                      </div>
                    )}

                    {/* Photos */}
                    {task.photo_urls && task.photo_urls.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {task.photo_urls.slice(0, 4).map((url, i) => (
                          <div key={i} onClick={() => { setLightboxPhotos(task.photo_urls!); setLightboxIdx(i) }}
                            style={{ width: 44, height: 44, borderRadius: 7, overflow: 'hidden', cursor: 'zoom-in', border: '1.5px solid #e2e8f0', flexShrink: 0 }}>
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    {isActive && (
                      <button onClick={() => { setCompletionTaskId(task.id); setCompletionNote(''); setCompletionFiles([]) }}
                        style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: '#22c55e', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        Submit Done 📸
                      </button>
                    )}
                    {!isDone && !isSubmitted && (
                      <button onClick={() => deleteTask(task.id)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Completion Modal ── */}
      {completionTaskId && completionTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ borderTop: '4px solid #22c55e', borderRadius: '20px 20px 0 0', padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Submit Completion</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>{completionTask.title}</p>
              </div>
              <button onClick={() => setCompletionTaskId(null)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Work Photos <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => setCompletionFiles(Array.from(e.target.files || []))} />
                <button onClick={() => fileRef.current?.click()} style={{
                  width: '100%', padding: '20px', borderRadius: 12,
                  border: `2px dashed ${completionFiles.length > 0 ? '#86efac' : '#e2e8f0'}`,
                  background: completionFiles.length > 0 ? '#f0fdf4' : '#f8fafc',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  color: completionFiles.length > 0 ? '#16a34a' : '#94a3b8',
                }}>
                  {completionFiles.length > 0 ? `📸 ${completionFiles.length} photo${completionFiles.length > 1 ? 's' : ''} selected` : '📷 Tap to add photos'}
                </button>
                {completionFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {completionFiles.map((f, i) => (
                      <div key={i} style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1.5px solid #bbf7d0' }}>
                        <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Note for Asjad <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
                <textarea value={completionNote} onChange={e => setCompletionNote(e.target.value)} rows={3}
                  placeholder="Any notes about the completed work…"
                  style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => (e.target.style.borderColor = '#22c55e')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10 }}>
              <button onClick={() => setCompletionTaskId(null)} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitCompletion} disabled={uploading}
                style={{ flex: 2, padding: '11px', borderRadius: 11, border: 'none', fontSize: 13, fontWeight: 700, color: 'white', cursor: uploading ? 'not-allowed' : 'pointer', background: uploading ? '#86efac' : '#22c55e' }}>
                {uploading ? 'Uploading…' : 'Submit to Asjad ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Task Modal ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ borderTop: '4px solid #6366f1', borderRadius: '20px 20px 0 0', padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Assign Task</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>Will be sent to Asjad for approval</p>
              </div>
              <button onClick={() => setModal(false)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Assign to *</label>
                <select value={draft.assigned_id || ''} onChange={e => setDraft({ ...draft, assigned_id: Number(e.target.value) })} style={selectStyle}>
                  <option value="">Select team member…</option>
                  {myTeam.map(e => <option key={e.id} value={e.id}>{e.name.split(' ')[0]} — {e.position || e.shift}</option>)}
                  <optgroup label="Other employees">
                    {employees.filter(e => e.id !== supervisorId && e.id !== 1 && !myTeam.find(m => m.id === e.id)).map(e => (
                      <option key={e.id} value={e.id}>{e.name.split(' ')[0]} — {e.branch}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Task Title *</label>
                <input type="text" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g. Restock supplies" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
              <div>
                <label style={labelStyle}>Description <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
                <textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }} rows={2} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value as Priority })} style={selectStyle}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Due Date</label>
                  <input type="date" value={draft.due_date} min={today} onChange={e => setDraft({ ...draft, due_date: e.target.value })} style={inputStyle} />
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitTask} disabled={!draft.title.trim() || !draft.assigned_id}
                style={{ flex: 2, padding: '10px', borderRadius: 11, border: 'none', fontSize: 13, fontWeight: 700, color: 'white', cursor: draft.title.trim() && draft.assigned_id ? 'pointer' : 'not-allowed', background: draft.title.trim() && draft.assigned_id ? '#6366f1' : '#94a3b8' }}>
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhotos.length > 0 && (
        <div onClick={() => setLightboxPhotos([])} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + lightboxPhotos.length) % lightboxPhotos.length) }}
            style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: 28, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer' }}>‹</button>
          <img src={lightboxPhotos[lightboxIdx]} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 10 }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % lightboxPhotos.length) }}
            style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: 28, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer' }}>›</button>
          <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{lightboxIdx + 1} / {lightboxPhotos.length}</div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'white' }
const selectStyle: React.CSSProperties = { width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white', cursor: 'pointer' }
