import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function hashPassword(password: string) {
  return crypto.createHmac('sha256', process.env.SUPERVISOR_HASH_PEPPER!).update(password).digest('hex')
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await supabase.from('supervisor_credentials').select('employee_id, username, created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { employee_id, username, password } = await req.json()
  if (!employee_id || !username || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { error } = await supabase.from('supervisor_credentials').upsert({
    employee_id, username: username.trim().toLowerCase(), password_hash: hashPassword(password),
  }, { onConflict: 'employee_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { employee_id } = await req.json()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  await supabase.from('supervisor_credentials').delete().eq('employee_id', employee_id)
  return NextResponse.json({ success: true })
}
