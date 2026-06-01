'use client'

import { useEffect, useState } from 'react'
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
  approved: boolean; approved_at?: string
}

const PRIORITY_COLORS: Record<Priority, { text: string; bg: string; label: string; labelAr: string }> = {
  low:    { text: '#16a34a', bg: '#dcfce7', label: 'Low',    labelAr: 'منخفض' },
  medium: { text: '#d97706', bg: '#fef3c7', label: 'Medium', labelAr: 'متوسط' },
  high:   { text: '#ef4444', bg: '#fef2f2', label: 'High',   labelAr: 'عالي'  },
}
const STATUS_COLORS: Record<TaskStatus, { text: string; bg: string; label: string; labelAr: string }> = {
  pending:     { text: '#94a3b8', bg: '#f8fafc', label: 'Pending',     labelAr: 'معلق'  },
  in_progress: { text: '#2563eb', bg: '#dbeafe', label: 'In Progress', labelAr: 'جارٍ'  },
  done:        { text: '#16a34a', bg: '#dcfce7', label: 'Done',        labelAr: 'مكتمل' },
}
const LEADER_POSITIONS = ['Supervisor', 'Manager', 'Head Chef', 'Bakery Chef', 'Operation Manager']

function loadAllTasks(): Task[] {
  try { return JSON.parse(localStorage.getItem('all_tasks') || '[]') } catch { return [] }
}
function saveAllTasks(tasks: Task[]) {
  localStorage.setItem('all_tasks', JSON.stringify(tasks))
}

export default function SupervisorPanel() {
  const { t, isAr } = useLanguage()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [supervisorId, setSupervisorId] = useState<number | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [modal, setModal] = useState(false)
  const [draft, setDraft] = useState({ title: '', description: '', assigned_id: 0, priority: 'medium' as Priority, due_date: '' })

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

  function updateTaskStatus(id: string, status: TaskStatus) {
    const updated = loadAllTasks().map(t => t.id === id ? { ...t, status } : t)
    saveAllTasks(updated)
    setTasks(updated)
  }

  function deleteTask(id: string) {
    const updated = loadAllTasks().filter(t => t.id !== id)
    saveAllTasks(updated)
    setTasks(updated)
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
  const approved = myTasks.filter(t => t.approved).length
  const done = myTasks.filter(t => t.status === 'done').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ background: 'var(--admin-card)', borderRadius: 18, border: '1px solid var(--admin-border2)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ height: 5, background: 'linear-gradient(90deg, #2563eb, #6366f1)' }} />
        <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔑</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--admin-text)' }}>{me.name.split(' ')[0]}</div>
            <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, marginTop: 2 }}>{me.position} · {me.branch} · {me.shift}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => { setSupervisorId(null); localStorage.removeItem('supervisor_identity') }}
              style={{ padding: '7px 12px', borderRadius: 9, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 12, color: '#64748b', cursor: 'pointer', fontWeight: 600 }}>
              {t('Switch', 'تبديل')}
            </button>
            <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#6366f1', border: 'none', borderRadius: 11, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {t('New Task', 'مهمة جديدة')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: t('My Team', 'فريقي'), value: myTeam.length, color: '#6366f1' },
          { label: t('Tasks Sent', 'مهام مُرسلة'), value: myTasks.length, color: '#0f172a' },
          { label: t('Awaiting Asjad', 'بانتظار أسجد'), value: pending, color: '#d97706' },
          { label: t('Approved', 'معتمد'), value: approved, color: '#16a34a' },
        ].map((c, i) => (
          <div key={i} style={{ background: 'var(--admin-card)', borderRadius: 13, padding: '14px 16px', border: '1px solid var(--admin-border2)', borderTop: `3px solid ${c.color}` }}>
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
            <div style={{ fontSize: 13, color: '#94a3b8' }}>{t('No tasks yet — assign your first task to a team member', 'لا توجد مهام — عيّن مهمتك الأولى لعضو في الفريق')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myTasks.map(task => {
              const pc = PRIORITY_COLORS[task.priority]
              const sc = STATUS_COLORS[task.status]
              const isOverdue = task.due_date && task.due_date < today && task.status !== 'done'
              return (
                <div key={task.id} style={{ background: 'var(--admin-card)', borderRadius: 13, border: '1px solid var(--admin-border2)', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{task.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: pc.text, background: pc.bg }}>{isAr ? pc.labelAr : pc.label}</span>
                      {task.approved
                        ? <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: '#16a34a', background: '#dcfce7' }}>✓ {t('Approved', 'معتمد')}</span>
                        : <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 20, color: '#d97706', background: '#fef3c7' }}>⏳ {t('Awaiting Asjad', 'بانتظار أسجد')}</span>}
                    </div>
                    {task.description && <p style={{ fontSize: 12, color: '#64748b', marginBottom: 5 }}>{task.description}</p>}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>→ {task.assigned_to.split(' ')[0]}</span>
                      {task.due_date && <span style={{ fontSize: 11, color: isOverdue ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>{isOverdue ? '⚠ ' : ''}{task.due_date}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {task.approved && (
                      <select value={task.status} onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className="admin-select" style={{ fontSize: 11, padding: '4px 8px', fontWeight: 600, color: sc.text, background: sc.bg, border: 'none', borderRadius: 8 }}>
                        <option value="pending">{t('Pending', 'معلق')}</option>
                        <option value="in_progress">{t('In Progress', 'جارٍ')}</option>
                        <option value="done">{t('Done', 'مكتمل')}</option>
                      </select>
                    )}
                    <button onClick={() => deleteTask(task.id)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 25px 60px rgba(0,0,0,0.22)' }}>
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
                <select value={draft.assigned_id || ''} onChange={e => setDraft({ ...draft, assigned_id: Number(e.target.value) })}
                  className="admin-select" style={{ fontWeight: 600 }}>
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
                style={{ flex: 2, padding: '10px', borderRadius: 11, border: 'none', fontSize: 13, fontWeight: 700, color: 'white', cursor: draft.title.trim() && draft.assigned_id ? 'pointer' : 'not-allowed',
                  background: draft.title.trim() && draft.assigned_id ? '#6366f1' : '#94a3b8',
                  boxShadow: draft.title.trim() && draft.assigned_id ? '0 2px 8px rgba(99,102,241,0.3)' : 'none' }}>
                {t('Submit for Approval', 'إرسال للموافقة')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
