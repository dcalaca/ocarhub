import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware extremamente simplificado que não faz nada com autenticação
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Reduzindo o escopo do middleware para evitar conflitos
export const config = {
  matcher: ["/dashboard/:path*"],
}
