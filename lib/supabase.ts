import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url === 'your_supabase_url') {
    // Return a dummy client that won't throw immediately
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  _client = createClient(url, key)
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getClient() as any)[prop]
  },
})

export function getImageUrl(path: string | null): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url === 'your_supabase_url') return ''
  return `${url}/storage/v1/object/public/menu-images/${path}`
}
