import { supabase } from './supabase'

export interface Violation {
  id: number
  employee_id: number
  employee_name: string | null
  branch: string | null
  violation: string
  comment: string | null
  deduction_amount: number
  period: string
  logged_by: string | null
  created_at: string
}

export interface BranchEvaluation {
  id: number
  branch: string
  rating: number
  comment: string | null
  period: string
  evaluated_by: string | null
  created_at: string
}

/** Current month as 'YYYY-MM' (local time). */
export function currentPeriod(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Human label for a 'YYYY-MM' period, e.g. "June 2026". */
export function periodLabel(period: string): string {
  const [y, m] = period.split('-').map(Number)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[(m || 1) - 1]} ${y}`
}

/** Returns false if the violations table doesn't exist yet (migration not run). */
export async function violationsTableReady(): Promise<boolean> {
  const { error } = await supabase.from('violations').select('id').limit(1)
  return !error
}

export async function fetchViolations(opts?: { period?: string; branch?: string; employeeId?: number }): Promise<Violation[]> {
  let q = supabase.from('violations').select('*').order('created_at', { ascending: false })
  if (opts?.period) q = q.eq('period', opts.period)
  if (opts?.branch) q = q.eq('branch', opts.branch)
  if (opts?.employeeId) q = q.eq('employee_id', opts.employeeId)
  const { data, error } = await q
  if (error) return []
  return (data as Violation[]) || []
}

export async function addViolation(v: Omit<Violation, 'id' | 'created_at'>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('violations').insert(v)
  return { error: error?.message ?? null }
}

export async function deleteViolation(id: number): Promise<void> {
  await supabase.from('violations').delete().eq('id', id)
}

/** Map of employee_id -> total SAR deducted for the given period. */
export async function deductionsByEmployee(period: string): Promise<Record<number, number>> {
  const { data, error } = await supabase
    .from('violations')
    .select('employee_id, deduction_amount')
    .eq('period', period)
  if (error || !data) return {}
  const map: Record<number, number> = {}
  for (const row of data as { employee_id: number; deduction_amount: number }[]) {
    map[row.employee_id] = (map[row.employee_id] || 0) + Number(row.deduction_amount || 0)
  }
  return map
}

export async function fetchBranchEvaluations(opts?: { period?: string; branch?: string }): Promise<BranchEvaluation[]> {
  let q = supabase.from('branch_evaluations').select('*').order('created_at', { ascending: false })
  if (opts?.period) q = q.eq('period', opts.period)
  if (opts?.branch) q = q.eq('branch', opts.branch)
  const { data, error } = await q
  if (error) return []
  return (data as BranchEvaluation[]) || []
}

export async function addBranchEvaluation(e: Omit<BranchEvaluation, 'id' | 'created_at'>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('branch_evaluations').insert(e)
  return { error: error?.message ?? null }
}
