import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Criando preferência com token OAuth...');
    
    const body = await request.json();
    const { 
      items, 
      payer, 
      external_reference,
      client_id,
      client_secret,
      grant_type = 'client_credentials'
    } = body;

    // Validar dados obrigatórios
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items são obrigatórios' },
        { status: 400 }
      );
    }

    if (!payer || !payer.name || !payer.email) {
      return NextResponse.json(
        { error: 'Dados do pagador são obrigatórios' },
        { status: 400 }
      );
    }

    if (!client_id || !client_secret) {
      return NextResponse.json(
        { error: 'client_id e client_secret são obrigatórios para OAuth' },
        { status: 400 }
      );
    }

    // Primeiro, obter token OAuth
    console.log('🔄 Obtendo token OAuth...');
    
    const oauthResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_secret,
        client_id,
        grant_type
      })
    });

    if (!oauthResponse.ok) {
      const errorText = await oauthResponse.text();
      console.error('❌ Erro OAuth:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Erro na autenticação OAuth',
        details: errorText,
        status: oauthResponse.status
      }, { status: 500 });
    }

    const oauthResult = await oauthResponse.json();
    console.log('✅ Token OAuth obtido:', oauthResult.access_token?.substring(0, 20) + '...');

    // Agora criar preferência com token OAuth
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'https://ocarhub.vercel.app';

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
      external_reference: external_reference || `oauth-test-${Date.now()}`,
      notification_url: `${baseUrl}/api/webhooks/mercadopago-simple`
    };

    console.log('🔄 Criando preferência com token OAuth...');

    const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${oauthResult.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    });

    console.log('📡 Status da preferência:', preferenceResponse.status);

    if (!preferenceResponse.ok) {
      const errorText = await preferenceResponse.text();
      console.error('❌ Erro na preferência:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Erro na criação da preferência',
        details: errorText,
        status: preferenceResponse.status,
        oauthToken: oauthResult.access_token?.substring(0, 20) + '...'
      }, { status: 500 });
    }

    const result = await preferenceResponse.json();
    console.log('✅ Preferência criada com OAuth:', result.id);

    return NextResponse.json({
      success: true,
      message: 'Preferência criada com token OAuth',
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      checkout_url: result.sandbox_init_point || result.init_point,
      external_reference: preferenceData.external_reference,
      oauth: {
        access_token: oauthResult.access_token,
        expires_in: oauthResult.expires_in,
        user_id: oauthResult.user_id,
        live_mode: oauthResult.live_mode
      },
      instructions: [
        '1. Use o checkout_url para pagamento',
        '2. Token OAuth válido por ' + (oauthResult.expires_in / 3600) + ' horas',
        '3. Use refresh_token para renovar quando necessário',
        '4. Configure webhook no painel do Mercado Pago'
      ]
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
