import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, hashPassword } from '@/lib/bakery-db'

const err = (e: unknown, status = 500) =>
  NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status })

export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('bakery_staff').select('id,name,username,role,created_at').order('name')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) { return err(e) }
}

export async function POST(req: NextRequest) {
  try {
    const { name, username, password, role } = await req.json()
    const supabase = getServiceClient()
    const { data, error } = await supabase.from('bakery_staff')
      .insert({ name, username, password_hash: hashPassword(password), role: role || 'staff' })
      .select('id,name,username,role,created_at').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) { return err(e) }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, username, role, password } = await req.json()
    const supabase = getServiceClient()
    const update: Record<string, string> = { name, username, role }
    if (password) update.password_hash = hashPassword(password)
    const { data, error } = await supabase.from('bakery_staff').update(update).eq('id', id)
      .select('id,name,username,role,created_at').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) { return err(e) }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const supabase = getServiceClient()
    const { error } = await supabase.from('bakery_staff').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) { return err(e) }
}
