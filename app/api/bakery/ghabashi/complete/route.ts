import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/bakery-db'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const shift_id = formData.get('shift_id') as string
  const task_key = formData.get('task_key') as string
  const task_name = formData.get('task_name') as string
  const photo = formData.get('photo') as File | null

  if (!shift_id || !task_key) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = getServiceClient()

  let photo_url: string | null = null
  if (photo && photo.size > 0) {
    const ext = photo.name.split('.').pop() || 'jpg'
    const filename = `ghabashi/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await photo.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('bakery-photos')
      .upload(filename, bytes, { contentType: photo.type })
    if (!uploadError)
      photo_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bakery-photos/${filename}`
  }

  const { data: existing } = await supabase
    .from('ghabashi_task_completions')
    .select('id')
    .eq('shift_id', shift_id)
    .eq('task_key', task_key)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('ghabashi_task_completions')
      .update({ photo_url, completed_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('ghabashi_task_completions')
    .insert({ shift_id: Number(shift_id), task_key, task_name, photo_url })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
