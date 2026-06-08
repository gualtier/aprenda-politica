import { createClient } from '@supabase/supabase-js'

/** Client Supabase sem cookies — para sitemap/OG (rodam fora de request scope). */
export function publicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
