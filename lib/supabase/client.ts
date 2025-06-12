import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export function clearClient() {
  // Função para limpar o cliente (útil para logout)
  if (typeof window !== "undefined") {
    // Limpar localStorage se necessário
    localStorage.removeItem("supabase.auth.token")
  }
}
