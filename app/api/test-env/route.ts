import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envVars = {
      MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN ? '✅ Configurado' : '❌ Não configurado',
      MP_WEBHOOK_SECRET: process.env.MP_WEBHOOK_SECRET ? '✅ Configurado' : '❌ Não configurado',
      MP_PUBLIC_KEY: process.env.MP_PUBLIC_KEY ? '✅ Configurado' : '❌ Não configurado',
      MP_CLIENT_ID: process.env.MP_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado',
      MP_CLIENT_SECRET: process.env.MP_CLIENT_SECRET ? '✅ Configurado' : '❌ Não configurado',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'Não configurado'
    }

    return NextResponse.json({
      success: true,
      environment: envVars,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao verificar variáveis de ambiente',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
