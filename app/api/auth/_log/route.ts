import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('🔐 Log de autenticação:', body)
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Erro no log de autenticação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
