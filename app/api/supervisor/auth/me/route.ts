import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function validateToken(token: string): number | null {
  try {
    const parts = token.split(':')
    if (parts.length !== 3) return null
    const [employeeId, expires, sig] = parts
    const data = `${employeeId}:${expires}`
    const expected = crypto.createHmac('sha256', process.env.SUPERVISOR_SESSION_SECRET!).update(data).digest('hex')
    if (sig !== expected) return null
    if (Date.now() > parseInt(expires)) return null
    return parseInt(employeeId)
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('sup_session')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const employeeId = validateToken(token)
  if (!employeeId) return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
  return NextResponse.json({ employee_id: employeeId })
}
