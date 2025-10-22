import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Criando preferência para MODO DE TESTE...');
    
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error('❌ MP_ACCESS_TOKEN não configurado');
      return NextResponse.json(
        { error: 'Configuração do Mercado Pago não encontrada' },
        { status: 500 }
      );
    }

    // Verificar se é realmente modo de teste
    const isTestMode = process.env.MP_ACCESS_TOKEN.includes('TEST') || 
                      process.env.MP_ACCESS_TOKEN.includes('test') ||
                      process.env.MP_ACCESS_TOKEN.includes('APP_USR-');
    
    if (!isTestMode) {
      console.error('❌ Esta API é apenas para modo de teste');
      return NextResponse.json(
        { error: 'Esta API é apenas para modo de teste. Use credenciais de teste.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('📊 Dados recebidos:', { 
      itemsCount: body.items?.length, 
      payerEmail: body.payer?.email,
      externalReference: body.external_reference 
    });

    const { items, payer, external_reference } = body;

    // Validar dados obrigatórios
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ Items são obrigatórios');
      return NextResponse.json(
        { error: 'Items são obrigatórios' },
        { status: 400 }
      );
    }

    if (!payer || !payer.name || !payer.email) {
      console.error('❌ Dados do pagador são obrigatórios');
      return NextResponse.json(
        { error: 'Dados do pagador são obrigatórios' },
        { status: 400 }
      );
    }

    // Preparar dados da preferência para MODO DE TESTE
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ocarhub.vercel.app';
    
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
      external_reference: external_reference || `test-ocar-platform-${Date.now()}`,
      // Para modo de teste, não usar notification_url
      // Os pagamentos de teste não enviam notificações
    };

    console.log('🔄 Criando preferência de TESTE no Mercado Pago...');
    console.log('📋 Dados da preferência:', JSON.stringify(preferenceData, null, 2));

    // Criar preferência usando fetch direto
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `test-preference-${Date.now()}`
      },
      body: JSON.stringify(preferenceData)
    });

    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta do Mercado Pago:', errorText);
      
      let errorMessage = 'Erro na API do Mercado Pago';
      let errorDetails = errorText;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
        if (errorJson.cause) {
          errorDetails = JSON.stringify(errorJson.cause);
        }
      } catch (parseError) {
        // Usar texto original se não conseguir fazer parse
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: errorDetails,
        status: response.status,
        mode: 'TESTE',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('✅ Preferência de TESTE criada com sucesso:', result.id);
    console.log('🔗 URL de checkout:', result.init_point);

    return NextResponse.json({
      success: true,
      mode: 'TESTE',
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      external_reference: preferenceData.external_reference,
      test_cards: {
        approved: '4009 1753 3280 6176 (CVV: 123, Vencimento: 11/25)',
        rejected: '4000 0000 0000 0002 (CVV: 123, Vencimento: 11/25)'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência de teste:', error);
    
    if (error instanceof Error) {
      console.error('❌ Mensagem de erro:', error.message);
      console.error('❌ Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        mode: 'TESTE',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
