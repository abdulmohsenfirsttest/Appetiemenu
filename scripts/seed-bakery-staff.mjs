/**
 * Run: node scripts/seed-bakery-staff.mjs
 * Seeds default bakery staff accounts into Supabase.
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://glmkqlpmrbixbuyecupi.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbWtxbHBtcmJpeGJ1eWVjdXBpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODU5MjY2MywiZXhwIjoyMDk0MTY4NjYzfQ._Z_30ctLAYhvs-JhBbjeZaAXgCIDkWPBUdGqssuJA6Y'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
const hash = pwd => createHash('sha256').update(pwd).digest('hex')

const staff = [
  { name: 'Owner', username: 'admin', password_hash: hash('admin123'), role: 'admin' },
  { name: 'Sarah', username: 'staff1', password_hash: hash('staff123'), role: 'staff' },
]

for (const s of staff) {
  const { error } = await supabase.from('bakery_staff').upsert(s, { onConflict: 'username' })
  if (error) console.error('Error seeding', s.username, error.message)
  else console.log('✓ Seeded', s.username, '/', s.username === 'admin' ? 'admin123' : 'staff123')
}
