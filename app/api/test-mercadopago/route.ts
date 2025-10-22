import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testando configuração do Mercado Pago...');
    
    // Verificar variáveis de ambiente
    const envCheck = {
      MP_ACCESS_TOKEN: !!process.env.MP_ACCESS_TOKEN,
      MP_PUBLIC_KEY: !!process.env.MP_PUBLIC_KEY,
      MP_WEBHOOK_SECRET: !!process.env.MP_WEBHOOK_SECRET,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL
    };
    
    console.log('📊 Status das variáveis:', envCheck);
    
    // Testar conexão com Mercado Pago
    if (process.env.MP_ACCESS_TOKEN) {
      try {
        const response = await fetch('https://api.mercadopago.com/users/me', {
          headers: {
            'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('✅ Conexão com Mercado Pago OK');
          
          return NextResponse.json({
            success: true,
            message: 'Configuração do Mercado Pago está funcionando',
            environment: {
              ...envCheck,
              user: {
                id: userData.id,
                nickname: userData.nickname,
                email: userData.email
              }
            }
          });
        } else {
          console.error('❌ Erro na conexão:', response.status, response.statusText);
          return NextResponse.json({
            success: false,
            error: 'Erro na conexão com Mercado Pago',
            status: response.status,
            environment: envCheck
          }, { status: 500 });
        }
      } catch (fetchError) {
        console.error('❌ Erro de fetch:', fetchError);
        return NextResponse.json({
          success: false,
          error: 'Erro de rede ao conectar com Mercado Pago',
          details: fetchError instanceof Error ? fetchError.message : 'Erro desconhecido',
          environment: envCheck
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'MP_ACCESS_TOKEN não configurado',
        environment: envCheck
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
