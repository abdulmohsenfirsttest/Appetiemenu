import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, hashPassword } from '@/lib/bakery-db'
import { signSession, COOKIE_NAME } from '@/lib/bakery-auth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  const supabase = getServiceClient()

  const { data: staff } = await supabase
    .from('bakery_staff')
    .select('id,name,username,role,password_hash')
    .eq('username', username)
    .eq('password_hash', hashPassword(password))
    .single()

  if (!staff) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const session = { id: staff.id, username: staff.username, name: staff.name, role: staff.role }
  const token = signSession(session)

  const res = NextResponse.json({ user: session })
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24, sameSite: 'lax' })
  return res
}
