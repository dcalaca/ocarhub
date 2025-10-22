import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Criando preferência com configuração otimizada para sandbox...');
    
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'MP_ACCESS_TOKEN não configurado' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { items, payer, external_reference } = body;

    // Configuração mínima recomendada (baseada nos testes)
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
      external_reference: external_reference || `sandbox-minimal-${Date.now()}`
    };

    console.log('🔄 Criando preferência otimizada para sandbox...');
    console.log('📋 Dados:', JSON.stringify(preferenceData, null, 2));

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `sandbox-${Date.now()}`
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
        status: response.status
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('✅ Preferência criada:', result.id);

    // Retornar URLs específicas para sandbox
    const checkoutUrl = result.sandbox_init_point || result.init_point;
    
    return NextResponse.json({
      success: true,
      mode: 'SANDBOX',
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      checkout_url: checkoutUrl,
      external_reference: preferenceData.external_reference,
      test_cards: {
        approved: {
          number: '4009 1753 3280 6176',
          cvv: '123',
          expiry: '11/25',
          name: 'APRO'
        },
        rejected: {
          number: '4000 0000 0000 0002',
          cvv: '123',
          expiry: '11/25',
          name: 'OTHE'
        },
        alternative: {
          number: '5031 4332 1540 6351',
          cvv: '123',
          expiry: '11/30',
          name: 'APRO'
        }
      },
      instructions: [
        '1. Use o cartão de teste fornecido',
        '2. Digite o nome exatamente como mostrado',
        '3. Use o CVV e vencimento corretos',
        '4. Se der erro, tente o cartão alternativo',
        '5. Certifique-se de estar no ambiente Sandbox'
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
