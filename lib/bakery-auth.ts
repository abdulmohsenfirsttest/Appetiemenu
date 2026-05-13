import { createHmac } from 'crypto'

const SECRET = process.env.BAKERY_SESSION_SECRET || 'bakery-secret'

export type BakerySession = { id: number; username: string; name: string; role: 'admin' | 'staff' }

export function signSession(payload: BakerySession): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifySession(token: string): BakerySession | null {
  try {
    const [data, sig] = token.split('.')
    const expected = createHmac('sha256', SECRET).update(data).digest('base64url')
    if (sig !== expected) return null
    return JSON.parse(Buffer.from(data, 'base64url').toString())
  } catch {
    return null
  }
}

export const COOKIE_NAME = 'bakery_session'
