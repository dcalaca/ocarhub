import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Criando preferência com Access Token direto...');
    
    const body = await request.json();
    const { items, payer, external_reference } = body;
    
    // Usar Access Token diretamente (sem OAuth)
    const accessToken = process.env.MP_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'MP_ACCESS_TOKEN não configurado'
      }, { status: 500 });
    }
    
    console.log('📋 Dados recebidos:', {
      items_count: items?.length,
      payer_email: payer?.email,
      external_reference,
      access_token_prefix: accessToken.substring(0, 20) + '...'
    });
    
    // Preparar dados da preferência
    const preferenceData = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.price,
        category_id: item.category_id || 'others'
      })),
      payer: {
        name: payer.name,
        email: payer.email
      },
      external_reference: external_reference,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ocarhub.com'}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ocarhub.com'}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ocarhub.com'}/payment/pending`
      },
      auto_return: 'approved',
      // Remover notification_url para ambiente de teste
      ...(accessToken.startsWith('APP_USR-46') ? {} : {
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ocarhub.com'}/api/webhooks/mercadopago-simple`
      })
    };
    
    console.log('📤 Enviando para Mercado Pago...');
    
    // Fazer requisição direta para Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `direct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      body: JSON.stringify(preferenceData)
    });
    
    const responseText = await response.text();
    console.log('📥 Resposta do MP:', {
      status: response.status,
      statusText: response.statusText,
      response_length: responseText.length
    });
    
    if (!response.ok) {
      console.error('❌ Erro na resposta:', responseText);
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar preferência',
        details: responseText,
        status: response.status
      }, { status: 500 });
    }
    
    const data = JSON.parse(responseText);
    
    console.log('✅ Preferência criada:', {
      id: data.id,
      has_init_point: !!data.init_point,
      has_sandbox_init_point: !!data.sandbox_init_point
    });
    
    return NextResponse.json({
      success: true,
      preference_id: data.id,
      checkout_url: data.sandbox_init_point || data.init_point,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      external_reference: data.external_reference
    });
    
  } catch (error) {
    console.error('❌ Erro na criação de preferência:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
