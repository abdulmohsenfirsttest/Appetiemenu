import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/bakery-db'

const err = (e: unknown, status = 500) =>
  NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status })

export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data: customers } = await supabase.from('bakery_customers').select('*').order('name')
    const { data: orders } = await supabase.from('bakery_orders').select('customer_id,total').neq('status', 'cancelled')
    const enriched = (customers || []).map(c => {
      const cOrders = (orders || []).filter(o => o.customer_id === c.id)
      return { ...c, order_count: cOrders.length, total_spent: cOrders.reduce((s, o) => s + Number(o.total), 0) }
    })
    return NextResponse.json(enriched)
  } catch (e) { return err(e) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = getServiceClient()
    const { data, error } = await supabase.from('bakery_customers').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) { return err(e) }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...body } = await req.json()
    const supabase = getServiceClient()
    const { data, error } = await supabase.from('bakery_customers').update(body).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) { return err(e) }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const supabase = getServiceClient()
    const { error } = await supabase.from('bakery_customers').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) { return err(e) }
}
