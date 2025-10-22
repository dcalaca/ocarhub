import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Corrigindo problema da NEXT_PUBLIC_BASE_URL...');
    
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'MP_ACCESS_TOKEN não configurado' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { items, payer, external_reference } = body;

    // Detectar URL base automaticamente
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'https://ocarhub.vercel.app';

    console.log('🌐 URL base detectada:', baseUrl);

    // Configuração otimizada com URL correta
    const preferenceData = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.price),
        currency_id: 'BRL'
      })),
      payer: {
        name: payer.name,
        email: payer.email
      },
      back_urls: {
        success: `${baseUrl}/payment/success`,
        failure: `${baseUrl}/payment/failure`,
        pending: `${baseUrl}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: external_reference || `fixed-url-${Date.now()}`,
      // Webhook URL corrigida
      notification_url: `${baseUrl}/api/webhooks/mercadopago-simple`
    };

    console.log('🔄 Criando preferência com URL corrigida...');
    console.log('📋 URLs configuradas:', {
      success: preferenceData.back_urls.success,
      failure: preferenceData.back_urls.failure,
      pending: preferenceData.back_urls.pending,
      webhook: preferenceData.notification_url
    });

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `fixed-url-${Date.now()}`
      },
      body: JSON.stringify(preferenceData)
    });

    console.log('📡 Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Erro na criação da preferência',
        details: errorText,
        status: response.status,
        baseUrl,
        troubleshooting: [
          '1. Verifique se NEXT_PUBLIC_BASE_URL está configurada no Vercel',
          '2. Configure a variável no painel do Vercel',
          '3. Use: https://ocarhub.vercel.app',
          '4. Reinicie o deploy após configurar'
        ]
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('✅ Preferência criada:', result.id);

    return NextResponse.json({
      success: true,
      message: 'Preferência criada com URL corrigida',
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      checkout_url: result.sandbox_init_point || result.init_point,
      external_reference: preferenceData.external_reference,
      baseUrl,
      urls: {
        success: preferenceData.back_urls.success,
        failure: preferenceData.back_urls.failure,
        pending: preferenceData.back_urls.pending,
        webhook: preferenceData.notification_url
      },
      fixApplied: 'URL base detectada automaticamente',
      nextSteps: [
        '1. Configure NEXT_PUBLIC_BASE_URL no Vercel',
        '2. Use: https://ocarhub.vercel.app',
        '3. Configure webhook no painel do MP',
        '4. Teste com cartões oficiais'
      ]
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        fix: 'Configure NEXT_PUBLIC_BASE_URL no Vercel'
      },
      { status: 500 }
    );
  }
}
