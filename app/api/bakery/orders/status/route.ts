import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/bakery-db'
import { verifySession, COOKIE_NAME } from '@/lib/bakery-auth'

const err = (e: unknown, status = 500) =>
  NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status })

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    const session = token ? verifySession(token) : null

    const formData = await req.formData()
    const orderId = Number(formData.get('order_id'))
    const status = formData.get('status') as string
    const photo = formData.get('photo') as File | null

    const supabase = getServiceClient()

    const { data: existing } = await supabase.from('bakery_orders').select('status').eq('id', orderId).single()
    const old_status = existing?.status

    const { data: order, error } = await supabase
      .from('bakery_orders').update({ status }).eq('id', orderId).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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
      action: 'status_update',
      order_id: orderId,
      old_status,
      new_status: status,
      detail: `Changed order #${String(orderId).padStart(4,'0')} from "${old_status}" → "${status}"`,
      photo_url: photoUrl,
    })

    return NextResponse.json(order)
  } catch (e) { return err(e) }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const supabase = getServiceClient()
    await supabase.from('bakery_order_items').delete().eq('order_id', id)
    await supabase.from('bakery_orders').delete().eq('id', id)
    return NextResponse.json({ ok: true })
  } catch (e) { return err(e) }
}
