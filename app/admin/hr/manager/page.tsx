'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_EMPLOYEES } from '@/lib/seed-data'
import { useLanguage } from '@/lib/language-context'

interface Employee {
  id: number; name: string; iqama: string; iban: string
  basic_salary: number; position: string; branch: string; shift: string
  ot_hours: number; ot_rate: number; ot_pay: number; net_pay: number
  salary_paid: boolean; vacation_status: 'none' | 'on_vacation' | 'taken'
  restaurant?: string; vacation_start?: string; vacation_end?: string
}

type Priority = 'low' | 'medium' | 'high'
type TaskStatus = 'pending' | 'in_progress' | 'done'

interface Task {
  id: string
  title: string
  description: string
  assigned_to: string
  assigned_id: number
  branch: string
  priority: Priority
  status: TaskStatus
  due_date: string
  created_at: string
}

const BRANCH_COLORS: Record<string, { text: string; bg: string }> = {
  'Ar Rayyan': { text: '#16a34a', bg: '#dcfce7' },
  'Hittin':    { text: '#7c3aed', bg: '#ede9fe' },
  'Malqa':     { text: '#2563eb', bg: '#dbeafe' },
}
const SHIFT_COLORS: Record<string, { text: string; bg: string }> = {
  'Morning':      { text: '#d97706', bg: '#fef3c7' },
  'Night':        { text: '#4f46e5', bg: '#e0e7ff' },
  'Double Shift': { text: '#ea580c', bg: '#fff7ed' },
  'Evening':      { text: '#db2777', bg: '#fce7f3' },
}
const PRIORITY_COLORS: Record<Priority, { text: string; bg: string; label: string; labelAr: string }> = {
  low:    { text: '#16a34a', bg: '#dcfce7', label: 'Low',    labelAr: 'منخفض' },
  medium: { text: '#d97706', bg: '#fef3c7', label: 'Medium', labelAr: 'متوسط' },
  high:   { text: '#ef4444', bg: '#fef2f2', label: 'High',   labelAr: 'عالي'  },
}
const STATUS_COLORS: Record<TaskStatus, { text: string; bg: string; label: string; labelAr: string }> = {
  pending:     { text: '#94a3b8', bg: '#f8fafc', label: 'Pending',     labelAr: 'معلق'      },
  in_progress: { text: '#2563eb', bg: '#dbeafe', label: 'In Progress', labelAr: 'جارٍ'      },
  done:        { text: '#16a34a', bg: '#dcfce7', label: 'Done',        labelAr: 'مكتمل'     },
}

function calcOT(basic: number, otHrs: number) {
  const rate = basic / 30 / 8 * 1.25
  return { ot_rate: rate, ot_pay: rate * otHrs, net_pay: basic + rate * otHrs }
}

const EMPTY_TASK = (): Omit<Task, 'id' | 'created_at'> => ({
  title: '', description: '', assigned_to: '', assigned_id: 0,
  branch: '', priority: 'medium', status: 'pending', due_date: '',
})

