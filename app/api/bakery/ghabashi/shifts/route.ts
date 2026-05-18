import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/bakery-db'
import { verifySession, COOKIE_NAME } from '@/lib/bakery-auth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null

  const { shift_type } = await req.json()
  if (!['morning', 'closing'].includes(shift_type))
    return NextResponse.json({ error: 'Invalid shift type' }, { status: 400 })

  const supabase = getServiceClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: existing } = await supabase
    .from('ghabashi_shifts')
    .select('id,staff_id,shift_type,date,status')
    .eq('date', today)
    .eq('shift_type', shift_type)
    .eq('staff_id', session?.id ?? 0)
    .maybeSingle()

  if (existing) return NextResponse.json(existing)

  const { data, error } = await supabase
    .from('ghabashi_shifts')
    .insert({ staff_id: session?.id ?? null, staff_name: session?.name ?? 'Staff', shift_type, date: today })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(req: NextRequest) {
  const supabase = getServiceClient()
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('ghabashi_shifts')
    .select('*, ghabashi_task_completions(*)')
    .eq('date', date)
    .order('started_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
