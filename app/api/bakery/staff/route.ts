import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, hashPassword } from '@/lib/bakery-db'

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('bakery_staff').select('id,name,username,role,created_at').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { name, username, password, role } = await req.json()
  const supabase = getServiceClient()
  const { data, error } = await supabase.from('bakery_staff')
    .insert({ name, username, password_hash: hashPassword(password), role: role || 'staff' })
    .select('id,name,username,role,created_at').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const { id, name, username, role, password } = await req.json()
  const supabase = getServiceClient()
  const update: Record<string, string> = { name, username, role }
  if (password) update.password_hash = hashPassword(password)
  const { data, error } = await supabase.from('bakery_staff').update(update).eq('id', id)
    .select('id,name,username,role,created_at').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const supabase = getServiceClient()
  const { error } = await supabase.from('bakery_staff').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
