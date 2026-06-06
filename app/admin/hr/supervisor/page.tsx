'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_EMPLOYEES } from '@/lib/seed-data'
import { useLanguage } from '@/lib/language-context'

interface Employee {
  id: number; name: string; position: string; branch: string; shift: string
  restaurant?: string; ot_hours?: number
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
  redo_requested?: boolean; redo_reason?: string
}

const PRIORITY_COLORS: Record<Priority, { text: string; bg: string; label: string; labelAr: string }> = {
  low:    { text: '#16a34a', bg: '#dcfce7', label: 'Low',    labelAr: 'منخفض' },
  medium: { text: '#d97706', bg: '#fef3c7', label: 'Medium', labelAr: 'متوسط' },
  high:   { text: '#ef4444', bg: '#fef2f2', label: 'High',   labelAr: 'عالي'  },
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

export default function SupervisorPanel() {
  const { t, isAr } = useLanguage()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [supervisorId, setSupervisorId] = useState<number | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [modal, setModal] = useState(false)
  const [draft, setDraft] = useState({ title: '', description: '', assigned_id: 0, priority: 'medium' as Priority, due_date: '' })

  // Completion submission state
  const [completionTaskId, setCompletionTaskId] = useState<string | null>(null)
  const [completionFiles, setCompletionFiles] = useState<File[]>([])
  const [completionNote, setCompletionNote] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Lightbox
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([])
  const [lightboxIdx, setLightboxIdx] = useState(0)

  // Live clock
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
    const raw = data && data.length > 0 ? data : SEED_EMPLOYEES
    setEmployees(raw)
    setLoading(false)
  }

  function selectSupervisor(id: number) {
    setSupervisorId(id)
    localStorage.setItem('supervisor_identity', String(id))
  }

  function refreshTasks() {
    const latest = loadAllTasks()
    setTasks(latest)
    return latest
  }

  const supervisors = employees.filter(e => LEADER_POSITIONS.some(lp => e.position.includes(lp)) && e.id !== 1)
  const me = employees.find(e => e.id === supervisorId)
  const myTeam = me ? employees.filter(e =>
    e.branch === me.branch && e.shift === me.shift && e.id !== supervisorId && e.id !== 1
  ) : []
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
      const { data, error } = await supabase.storage
        .from('task-photos')
        .upload(path, file, { upsert: true })
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('task-photos').getPublicUrl(data.path)
        urls.push(publicUrl)
      }
    }

    const latest = loadAllTasks()
    const updated = latest.map(t => t.id === completionTaskId ? {
      ...t,
      completion_submitted: true,
      photo_urls: urls.length > 0 ? urls : t.photo_urls,
      supervisor_note: completionNote,
      status: 'in_progress' as TaskStatus,
      redo_requested: false, redo_reason: undefined,
    } : t)
    saveAllTasks(updated)
    setTasks(updated)
    setCompletionTaskId(null)
    setCompletionFiles([])
    setCompletionNote('')
    setUploading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ height: 72, background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-border2)' }} className="shimmer" />
      ))}
    </div>
  )

  /* ── Identity picker ── */
  if (!supervisorId || !me) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>{t('Supervisor Panel', 'لوحة المشرف')}</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>{t('Select your identity to continue', 'اختر هويتك للمتابعة')}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
        {supervisors.map(s => (
          <button key={s.id} onClick={() => selectSupervisor(s.id)} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
            background: 'var(--admin-card)', border: '1.5px solid var(--admin-border2)',
            borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
          }}
            onMouseOver={e => { e.currentTarget.style.border = '1.5px solid #25D366'; e.currentTarget.style.boxShadow = '0 0 0 3px #25D36622' }}
            onMouseOut={e => { e.currentTarget.style.border = '1.5px solid var(--admin-border2)'; e.currentTarget.style.boxShadow = 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {s.position.includes('Manager') ? '👑' : '🔑'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{s.name.split(' ')[0]}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.position} · {s.branch} · {s.shift}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        ))}
      </div>
    </div>
  )

  /* ── Main panel ── */
  const pending = myTasks.filter(t => !t.approved).length
  const approved = myTasks.filter(t => t.approved && !t.done_at).length
  const done = myTasks.filter(t => !!t.done_at).length
  const submittedForReview = myTasks.filter(t => t.completion_submitted && !t.done_at).length

  const completionTask = completionTaskId ? myTasks.find(t => t.id === completionTaskId) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ background: 'var(--admin-card)', borderRadius: 18, border: '1px solid var(--admin-border2)', overflow: 'hidden' }}>
        <div style={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
        <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔑</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)' }}>{me.name.split(' ')[0]}</div>
            <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>{me.position} · {me.branch} · {me.shift}</div>
          </div>
          <button onClick={() => { setSupervisorId(null); localStorage.removeItem('supervisor_identity') }}
            style={{ padding: '7px 12px', borderRadius: 9, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 12, color: '#64748b', cursor: 'pointer', fontWeight: 600 }}>
            {t('Switch', 'تبديل')}
          </button>
          <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#6366f1', border: 'none', borderRadius: 11, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t('New Task', 'مهمة جديدة')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gap: 12 }} className="admin-grid-4">
        {[
          { label: t('My Team', 'فريقي'), value: myTeam.length, color: '#6366f1' },
          { label: t('Awaiting Asjad', 'بانتظار أسجد'), value: pending, color: '#d97706' },
          { label: t('In Progress', 'جارٍ'), value: approved, color: '#2563eb' },
          { label: t('Completed', 'مكتمل'), value: done, color: '#16a34a' },
        ].map((c, i) => (
          <div key={i} style={{ background: 'var(--admin-card)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--admin-border2)', borderTop: `3px solid ${c.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)' }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tasks list */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>{t('Tasks I Assigned', 'المهام التي عيّنتها')}</h2>
        {myTasks.length === 0 ? (
          <div style={{ background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-border2)', padding: '36px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>{t('No tasks yet', 'لا توجد مهام بعد')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myTasks.map(task => {
              const pc = PRIORITY_COLORS[task.priority as Priority] ?? PRIORITY_COLORS.medium
              const isOverdue = task.due_date && task.due_date < today && !task.done_at
              const isDone = !!task.done_at
              const isSubmitted = task.completion_submitted && !isDone
              const isRedo = task.redo_requested && !task.completion_submitted && !isDone
              const isActive = task.approved && !task.completion_submitted && !isDone && !isRedo
              return (
                <div key={task.id} style={{ background: 'var(--admin-card)', borderRadius: 13, border: `1px solid ${isDone ? '#bbf7d0' : isSubmitted ? '#bfdbfe' : 'var(--admin-border2)'}`, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, opacity: isDone ? 0.8 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{task.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: pc.text, background: pc.bg }}>{isAr ? pc.labelAr : pc.label}</span>
                      {!task.approved && <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 20, color: '#d97706', background: '#fef3c7' }}>⏳ {t('Awaiting Asjad', 'بانتظار أسجد')}</span>}
                      {isActive && <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 20, color: '#2563eb', background: '#dbeafe' }}>▶ {t('In Progress', 'جارٍ')}</span>}
                      {isSubmitted && <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: '#1d4ed8', background: '#dbeafe' }}>📸 {t('Submitted for Review', 'بانتظار مراجعة أسجد')}</span>}
                      {isRedo && <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: '#dc2626', background: '#fee2e2' }}>↩ {t('Redo Requested', 'طلب إعادة')}</span>}
                      {isDone && <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: '#15803d', background: '#dcfce7' }}>✓ {t('Done', 'مكتمل')}</span>}
                    </div>
                    {task.description && <p style={{ fontSize: 12, color: '#64748b', marginBottom: 5 }}>{task.description}</p>}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>→ {task.assigned_to.split(' ')[0]}</span>
                      {task.due_date && <span style={{ fontSize: 11, color: isOverdue ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>{isOverdue ? '⚠ ' : ''}{task.due_date}</span>}
                      {isActive && task.started_at && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', background: '#fef3c7', padding: '1px 8px', borderRadius: 99, fontVariantNumeric: 'tabular-nums' }}>
                          ⏱ {formatDuration(task.started_at)}
                        </span>
                      )}
                      {isDone && task.started_at && task.done_at && (
                        <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>⏱ {formatDuration(task.started_at, task.done_at)}</span>
                      )}
                    </div>
                    {/* Redo reason */}
                    {isRedo && task.redo_reason && (
                      <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', fontSize: 12, color: '#dc2626' }}>
                        <strong>{t('Redo reason', 'سبب الإعادة')}:</strong> {task.redo_reason}
                      </div>
                    )}
                    {/* Manager comment on done */}
                    {isDone && task.asjad_comment && (
                      <div style={{ marginTop: 8, padding: '7px 10px', background: '#fef3c7', borderRadius: 7, fontSize: 12, color: '#92400e' }}>
                        <strong>{t('Manager', 'المدير')}:</strong> {task.asjad_comment}
                      </div>
                    )}
                    {/* Photos thumbnail row */}
                    {task.photo_urls && task.photo_urls.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        {task.photo_urls.slice(0, 4).map((url, i) => (
                          <div key={i} onClick={() => { setLightboxPhotos(task.photo_urls!); setLightboxIdx(i) }}
                            style={{ width: 44, height: 44, borderRadius: 7, overflow: 'hidden', cursor: 'zoom-in', border: '1.5px solid var(--admin-border2)', flexShrink: 0 }}>
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                        {task.photo_urls.length > 4 && <div style={{ width: 44, height: 44, borderRadius: 7, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#64748b', fontWeight: 700 }}>+{task.photo_urls.length - 4}</div>}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    {/* Submit / Resubmit button */}
                    {(isActive || isRedo) && (
                      <button onClick={() => { setCompletionTaskId(task.id); setCompletionNote(''); setCompletionFiles([]) }}
                        style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: isRedo ? '#ef4444' : '#22c55e', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {isRedo ? t('Resubmit', 'إعادة الإرسال') : t('Submit Done', 'إرسال للمراجعة')}
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

      {/* ── Completion Submission Modal ── */}
      {completionTaskId && completionTask && (
        <div className="mobile-modal" style={{ zIndex: 200 }}>
          <div className="mobile-modal-sheet" style={{ background: 'var(--admin-card)', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ borderTop: '4px solid #22c55e', borderRadius: '20px 20px 0 0', padding: '18px 22px', borderBottom: '1px solid var(--admin-border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>{t('Submit Completion', 'إرسال إتمام المهمة')}</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>{completionTask.title}</p>
              </div>
              <button onClick={() => setCompletionTaskId(null)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Photo upload */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                  {t('Work Photos', 'صور العمل')} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({t('optional', 'اختياري')})</span>
                </label>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => setCompletionFiles(Array.from(e.target.files || []))} />
                <button onClick={() => fileRef.current?.click()} style={{
                  width: '100%', padding: '20px', borderRadius: 12, border: '2px dashed var(--admin-border)',
                  background: completionFiles.length > 0 ? '#f0fdf4' : 'var(--admin-card)',
                  cursor: 'pointer', fontSize: 13, color: completionFiles.length > 0 ? '#16a34a' : '#94a3b8',
                  fontWeight: 600, transition: 'all 0.15s',
                }}>
                  {completionFiles.length > 0
                    ? `📸 ${completionFiles.length} photo${completionFiles.length > 1 ? 's' : ''} selected`
                    : `📷 ${t('Tap to add photos', 'اضغط لإضافة صور')}`}
                </button>
                {/* Preview thumbnails */}
                {completionFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {completionFiles.map((f, i) => {
                      const url = URL.createObjectURL(f)
                      return (
                        <div key={i} style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1.5px solid #bbf7d0', position: 'relative' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Note */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  {t('Note for Asjad', 'ملاحظة لأسجد')} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({t('optional', 'اختياري')})</span>
                </label>
                <textarea value={completionNote} onChange={e => setCompletionNote(e.target.value)} rows={3}
                  placeholder={t('Any notes about the completed work…', 'ملاحظات حول العمل المنجز…')}
                  className="admin-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--admin-border2)', display: 'flex', gap: 10 }}>
              <button onClick={() => setCompletionTaskId(null)} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                {t('Cancel', 'إلغاء')}
              </button>
              <button onClick={submitCompletion} disabled={uploading}
                style={{ flex: 2, padding: '11px', borderRadius: 11, border: 'none', fontSize: 13, fontWeight: 700, color: 'white', cursor: uploading ? 'not-allowed' : 'pointer', background: uploading ? '#86efac' : '#22c55e', boxShadow: uploading ? 'none' : '0 2px 8px rgba(34,197,94,0.3)' }}>
                {uploading ? t('Uploading…', 'جارٍ الرفع…') : t('Submit to Asjad', 'إرسال لأسجد ✓')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Task Modal ── */}
      {modal && (
        <div className="mobile-modal" style={{ zIndex: 200 }}>
          <div className="mobile-modal-sheet" style={{ background: 'var(--admin-card)', boxShadow: '0 25px 60px rgba(0,0,0,0.22)' }}>
            <div style={{ borderTop: '4px solid #6366f1', borderRadius: '20px 20px 0 0', padding: '18px 22px', borderBottom: '1px solid var(--admin-border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)' }}>{t('Assign Task', 'تعيين مهمة')}</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{t('Will be sent to Asjad for approval', 'سيُرسل إلى أسجد للموافقة')}</p>
              </div>
              <button onClick={() => setModal(false)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Assign to', 'تعيين إلى')} *</label>
                <select value={draft.assigned_id || ''} onChange={e => setDraft({ ...draft, assigned_id: Number(e.target.value) })} className="admin-select" style={{ fontWeight: 600 }}>
                  <option value="">{t('Select team member…', 'اختر عضواً في الفريق…')}</option>
                  {myTeam.map(e => <option key={e.id} value={e.id}>{e.name.split(' ')[0]} — {e.position || e.shift}</option>)}
                  <optgroup label={t('Other employees', 'موظفون آخرون')}>
                    {employees.filter(e => e.id !== supervisorId && e.id !== 1 && !myTeam.find(m => m.id === e.id)).map(e => (
                      <option key={e.id} value={e.id}>{e.name.split(' ')[0]} — {e.branch}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Task Title', 'عنوان المهمة')} *</label>
                <input type="text" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })}
                  placeholder={t('e.g. Restock supplies', 'مثال: إعادة تخزين المستلزمات')} className="admin-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Description', 'الوصف')} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({t('optional', 'اختياري')})</span></label>
                <textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })}
                  className="admin-input" rows={2} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Priority', 'الأولوية')}</label>
                  <select value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value as Priority })}
                    className="admin-select" style={{ fontWeight: 700, color: PRIORITY_COLORS[draft.priority].text, background: PRIORITY_COLORS[draft.priority].bg, border: 'none', borderRadius: 8 }}>
                    <option value="low">{t('Low', 'منخفض')}</option>
                    <option value="medium">{t('Medium', 'متوسط')}</option>
                    <option value="high">{t('High', 'عالي')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Due Date', 'تاريخ الاستحقاق')}</label>
                  <input type="date" value={draft.due_date} min={today} onChange={e => setDraft({ ...draft, due_date: e.target.value })} className="admin-input" />
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--admin-border2)', display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 11, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                {t('Cancel', 'إلغاء')}
              </button>
              <button onClick={submitTask} disabled={!draft.title.trim() || !draft.assigned_id}
                style={{ flex: 2, padding: '10px', borderRadius: 11, border: 'none', fontSize: 13, fontWeight: 700, color: 'white', cursor: draft.title.trim() && draft.assigned_id ? 'pointer' : 'not-allowed', background: draft.title.trim() && draft.assigned_id ? '#6366f1' : '#94a3b8' }}>
                {t('Submit for Approval', 'إرسال للموافقة')}
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
