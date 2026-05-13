import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/bakery-db'

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('bakery_activity').select('*').order('created_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