export default function ManagerDashboard() {
  const { t, isAr } = useLanguage()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskModal, setTaskModal] = useState<{ open: boolean; draft: Omit<Task, 'id' | 'created_at'> } | null>(null)
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')

  useEffect(() => { loadData(); loadTasks() }, [])

  async function loadData() {
    setLoading(true)
    const { data } = await supabase.from('employees').select('*').order('id')
    const raw = data && data.length > 0 ? data : SEED_EMPLOYEES
    setEmployees(raw.map((e: any) => {
      const { ot_rate, ot_pay, net_pay } = calcOT(e.basic_salary, e.ot_hours)
      return { ...e, ot_rate, ot_pay, net_pay }
    }))
    setLoading(false)
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem('manager_tasks')
      if (raw) setTasks(JSON.parse(raw))
    } catch {}
  }

  function saveTasks(updated: Task[]) {
    setTasks(updated)
    localStorage.setItem('manager_tasks', JSON.stringify(updated))
  }

  function openNewTask() {
    setTaskModal({ open: true, draft: EMPTY_TASK() })
  }

  function selectAssignee(empId: number) {
    const emp = employees.find(e => e.id === empId)
    if (!emp || !taskModal) return
    setTaskModal({ ...taskModal, draft: { ...taskModal.draft, assigned_id: empId, assigned_to: emp.name, branch: emp.branch } })
  }

  function submitTask() {
    if (!taskModal || !taskModal.draft.title.trim() || !taskModal.draft.assigned_id) return
    const newTask: Task = {
      ...taskModal.draft,
      id: `task_${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    saveTasks([newTask, ...tasks])
    setTaskModal(null)
  }

  function updateStatus(id: string, status: TaskStatus) {
    saveTasks(tasks.map(t => t.id === id ? { ...t, status } : t))
  }

  function deleteTask(id: string) {
    saveTasks(tasks.filter(t => t.id !== id))
  }

  const asjad = employees.find(e => e.id === 1) ?? {
    name: 'Asjad Puthuparambil Ayoob', position: 'Operation Manager',
    branch: 'Ar Rayyan', restaurant: 'Ghabashi',
    basic_salary: 1800, ot_hours: 0, ot_pay: 0, net_pay: 1800,
    salary_paid: false, vacation_status: 'none' as const,
  }

  const team = employees.filter(e => e.restaurant === 'Ghabashi' && e.id !== 1)
  const allAssignable = employees.filter(e => e.id !== 1)
  const BRANCHES = ['Ar Rayyan', 'Hittin', 'Malqa']
  const LEADER_POSITIONS = ['Supervisor', 'Manager', 'Head Chef', 'Bakery Chef']
  const isLeader = (e: Employee) => LEADER_POSITIONS.some(lp => e.position.includes(lp))

  const totalNet = team.reduce((s, e) => s + e.net_pay, 0)
  const totalOTHrs = team.reduce((s, e) => s + e.ot_hours, 0)
  const totalOTPay = team.reduce((s, e) => s + e.ot_pay, 0)
  const unpaid = team.filter(e => !e.salary_paid).length
  const onVacation = team.filter(e => e.vacation_status === 'on_vacation').length
  const highOT = team.filter(e => e.ot_hours >= 40)

  const alerts: { color: string; bg: string; icon: string; text: string }[] = []
  if (unpaid > 0) alerts.push({ color: '#ef4444', bg: '#fef2f2', icon: '⚠', text: `${unpaid} ${t('employees salary not yet paid', 'موظف لم يُدفع راتبه بعد')}` })
  if (onVacation > 0) alerts.push({ color: '#d97706', bg: '#fef3c7', icon: '✈', text: `${onVacation} ${t('employees currently on vacation', 'موظف في إجازة حالياً')}` })
  if (highOT.length > 0) alerts.push({ color: '#7c3aed', bg: '#ede9fe', icon: '⏱', text: `${highOT.map(e => e.name.split(' ')[0]).join(', ')} — ${t('high overtime (40h+)', 'وقت إضافي مرتفع (40 ساعة+)')}` })

  const visibleTasks = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus)
  const taskCounts = { pending: tasks.filter(t => t.status === 'pending').length, in_progress: tasks.filter(t => t.status === 'in_progress').length, done: tasks.filter(t => t.status === 'done').length }
  const today = new Date().toISOString().slice(0, 10)

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ height: 80, background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)' }} className="shimmer" />
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Profile header */}
      <div style={{ background: 'var(--admin-card)', borderRadius: 18, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ height: 5, background: 'linear-gradient(90deg, #b45309, #f59e0b)' }} />
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>👑</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)' }}>{asjad.name}</div>
            <div style={{ fontSize: 13, color: '#b45309', fontWeight: 600, marginTop: 2 }}>{asjad.position}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: '#fef3c7', color: '#b45309' }}>Ghabashi</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: '#dcfce7', color: '#16a34a' }}>Ar Rayyan</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{t('Manages', 'يدير')}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--admin-text)' }}>{team.length}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{t('staff across 3 branches', 'موظف في 3 فروع')}</div>
            </div>
            <button onClick={openNewTask} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#0f172a', border: 'none', borderRadius: 12, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,23,42,0.25)', whiteSpace: 'nowrap' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {t('Assign Task', 'تعيين مهمة')}
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 12, background: a.bg, border: `1px solid ${a.color}33`, fontSize: 13, color: a.color, fontWeight: 600 }}>
              <span style={{ flexShrink: 0 }}>{a.icon}</span>{a.text}
            </div>
          ))}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: t('Team Size', 'حجم الفريق'), value: team.length, sub: t('Ghabashi staff', 'موظفو الغباشي'), color: '#b45309' },
          { label: t('Monthly Net Pay', 'صافي الراتب الشهري'), value: `${Math.round(totalNet).toLocaleString()} SAR`, sub: t('total for team', 'إجمالي للفريق'), color: '#10b981' },
          { label: t('Total OT Hours', 'إجمالي ساعات الإضافي'), value: totalOTHrs.toFixed(1) + 'h', sub: `${Math.round(totalOTPay).toLocaleString()} SAR ${t('cost', 'تكلفة')}`, color: '#6366f1' },
          { label: t('Unpaid Salaries', 'رواتب غير مدفوعة'), value: unpaid, sub: `${team.length - unpaid} ${t('paid', 'مدفوع')}`, color: unpaid > 0 ? '#ef4444' : '#10b981' },
        ].map((card, i) => (
          <div key={i} style={{ background: 'var(--admin-card)', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--admin-border2)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderTop: `3px solid ${card.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', lineHeight: 1.1 }}>{card.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 5 }}>{card.label}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Tasks section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{t('Tasks', 'المهام')} <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>({tasks.length})</span></h2>
          {/* Status filter tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }}>
            {([
              { key: 'all' as const, label: t('All', 'الكل'), count: tasks.length },
              { key: 'pending' as const, label: t('Pending', 'معلق'), count: taskCounts.pending },
              { key: 'in_progress' as const, label: t('In Progress', 'جارٍ'), count: taskCounts.in_progress },
              { key: 'done' as const, label: t('Done', 'مكتمل'), count: taskCounts.done },
            ]).map(f => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)} style={{
                padding: '5px 12px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: filterStatus === f.key ? 'white' : 'transparent',
                color: filterStatus === f.key ? '#0f172a' : '#64748b',
                boxShadow: filterStatus === f.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>
                {f.label} {f.count > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: filterStatus === f.key ? '#0f172a' : '#94a3b8' }}>({f.count})</span>}
              </button>
            ))}
          </div>
        </div>

        {visibleTasks.length === 0 ? (
          <div style={{ background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)', padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 6 }}>{t('No tasks yet', 'لا توجد مهام')}</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>{t('Assign tasks to your team members', 'قم بتعيين مهام لأعضاء فريقك')}</div>
            <button onClick={openNewTask} style={{ padding: '10px 20px', background: '#0f172a', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {t('Assign First Task', 'تعيين أول مهمة')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visibleTasks.map(task => {
              const pc = PRIORITY_COLORS[task.priority]
              const sc = STATUS_COLORS[task.status]
              const bc = BRANCH_COLORS[task.branch]
              const isOverdue = task.due_date && task.due_date < today && task.status !== 'done'
              return (
                <div key={task.id} style={{ background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 14, opacity: task.status === 'done' ? 0.65 : 1 }}>
                  {/* Status toggle circle */}
                  <button onClick={() => {
                    const next: TaskStatus = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'pending'
                    updateStatus(task.id, next)
                  }} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${sc.text}`, background: task.status === 'done' ? sc.text : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', marginTop: 1 }}>
                    {task.status === 'done' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    {task.status === 'in_progress' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.text }} />}
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: task.status === 'done' ? '#94a3b8' : 'var(--admin-text)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: pc.text, background: pc.bg }}>{isAr ? pc.labelAr : pc.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 20, color: sc.text, background: sc.bg }}>{isAr ? sc.labelAr : sc.label}</span>
                    </div>
                    {task.description && <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6, lineHeight: 1.4 }}>{task.description}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>→ {task.assigned_to.split(' ')[0]}</span>
                      {task.branch && bc && (
                        <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 20, color: bc.text, background: bc.bg, fontWeight: 600 }}>{task.branch}</span>
                      )}
                      {task.due_date && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: isOverdue ? '#ef4444' : '#94a3b8' }}>
                          {isOverdue ? '⚠ ' : ''}{t('Due', 'موعد')}: {task.due_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status cycle select + delete */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                    <select value={task.status} onChange={e => updateStatus(task.id, e.target.value as TaskStatus)}
                      className="admin-select" style={{ fontSize: 11, padding: '4px 8px', fontWeight: 600, color: sc.text, background: sc.bg, border: 'none', borderRadius: 8 }}>
                      <option value="pending">{t('Pending', 'معلق')}</option>
                      <option value="in_progress">{t('In Progress', 'جارٍ')}</option>
                      <option value="done">{t('Done', 'مكتمل')}</option>
                    </select>
                    <button onClick={() => deleteTask(task.id)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#fee2e2')}
                      onMouseOut={e => (e.currentTarget.style.background = '#fef2f2')}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Branch breakdown */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>{t('Branch Breakdown', 'تفاصيل الفروع')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {BRANCHES.map(branch => {
            const branchEmps = team.filter(e => e.branch === branch)
            const branchNet = branchEmps.reduce((s, e) => s + e.net_pay, 0)
            const branchOT = branchEmps.reduce((s, e) => s + e.ot_hours, 0)
            const branchUnpaid = branchEmps.filter(e => !e.salary_paid).length
            const bc = BRANCH_COLORS[branch]
            const SHIFT_ORDER = ['Morning', 'Evening', 'Night', 'Double Shift', '']
            const shifts = SHIFT_ORDER.filter(s => branchEmps.some(e => e.shift === s))
            return (
              <div key={branch} style={{ background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: bc.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: bc.text }}>{branch}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: bc.text, opacity: 0.8 }}>{branchEmps.length} {t('staff', 'موظف')}</span>
                </div>
                <div style={{ padding: '10px 16px', display: 'flex', gap: 12, borderBottom: '1px solid var(--admin-border2)' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>{Math.round(branchNet).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>SAR net</div>
                  </div>
                  <div style={{ width: 1, background: 'var(--admin-border2)' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>{branchOT.toFixed(0)}h</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>OT hrs</div>
                  </div>
                  <div style={{ width: 1, background: 'var(--admin-border2)' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: branchUnpaid > 0 ? '#ef4444' : '#10b981' }}>{branchUnpaid}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{t('unpaid', 'غير مدفوع')}</div>
                  </div>
                </div>
                <div style={{ padding: '8px 12px 12px' }}>
                  {shifts.map(shift => {
                    const shiftEmps = branchEmps.filter(e => e.shift === shift)
                    const leaders = shiftEmps.filter(isLeader)
                    const staff = shiftEmps.filter(e => !isLeader(e))
                    const sc = SHIFT_COLORS[shift]
                    return (
                      <div key={shift || 'no-shift'} style={{ marginBottom: 8 }}>
                        {shift && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: sc?.text ?? '#64748b', background: sc?.bg ?? '#f3f4f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{shift}</span>
                          </div>
                        )}
                        {leaders.map(leader => (
                          <div key={leader.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: bc.bg, marginBottom: 3 }}>
                            <span style={{ fontSize: 13 }}>👑</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: bc.text, flex: 1 }}>{leader.name.split(' ')[0]}</span>
                            {leader.ot_hours > 0 && <span style={{ fontSize: 11, color: bc.text, fontWeight: 600 }}>{leader.ot_hours}h</span>}
                            {!leader.salary_paid && <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>●</span>}
                          </div>
                        ))}
                        {staff.map(s => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 24px', borderRadius: 8, marginBottom: 2 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'var(--admin-text)', flex: 1 }}>{s.name.split(' ')[0]}</span>
                            {s.ot_hours > 0 && <span style={{ fontSize: 11, color: '#25D366', fontWeight: 600 }}>{s.ot_hours}h</span>}
                            {s.vacation_status === 'on_vacation' && <span style={{ fontSize: 11 }}>✈</span>}
                            {!s.salary_paid && <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>●</span>}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8' }}>
        <span><span style={{ color: '#ef4444', fontWeight: 700 }}>●</span> {t('Salary not paid', 'راتب غير مدفوع')}</span>
        <span>✈ {t('On vacation', 'في إجازة')}</span>
        <span><span style={{ color: '#25D366', fontWeight: 600 }}>Xh</span> {t('= OT hours', '= ساعات إضافية')}</span>
      </div>

      {/* Assign Task Modal */}
      {taskModal?.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.22)' }}>
            {/* Header */}
            <div style={{ borderTop: '4px solid #0f172a', borderRadius: '20px 20px 0 0', padding: '18px 22px', borderBottom: '1px solid var(--admin-border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)' }}>{t('Assign Task', 'تعيين مهمة')}</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{t('From Asjad to any team member', 'من أسجد إلى أي عضو في الفريق')}</p>
              </div>
              <button onClick={() => setTaskModal(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Assign to */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Assign to', 'تعيين إلى')} *</label>
                <select value={taskModal.draft.assigned_id || ''} onChange={e => selectAssignee(Number(e.target.value))}
                  className="admin-select" style={{ fontWeight: 600 }}>
                  <option value="">{t('Select employee…', 'اختر موظفاً…')}</option>
                  {['Ar Rayyan', 'Hittin', 'Malqa'].map(branch => (
                    <optgroup key={branch} label={branch}>
                      {allAssignable.filter(e => e.branch === branch).map(e => (
                        <option key={e.id} value={e.id}>{e.name.split(' ')[0]} — {e.position || e.shift}</option>
                      ))}
                    </optgroup>
                  ))}
                  <optgroup label={t('Other', 'أخرى')}>
                    {allAssignable.filter(e => !e.branch).map(e => (
                      <option key={e.id} value={e.id}>{e.name.split(' ')[0]}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Task title */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Task Title', 'عنوان المهمة')} *</label>
                <input type="text" value={taskModal.draft.title} onChange={e => setTaskModal({ ...taskModal, draft: { ...taskModal.draft, title: e.target.value } })}
                  placeholder={t('e.g. Clean the grill station', 'مثال: تنظيف محطة الشواء')}
                  className="admin-input" style={{ fontWeight: 500 }} />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Description', 'الوصف')} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({t('optional', 'اختياري')})</span></label>
                <textarea value={taskModal.draft.description} onChange={e => setTaskModal({ ...taskModal, draft: { ...taskModal.draft, description: e.target.value } })}
                  placeholder={t('Add details about the task…', 'أضف تفاصيل حول المهمة…')}
                  className="admin-input" rows={2} style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
              </div>

              {/* Priority + Due date row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Priority', 'الأولوية')}</label>
                  <select value={taskModal.draft.priority} onChange={e => setTaskModal({ ...taskModal, draft: { ...taskModal.draft, priority: e.target.value as Priority } })}
                    className="admin-select" style={{ fontWeight: 700, color: PRIORITY_COLORS[taskModal.draft.priority].text, background: PRIORITY_COLORS[taskModal.draft.priority].bg, border: 'none' }}>
                    <option value="low">{t('Low', 'منخفض')}</option>
                    <option value="medium">{t('Medium', 'متوسط')}</option>
                    <option value="high">{t('High', 'عالي')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Due Date', 'تاريخ الاستحقاق')} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({t('optional', 'اختياري')})</span></label>
                  <input type="date" value={taskModal.draft.due_date} min={today}
                    onChange={e => setTaskModal({ ...taskModal, draft: { ...taskModal.draft, due_date: e.target.value } })}
                    className="admin-input" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--admin-border2)', display: 'flex', gap: 10 }}>
              <button onClick={() => setTaskModal(null)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                {t('Cancel', 'إلغاء')}
              </button>
              <button onClick={submitTask} disabled={!taskModal.draft.title.trim() || !taskModal.draft.assigned_id}
                style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 700, color: 'white', cursor: taskModal.draft.title.trim() && taskModal.draft.assigned_id ? 'pointer' : 'not-allowed',
                  background: taskModal.draft.title.trim() && taskModal.draft.assigned_id ? '#0f172a' : '#94a3b8',
                  boxShadow: taskModal.draft.title.trim() && taskModal.draft.assigned_id ? '0 2px 8px rgba(15,23,42,0.25)' : 'none' }}>
                {t('Assign Task', 'تعيين المهمة')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
