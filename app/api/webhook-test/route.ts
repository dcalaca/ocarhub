import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook de teste recebido')
    
    const body = await request.text()
    console.log('📝 Body recebido:', body)
    
    // Tentar fazer parse do JSON
    let parsedBody
    try {
      parsedBody = JSON.parse(body)
      console.log('✅ JSON parseado com sucesso:', parsedBody)
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError)
      return NextResponse.json({
        error: 'Erro ao fazer parse do JSON',
        body: body
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Webhook de teste funcionando',
      received: parsedBody,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro geral no webhook de teste:', error)
    return NextResponse.json({
      error: 'Erro interno no webhook de teste',
      details: error.message
    }, { status: 500 })
  }
}
