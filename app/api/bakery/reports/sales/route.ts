import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/bakery-db'

export async function GET(req: NextRequest) {
  const days = Number(new URL(req.url).searchParams.get('days') || 7)
  const supabase = getServiceClient()
  const cutoff = new Date(Date.now() - days * 86400000).toISOString()

  const { data } = await supabase.from('bakery_orders')
    .select('total,created_at').neq('status', 'cancelled').gte('created_at', cutoff)

  const byDate: Record<string, { date: string; orders: number; revenue: number }> = {}
  for (const o of data || []) {
    const d = o.created_at.slice(0, 10)
    if (!byDate[d]) byDate[d] = { date: d, orders: 0, revenue: 0 }
    byDate[d].orders++
    byDate[d].revenue += Number(o.total)
  }
  return NextResponse.json(Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)))
}
