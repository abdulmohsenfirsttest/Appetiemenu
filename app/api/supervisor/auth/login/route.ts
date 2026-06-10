import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function hashPassword(password: string) {
  return crypto.createHmac('sha256', process.env.SUPERVISOR_HASH_PEPPER!).update(password).digest('hex')
}

function makeToken(employeeId: number) {
  const expires = Date.now() + 24 * 60 * 60 * 1000
  const data = `${employeeId}:${expires}`
  const sig = crypto.createHmac('sha256', process.env.SUPERVISOR_SESSION_SECRET!).update(data).digest('hex')
  return `${data}:${sig}`
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  if (!username || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await supabase
    .from('supervisor_credentials')
    .select('employee_id, password_hash')
    .eq('username', username.trim().toLowerCase())
    .single()

  if (error || !data || hashPassword(password) !== data.password_hash) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true, employee_id: data.employee_id })
  res.cookies.set('sup_session', makeToken(data.employee_id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  })
  return res
}
