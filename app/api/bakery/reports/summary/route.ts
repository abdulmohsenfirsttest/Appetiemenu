import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/bakery-db'

export async function GET() {
  const supabase = getServiceClient()
  const today = new Date().toISOString().slice(0, 10)

  const [ordersRes, productsRes, customersRes] = await Promise.all([
    supabase.from('bakery_orders').select('total,status,created_at'),
    supabase.from('bakery_products').select('id,name,stock'),
    supabase.from('bakery_customers').select('id'),
  ])

  if (ordersRes.error) return NextResponse.json({ error: ordersRes.error.message }, { status: 500 })

  const allOrders = ordersRes.data
  const products = productsRes.data
  const customers = customersRes.data

  const todayOrders = (allOrders || []).filter((o: { created_at: string; status: string }) => o.created_at.startsWith(today) && o.status !== 'cancelled')
  const pending = (allOrders || []).filter(o => o.status === 'pending').length
  const lowStock = (products || []).filter(p => p.stock < 5).sort((a, b) => a.stock - b.stock)

  return NextResponse.json({
    todayRevenue: todayOrders.reduce((s, o) => s + Number(o.total), 0),
    todayOrders: todayOrders.length,
    totalProducts: products?.length || 0,
    totalCustomers: customers?.length || 0,
    pendingOrders: pending,
    lowStock,
  })
}
