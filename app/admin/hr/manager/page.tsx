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
  id: string; title: string; description: string
  assigned_to: string; assigned_id: number; branch: string
  priority: Priority; status: TaskStatus; due_date: string; created_at: string
  created_by: string; created_by_id: number; created_by_role: 'asjad' | 'supervisor'
  approved: boolean; approved_at?: string
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
  pending:     { text: '#94a3b8', bg: '#f8fafc', label: 'Pending',     labelAr: 'معلق'  },
  in_progress: { text: '#2563eb', bg: '#dbeafe', label: 'In Progress', labelAr: 'جارٍ'  },
  done:        { text: '#16a34a', bg: '#dcfce7', label: 'Done',        labelAr: 'مكتمل' },
}
const LEADER_POSITIONS = ['Supervisor', 'Manager', 'Head Chef', 'Bakery Chef']

function calcOT(basic: number, otHrs: number) {
  const rate = basic / 30 / 8 * 1.25
  return { ot_rate: rate, ot_pay: rate * otHrs, net_pay: basic + rate * otHrs }
}
function loadAllTasks(): Task[] {
  try { return JSON.parse(localStorage.getItem('all_tasks') || '[]') } catch { return [] }
}
function saveAllTasks(tasks: Task[]) {
  localStorage.setItem('all_tasks', JSON.stringify(tasks))
}

const EMPTY_DRAFT = () => ({ title: '', description: '', assigned_id: 0, priority: 'medium' as Priority, due_date: '' })

