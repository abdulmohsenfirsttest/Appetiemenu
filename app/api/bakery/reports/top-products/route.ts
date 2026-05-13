import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/bakery-db'

export async function GET() {
  const supabase = getServiceClient()
  const { data: activeOrders } = await supabase.from('bakery_orders').select('id').neq('status', 'cancelled')
  const ids = (activeOrders || []).map(o => o.id)
  if (!ids.length) return NextResponse.json([])

  const { data: items } = await supabase.from('bakery_order_items').select('product_name,quantity,price').in('order_id', ids)
  const byProduct: Record<string, { product_name: string; qty: number; revenue: number }> = {}
  for (const i of items || []) {
    if (!byProduct[i.product_name]) byProduct[i.product_name] = { product_name: i.product_name, qty: 0, revenue: 0 }
    byProduct[i.product_name].qty += i.quantity
    byProduct[i.product_name].revenue += i.quantity * Number(i.price)
  }
  return NextResponse.json(Object.values(byProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 8))
}
