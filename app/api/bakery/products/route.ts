import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/bakery-db'

const err = (e: unknown, status = 500) =>
  NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status })

export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase.from('bakery_products').select('*').order('category').order('name')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) { return err(e) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = getServiceClient()
    const { data, error } = await supabase.from('bakery_products').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) { return err(e) }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...body } = await req.json()
    const supabase = getServiceClient()
    const { data, error } = await supabase.from('bakery_products').update(body).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) { return err(e) }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const supabase = getServiceClient()
    const { error } = await supabase.from('bakery_products').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) { return err(e) }
}
