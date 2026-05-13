import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/bakery-db'
import { verifySession, COOKIE_NAME } from '@/lib/bakery-auth'

export async function GET(req: NextRequest) {
  const supabase = getServiceClient()
  const { searchParams } = new URL(req.url)
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')
  const todayOnly = searchParams.get('today') === '1'

  let query = supabase.from('bakery_orders').select('*').order('created_at', { ascending: false })

  if (todayOnly) {
    const today = new Date().toISOString().slice(0, 10)
    query = query.gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`)
  } else {
    if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`)
    if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`)
  }

  const { data: orders, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: items } = await supabase.from('bakery_order_items').select('*')
  const result = (orders || []).map(o => ({
    ...o,
    items: (items || []).filter(i => i.order_id === o.id),
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null

  const formData = await req.formData()
  const customer_id = formData.get('customer_id') as string
  const customer_name = formData.get('customer_name') as string || 'Walk-in'
  const notes = formData.get('notes') as string || ''
  const items = JSON.parse(formData.get('items') as string || '[]')
  const photo = formData.get('photo') as File | null
  const total = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)

  const supabase = getServiceClient()

  const { data: order, error } = await supabase.from('bakery_orders').insert({
    customer_id: customer_id || null,
    customer_name,
    total,
    notes,
    created_by_id: session?.id || null,
    created_by_name: session?.name || 'Admin',
    created_by_role: session?.role || 'admin',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const orderItems = items.map((item: { product_id: number; product_name: string; quantity: number; price: number }) => ({
    order_id: order.id, product_id: item.product_id,
    product_name: item.product_name, quantity: item.quantity, price: item.price,
  }))
  await supabase.from('bakery_order_items').insert(orderItems)

  // Deduct stock
  for (const item of items) {
    const { data: prod } = await supabase.from('bakery_products').select('stock').eq('id', item.product_id).single()
    if (prod) await supabase.from('bakery_products').update({ stock: Math.max(0, prod.stock - item.quantity) }).eq('id', item.product_id)
  }

  // Upload photo + log activity
  let photoUrl: string | null = null
  if (photo && photo.size > 0) {
    const ext = photo.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await photo.arrayBuffer()
    await supabase.storage.from('bakery-photos').upload(filename, bytes, { contentType: photo.type })
    photoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bakery-photos/${filename}`
  }

  await supabase.from('bakery_activity').insert({
    staff_id: session?.id || null,
    staff_name: session?.name || 'Admin',
    staff_role: session?.role || 'admin',
    action: 'create_order',
    order_id: order.id,
    detail: `Created order #${String(order.id).padStart(4,'0')} for ${customer_name} ($${total.toFixed(2)})`,
    photo_url: photoUrl,
  })

  return NextResponse.json({ ...order, items: orderItems })
}
