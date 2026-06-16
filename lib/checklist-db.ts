import { supabase } from './supabase'

export interface ChecklistItem { key: string; label: string }
export interface ChecklistSection { title: string; items: ChecklistItem[] }

// Daily branch inspection — mirrors the paper form the manager fills on arrival.
export const CHECKLIST: ChecklistSection[] = [
  {
    title: 'Cleaning',
    items: [
      { key: 'c_cashier', label: 'Check cashier area' },
      { key: 'c_dinein', label: 'Check dine-in area' },
      { key: 'c_entrance_glass', label: 'Verify the glass on the entrance is clean' },
      { key: 'c_ciabatta', label: 'Check Ciabatta section' },
      { key: 'c_grill', label: 'Check grill section' },
      { key: 'c_pie', label: 'Check Pie section' },
      { key: 'c_exhaust', label: 'Check the exhaust' },
      { key: 'c_airfan', label: 'Check the Air fan door' },
      { key: 'c_ac', label: 'Check AC' },
      { key: 'c_wash', label: 'Check wash area' },
    ],
  },
  {
    title: 'Organizing',
    items: [
      { key: 'o_garbage', label: 'Check if the garbage paper is new' },
      { key: 'o_juice_counter', label: 'Check if there is Juice bottles on the counter' },
      { key: 'o_chiller', label: 'Check chiller organize' },
      { key: 'o_prep_grill', label: 'Check Preparedness grill section' },
      { key: 'o_prep_pie', label: 'Check Preparedness Pie section' },
      { key: 'o_prep_ciabatta', label: 'Check Preparedness ciabatta section' },
      { key: 'o_overproduction', label: 'Check Overproduction' },
    ],
  },
  {
    title: 'Food Quality',
    items: [
      { key: 'f_juice_quality', label: 'Check juice quality' },
      { key: 'f_juice_karak_expiry', label: 'Check juice and karak expiry date' },
      { key: 'f_veg_expiry', label: 'Check Vegetables expiry date' },
      { key: 'f_sauces_expiry', label: 'Check Sauces expiry date' },
      { key: 'f_bread_expiry', label: 'Check Bread expiry date' },
      { key: 'f_oil_fryer', label: 'Check Quality Oil fryer' },
      { key: 'f_container_half_open', label: 'Check the container is half open in these sections (Ciabatta – Sandwich – Pie)' },
    ],
  },
]

export const ALL_ITEMS: ChecklistItem[] = CHECKLIST.flatMap(s => s.items)
export const TOTAL_ITEMS = ALL_ITEMS.length

export function labelForKey(key: string): string {
  return ALL_ITEMS.find(i => i.key === key)?.label ?? key
}

export interface ChecklistSubmission {
  id: number
  branch: string
  check_date: string
  shift: string | null
  results: Record<string, boolean>
  photos?: Record<string, string[]> | null   // itemKey -> array of public image URLs
  checked_count: number
  total_count: number
  notes: string | null
  completed_by: string | null
  created_at: string
}

const PHOTO_BUCKET = 'checklist-photos'

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function checklistTableReady(): Promise<boolean> {
  const { error } = await supabase.from('branch_checklists').select('id').limit(1)
  return !error
}

/** True once the `photos` column exists (scripts/checklist-photos-column.sql run). */
export async function checklistPhotosReady(): Promise<boolean> {
  const { error } = await supabase.from('branch_checklists').select('photos').limit(1)
  return !error
}

/** Upload an issue photo and return its public URL. */
export async function uploadChecklistPhoto(file: File, branch: string, date: string, key: string): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${branch}/${date}/${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { upsert: true })
  if (error) return null
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
}

export async function fetchChecklists(opts?: { branch?: string; date?: string }): Promise<ChecklistSubmission[]> {
  let q = supabase.from('branch_checklists').select('*').order('created_at', { ascending: false })
  if (opts?.branch) q = q.eq('branch', opts.branch)
  if (opts?.date) q = q.eq('check_date', opts.date)
  const { data, error } = await q
  if (error) return []
  return (data as ChecklistSubmission[]) || []
}

export async function submitChecklist(s: Omit<ChecklistSubmission, 'id' | 'created_at'>, withPhotos: boolean): Promise<{ error: string | null }> {
  // Omit `photos` if the column doesn't exist yet, so submissions still work.
  const payload: any = { ...s }
  if (!withPhotos) delete payload.photos
  const { error } = await supabase.from('branch_checklists').insert(payload)
  return { error: error?.message ?? null }
}
