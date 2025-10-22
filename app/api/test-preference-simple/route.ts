import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Teste simples de criação de preferência...');
    
    // Verificar variáveis de ambiente
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'MP_ACCESS_TOKEN não configurado'
      }, { status: 500 });
    }

    const body = await request.json();
    console.log('📊 Dados recebidos:', body);

    // Dados mínimos para teste
    const testData = {
      items: [
        {
          id: 'test-item',
          title: 'Item de Teste',
          quantity: 1,
          unit_price: 10.00,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: 'Teste Usuario',
        email: 'teste@exemplo.com'
      },
      back_urls: {
        success: 'https://ocarhub.vercel.app/payment/success',
        failure: 'https://ocarhub.vercel.app/payment/failure',
        pending: 'https://ocarhub.vercel.app/payment/pending'
      },
      auto_return: 'approved',
      external_reference: `test-${Date.now()}`
    };

    console.log('📋 Dados de teste:', JSON.stringify(testData, null, 2));

    // Tentar criar preferência diretamente com fetch
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Erro na API do Mercado Pago',
        status: response.status,
        details: errorText
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('✅ Preferência criada com sucesso:', result.id);

    return NextResponse.json({
      success: true,
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
