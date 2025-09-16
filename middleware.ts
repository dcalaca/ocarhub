import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se é uma rota administrativa
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Em um ambiente real, você verificaria a autenticação aqui
    // Por enquanto, vamos permitir acesso direto
    // Em produção, implemente verificação de token/sessão
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
