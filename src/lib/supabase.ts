import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const normalizedSupabaseUrl = supabaseUrl?.replace(/\/rest\/v1\/?$/, '')

if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    'Supabase nao configurado: preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.',
  )
}

export const supabase = createClient<Database>(
  normalizedSupabaseUrl ?? '',
  supabaseAnonKey ?? '',
)
