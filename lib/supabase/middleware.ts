// Arquivo: lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export function createClient(request: NextRequest) {
  // Cria uma resposta inicial. Todas as modificações de cookie devem ser feitas
  // neste objeto de resposta.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = request.cookies.get(name)?.value
          console.log(`[Middleware Client] GET cookie: ${name} = ${value ? "Presente" : "Ausente"}`)
          return value
        },
        set(name: string, value: string, options: CookieOptions) {
          // A forma correta é modificar o objeto `response` original,
          // e não criar um novo. Garante que o cookie seja definido para o caminho raiz.
          response.cookies.set({
            name,
            value,
            path: "/", // Garante que o cookie seja definido para o caminho raiz
            ...options,
          })
          console.log(`[Middleware Client] SET cookie: ${name} = ${value ? "Definido" : "Vazio"} (path: /)`)
        },
        remove(name: string, options: CookieOptions) {
          // O mesmo aqui, apenas modificamos o `response` original.
          // Garante que o cookie seja removido do caminho raiz.
          response.cookies.set({
            name,
            value: "",
            path: "/", // Garante que o cookie seja removido do caminho raiz
            ...options,
          })
          console.log(`[Middleware Client] REMOVE cookie: ${name} (path: /)`)
        },
      },
    },
  )

  return { supabase, response }
}
