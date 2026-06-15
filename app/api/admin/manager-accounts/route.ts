import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DEFAULT_PASSWORD = '123123'
const VALID_ROLES = ['manager', 'admin']

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Only an authenticated admin (not a manager-only user) may manage accounts.
async function requireAdmin(): Promise<{ ok: boolean }> {
  const cookieStore = await cookies()
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { ok: false }
  const role = (user.app_metadata as any)?.role
  const isManagerOnly = (role === 'manager' || user.email === 'asjad@appetie.com') && role !== 'admin'
  return { ok: !isManagerOnly }
}

export async function GET() {
  if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await admin().auth.admin.listUsers({ perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const users = data.users.map(u => ({
    id: u.id,
    email: u.email,
    role: (u.app_metadata as any)?.role ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }))
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { email, role } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  const r = VALID_ROLES.includes(role) ? role : 'manager'
  const { error } = await admin().auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    app_metadata: { role: r },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, email, role: r, password: DEFAULT_PASSWORD })
}

// Reset password to default, or change role
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, action, role } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  if (action === 'reset') {
    const { error } = await admin().auth.admin.updateUserById(id, { password: DEFAULT_PASSWORD })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, password: DEFAULT_PASSWORD })
  }
  if (action === 'role') {
    if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    const { error } = await admin().auth.admin.updateUserById(id, { app_metadata: { role } })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await admin().auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
