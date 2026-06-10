import { supabase } from './supabase'

export async function fetchTasks() {
  const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: true })
  return data || []
}

export async function upsertTask(task: Record<string, unknown>) {
  await supabase.from('tasks').upsert(task, { onConflict: 'id' })
}

export async function updateTask(id: string, patch: Record<string, unknown>) {
  await supabase.from('tasks').update(patch).eq('id', id)
}

export async function deleteTask(id: string) {
  await supabase.from('tasks').delete().eq('id', id)
}

export async function getHrSetting(key: string) {
  const { data } = await supabase.from('hr_settings').select('value').eq('key', key).maybeSingle()
  return data?.value ?? null
}

export async function setHrSetting(key: string, value: unknown) {
  await supabase.from('hr_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}

export async function deleteHrSetting(key: string) {
  await supabase.from('hr_settings').delete().eq('key', key)
}