export default function ManagerDashboard() {
  const { t, isAr } = useLanguage()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<'approvals' | 'my_tasks' | 'all_tasks'>('approvals')
  const [taskModal, setTaskModal] = useState(false)
  const [draft, setDraft] = useState(EMPTY_DRAFT())

  useEffect(() => { loadData(); refreshTasks() }, [])

  function refreshTasks() { setTasks(loadAllTasks()) }

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

  function selectAssignee(empId: number) {
    setDraft(d => ({ ...d, assigned_id: empId }))
  }

  function submitTask() {
    if (!draft.title.trim() || !draft.assigned_id) return
    const assigned = employees.find(e => e.id === draft.assigned_id)
    if (!assigned) return
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: draft.title, description: draft.description,
      assigned_to: assigned.name, assigned_id: draft.assigned_id,
      branch: assigned.branch, priority: draft.priority,
      status: 'pending', due_date: draft.due_date,
      created_at: new Date().toISOString(),
      created_by: 'Asjad', created_by_id: 1,
      created_by_role: 'asjad', approved: true,
      approved_at: new Date().toISOString(),
    }
    const updated = [newTask, ...loadAllTasks()]
    saveAllTasks(updated)
    setTasks(updated)
    setDraft(EMPTY_DRAFT())
    setTaskModal(false)
  }

  function approveTask(id: string) {
    const updated = loadAllTasks().map(t => t.id === id
      ? { ...t, approved: true, approved_at: new Date().toISOString(), status: 'pending' as TaskStatus } : t)
    saveAllTasks(updated)
    setTasks(updated)
  }

  function rejectTask(id: string) {
    const updated = loadAllTasks().filter(t => t.id !== id)
    saveAllTasks(updated)
    setTasks(updated)
  }

  function updateStatus(id: string, status: TaskStatus) {
    const updated = loadAllTasks().map(t => t.id === id ? { ...t, status } : t)
    saveAllTasks(updated)
    setTasks(updated)
  }

  function deleteTask(id: string) {
    const updated = loadAllTasks().filter(t => t.id !== id)
    saveAllTasks(updated)
    setTasks(updated)
  }

  const asjad = employees.find(e => e.id === 1)
  const team = employees.filter(e => e.restaurant === 'Ghabashi' && e.id !== 1)
  const allAssignable = employees.filter(e => e.id !== 1)
  const BRANCHES = ['Ar Rayyan', 'Hittin', 'Malqa']
  const isLeader = (e: Employee) => LEADER_POSITIONS.some(lp => e.position.includes(lp))

  const totalNet = team.reduce((s, e) => s + e.net_pay, 0)
  const totalOTHrs = team.reduce((s, e) => s + e.ot_hours, 0)
  const totalOTPay = team.reduce((s, e) => s + e.ot_pay, 0)
  const unpaid = team.filter(e => !e.salary_paid).length
  const onVacation = team.filter(e => e.vacation_status === 'on_vacation').length
  const highOT = team.filter(e => e.ot_hours >= 40)

  const pendingApprovals = tasks.filter(t => !t.approved)
  const myTasks = tasks.filter(t => t.created_by_role === 'asjad')
  const allApprovedTasks = tasks.filter(t => t.approved)
  const today = new Date().toISOString().slice(0, 10)

  const alerts: { color: string; bg: string; icon: string; text: string }[] = []
  if (pendingApprovals.length > 0) alerts.push({ color: '#d97706', bg: '#fef3c7', icon: '📋', text: `${pendingApprovals.length} ${t('task(s) awaiting your approval', 'مهمة بانتظار موافقتك')}` })
  if (unpaid > 0) alerts.push({ color: '#ef4444', bg: '#fef2f2', icon: '⚠', text: `${unpaid} ${t('employees salary not yet paid', 'موظف لم يُدفع راتبه بعد')}` })
  if (onVacation > 0) alerts.push({ color: '#64748b', bg: '#f8fafc', icon: '✈', text: `${onVacation} ${t('employees on vacation', 'موظف في إجازة')}` })
  if (highOT.length > 0) alerts.push({ color: '#7c3aed', bg: '#ede9fe', icon: '⏱', text: `${highOT.map(e => e.name.split(' ')[0]).join(', ')} — ${t('40h+ overtime', 'أكثر من 40 ساعة إضافية')}` })

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ height: 80, background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)' }} className="shimmer" />
      ))}
    </div>
  )

  const tabTasks = activeTab === 'approvals' ? pendingApprovals : activeTab === 'my_tasks' ? myTasks : allApprovedTasks

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Profile header */}
      <div style={{ background: 'var(--admin-card)', borderRadius: 18, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ height: 5, background: 'linear-gradient(90deg, #b45309, #f59e0b)' }} />
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>👑</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)' }}>{asjad?.name ?? 'Asjad Puthuparambil Ayoob'}</div>
            <div style={{ fontSize: 13, color: '#b45309', fontWeight: 600, marginTop: 2 }}>Operation Manager</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: '#fef3c7', color: '#b45309' }}>Ghabashi</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: '#dcfce7', color: '#16a34a' }}>All Branches</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ textAlign: 'right', marginRight: 6 }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{t('Manages', 'يدير')}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--admin-text)' }}>{team.length}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{t('staff', 'موظف')}</div>
            </div>
            <button onClick={() => setTaskModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#0f172a', border: 'none', borderRadius: 12, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,23,42,0.25)', whiteSpace: 'nowrap' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
              <span>{a.icon}</span>{a.text}
            </div>
          ))}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: t('Team Size', 'حجم الفريق'), value: team.length, sub: t('Ghabashi staff', 'موظفو الغباشي'), color: '#b45309' },
          { label: t('Monthly Net Pay', 'صافي الراتب'), value: `${Math.round(totalNet).toLocaleString()} SAR`, sub: t('total for team', 'إجمالي الفريق'), color: '#10b981' },
          { label: t('OT Hours', 'ساعات إضافية'), value: totalOTHrs.toFixed(1) + 'h', sub: `${Math.round(totalOTPay).toLocaleString()} SAR ${t('cost', 'تكلفة')}`, color: '#6366f1' },
          { label: t('Pending Approvals', 'بانتظار الموافقة'), value: pendingApprovals.length, sub: t('from supervisors', 'من المشرفين'), color: pendingApprovals.length > 0 ? '#d97706' : '#10b981' },
        ].map((card, i) => (
          <div key={i} style={{ background: 'var(--admin-card)', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--admin-border2)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderTop: `3px solid ${card.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', lineHeight: 1.1 }}>{card.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 5 }}>{card.label}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Tasks section with tabs */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{t('Tasks', 'المهام')}</h2>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }}>
            {([
              { key: 'approvals' as const, label: t('Approvals', 'الموافقات'), count: pendingApprovals.length, accent: '#d97706' },
              { key: 'my_tasks' as const, label: t('My Tasks', 'مهامي'), count: myTasks.length, accent: '#0f172a' },
              { key: 'all_tasks' as const, label: t('All Tasks', 'كل المهام'), count: allApprovedTasks.length, accent: '#6366f1' },
            ]).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: '5px 12px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: activeTab === tab.key ? 'white' : 'transparent',
                color: activeTab === tab.key ? '#0f172a' : '#64748b',
                boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>
                {tab.label}
                {tab.count > 0 && (
                  <span style={{ marginInlineStart: 5, fontSize: 10, fontWeight: 800, color: 'white', background: activeTab === tab.key ? tab.accent : '#94a3b8', padding: '1px 6px', borderRadius: 20 }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Approvals tab */}
        {activeTab === 'approvals' && (
          pendingApprovals.length === 0 ? (
            <div style={{ background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-border2)', padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>✅</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{t('No pending approvals', 'لا توجد موافقات معلقة')}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{t('All supervisor tasks have been reviewed', 'تمت مراجعة جميع مهام المشرفين')}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingApprovals.map(task => {
                const pc = PRIORITY_COLORS[task.priority]
                const bc = BRANCH_COLORS[task.branch]
                const isOverdue = task.due_date && task.due_date < today
                return (
                  <div key={task.id} style={{ background: 'var(--admin-card)', borderRadius: 14, border: '2px solid #fef3c7', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{task.title}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: pc.text, background: pc.bg }}>{isAr ? pc.labelAr : pc.label}</span>
                        </div>
                        {task.description && <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{task.description}</p>}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>→ {task.assigned_to.split(' ')[0]}</span>
                          {bc && <span style={{ padding: '1px 8px', borderRadius: 20, color: bc.text, background: bc.bg, fontSize: 11, fontWeight: 600 }}>{task.branch}</span>}
                          <span style={{ color: '#6366f1', fontWeight: 600 }}>📋 {t('From', 'من')}: {task.created_by.split(' ')[0]}</span>
                          {task.due_date && <span style={{ color: isOverdue ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>{isOverdue ? '⚠ ' : ''}{task.due_date}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => rejectTask(task.id)} style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #fecaca', background: '#fef2f2', fontSize: 12, fontWeight: 700, color: '#ef4444', cursor: 'pointer' }}>
                          {t('Reject', 'رفض')}
                        </button>
                        <button onClick={() => approveTask(task.id)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#16a34a', fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 2px 6px rgba(22,163,74,0.3)' }}>
                          ✓ {t('Approve', 'موافقة')}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* My Tasks + All Tasks tabs */}
        {activeTab !== 'approvals' && (
          tabTasks.length === 0 ? (
            <div style={{ background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-border2)', padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{t('No tasks here yet', 'لا توجد مهام هنا بعد')}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tabTasks.map(task => {
                const pc = PRIORITY_COLORS[task.priority]
                const sc = STATUS_COLORS[task.status]
                const bc = BRANCH_COLORS[task.branch]
                const isOverdue = task.due_date && task.due_date < today && task.status !== 'done'
                return (
                  <div key={task.id} style={{ background: 'var(--admin-card)', borderRadius: 13, border: '1px solid var(--admin-border2)', padding: '13px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, opacity: task.status === 'done' ? 0.65 : 1 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: task.status === 'done' ? '#94a3b8' : 'var(--admin-text)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: pc.text, background: pc.bg }}>{isAr ? pc.labelAr : pc.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 20, color: sc.text, background: sc.bg }}>{isAr ? sc.labelAr : sc.label}</span>
                      </div>
                      {task.description && <p style={{ fontSize: 12, color: '#64748b', marginBottom: 5 }}>{task.description}</p>}
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
                        <span style={{ color: '#475569', fontWeight: 600 }}>→ {task.assigned_to.split(' ')[0]}</span>
                        {bc && <span style={{ padding: '1px 8px', borderRadius: 20, color: bc.text, background: bc.bg, fontSize: 11, fontWeight: 600 }}>{task.branch}</span>}
                        {activeTab === 'all_tasks' && <span style={{ color: '#6366f1', fontSize: 11, fontWeight: 600 }}>by {task.created_by.split(' ')[0]}</span>}
                        {task.due_date && <span style={{ color: isOverdue ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>{isOverdue ? '⚠ ' : ''}{task.due_date}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <select value={task.status} onChange={e => updateStatus(task.id, e.target.value as TaskStatus)}
                        className="admin-select" style={{ fontSize: 11, padding: '4px 8px', fontWeight: 600, color: sc.text, background: sc.bg, border: 'none', borderRadius: 8 }}>
                        <option value="pending">{t('Pending', 'معلق')}</option>
                        <option value="in_progress">{t('In Progress', 'جارٍ')}</option>
                        <option value="done">{t('Done', 'مكتمل')}</option>
                      </select>
                      <button onClick={() => deleteTask(task.id)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
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
            const branchTasks = allApprovedTasks.filter(t => t.branch === branch && t.status !== 'done')
            return (
              <div key={branch} style={{ background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: bc.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: bc.text }}>{branch}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {branchTasks.length > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.7)', color: bc.text }}>📋 {branchTasks.length}</span>}
                    <span style={{ fontSize: 12, fontWeight: 700, color: bc.text, opacity: 0.8 }}>{branchEmps.length} {t('staff', 'موظف')}</span>
                  </div>
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
                          <div style={{ marginBottom: 5 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 20, color: sc?.text ?? '#64748b', background: sc?.bg ?? '#f3f4f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{shift}</span>
                          </div>
                        )}
                        {leaders.map(leader => (
                          <div key={leader.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: bc.bg, marginBottom: 3 }}>
                            <span style={{ fontSize: 13 }}>👑</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: bc.text, flex: 1 }}>{leader.name.split(' ')[0]}</span>
                            {leader.ot_hours > 0 && <span style={{ fontSize: 11, color: bc.text, fontWeight: 600 }}>{leader.ot_hours}h</span>}
                            {!leader.salary_paid && <span style={{ fontSize: 10, color: '#ef4444' }}>●</span>}
                          </div>
                        ))}
                        {staff.map(s => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 24px', borderRadius: 8, marginBottom: 2 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'var(--admin-text)', flex: 1 }}>{s.name.split(' ')[0]}</span>
                            {s.ot_hours > 0 && <span style={{ fontSize: 11, color: '#25D366', fontWeight: 600 }}>{s.ot_hours}h</span>}
                            {s.vacation_status === 'on_vacation' && <span style={{ fontSize: 11 }}>✈</span>}
                            {!s.salary_paid && <span style={{ fontSize: 10, color: '#ef4444' }}>●</span>}
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
        <span>📋 {t('= active tasks in branch', '= مهام نشطة في الفرع')}</span>
      </div>

      {/* Assign Task Modal */}
      {taskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.22)' }}>
            <div style={{ borderTop: '4px solid #0f172a', borderRadius: '20px 20px 0 0', padding: '18px 22px', borderBottom: '1px solid var(--admin-border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)' }}>{t('Assign Task', 'تعيين مهمة')}</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{t('Direct from Asjad — auto approved', 'مباشر من أسجد — موافقة تلقائية')}</p>
              </div>
              <button onClick={() => setTaskModal(false)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Assign to', 'تعيين إلى')} *</label>
                <select value={draft.assigned_id || ''} onChange={e => selectAssignee(Number(e.target.value))} className="admin-select" style={{ fontWeight: 600 }}>
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
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('Task Title', 'عنوان المهمة')} *</label>
                <input type="text" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })}
                  placeholder={t('e.g. Clean the grill station', 'مثال: تنظيف محطة الشواء')} className="admin-input" />
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
                    className="admin-select" style={{ fontWeight: 700, color: PRIORITY_COLORS[draft.priority].text, background: PRIORITY_COLORS[draft.priority].bg, border: 'none' }}>
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
              <button onClick={() => setTaskModal(false)} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                {t('Cancel', 'إلغاء')}
              </button>
              <button onClick={submitTask} disabled={!draft.title.trim() || !draft.assigned_id}
                style={{ flex: 2, padding: '11px', borderRadius: 11, border: 'none', fontSize: 13, fontWeight: 700, color: 'white', cursor: draft.title.trim() && draft.assigned_id ? 'pointer' : 'not-allowed', background: draft.title.trim() && draft.assigned_id ? '#0f172a' : '#94a3b8' }}>
                {t('Assign Task', 'تعيين المهمة')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
