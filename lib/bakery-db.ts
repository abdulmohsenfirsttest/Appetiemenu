import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export const hashPassword = (pwd: string) =>
  createHash('sha256').update(pwd).digest('hex')

export type BakeryStaff = {
  id: number; name: string; username: string; role: 'admin' | 'staff'; created_at: string
}
export type BakeryProduct = {
  id: number; name: string; category: string; price: number; cost: number;
  stock: number; unit: string; created_at: string
}
export type BakeryCustomer = {
  id: number; name: string; email: string; phone: string; notes: string; created_at: string
}
export type BakeryOrder = {
  id: number; customer_id: number | null; customer_name: string; status: string;
  total: number; notes: string; created_by_id: number | null;
  created_by_name: string; created_by_role: string; created_at: string;
  items?: BakeryOrderItem[]
}
export type BakeryOrderItem = {
  id: number; order_id: number; product_id: number; product_name: string;
  quantity: number; price: number
}
export type BakeryActivity = {
  id: number; staff_id: number; staff_name: string; staff_role: string;
  action: string; order_id: number | null; detail: string; photo_url: string | null;
  old_status: string | null; new_status: string | null; created_at: string
}
