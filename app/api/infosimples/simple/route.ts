import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Simple API Route chamada')
    
    const body = await request.json()
    console.log('📝 Body recebido:', body)
    
    return NextResponse.json({ 
      success: true, 
      message: 'API funcionando!',
      received: body 
    })
  } catch (error) {
    console.error('❌ Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
