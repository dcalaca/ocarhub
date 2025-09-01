import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logs
console.log("Supabase URL:", supabaseUrl ? "Definida" : "Não definida")
console.log("Supabase Anon Key:", supabaseAnonKey ? "Definida" : "Não definida")

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

if (!supabase) {
  console.warn("Supabase não configurado. Algumas funcionalidades podem não funcionar.")
}
