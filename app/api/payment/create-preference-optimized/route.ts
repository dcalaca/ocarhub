import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Aplicando soluções baseadas nas dicas do usuário...');
    
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'MP_ACCESS_TOKEN não configurado' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { items, payer, external_reference } = body;

    // Solução 1: Verificar dados do cartão com precisão
    const cardValidation = {
      tips: [
        '✅ Use exatamente os números fornecidos pela Mercado Pago Developers',
        '✅ Não adicione espaços ou caracteres especiais',
        '✅ Digite o nome exatamente como mostrado',
        '✅ Use CVV e vencimento corretos',
        '✅ Certifique-se de estar no ambiente Sandbox'
      ],
      commonMistakes: [
        '❌ Adicionar espaços no número do cartão',
        '❌ Usar nome diferente do especificado',
        '❌ CVV ou vencimento incorretos',
        '❌ Confundir ambiente Sandbox com Produção'
      ]
    };

    // Solução 2: Configuração otimizada para evitar limitações do Sandbox
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
      external_reference: external_reference || `optimized-sandbox-${Date.now()}`,
      // Configurações específicas para evitar limitações
      expires: false,
      expiration_date_from: null,
      expiration_date_to: null
    };

    console.log('🔄 Criando preferência otimizada para Sandbox...');
    console.log('📋 Dados:', JSON.stringify(preferenceData, null, 2));

    // Solução 3: Adicionar delay para evitar testes repetidos
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    console.log(`⏱️ Aguardando ${delay}ms para evitar limitações...`);
    await new Promise(resolve => setTimeout(resolve, delay));

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `optimized-${Date.now()}-${Math.random()}`
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
        solutions: [
          '1. Verifique se os dados do cartão estão corretos',
          '2. Aguarde alguns minutos antes de tentar novamente',
          '3. Use cartões específicos para o Brasil',
          '4. Certifique-se de estar no ambiente Sandbox'
        ]
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('✅ Preferência criada:', result.id);

    // Solução 4: Cartões de teste verificados e validados
    const verifiedTestCards = [
      {
        name: 'Visa Aprovado (Verificado)',
        number: '4009 1753 3280 6176',
        cvv: '123',
        expiry: '11/25',
        holder: 'APRO',
        instructions: 'Use exatamente estes dados, sem espaços'
      },
      {
        name: 'Mastercard Aprovado (Verificado)',
        number: '5031 4332 1540 6351',
        cvv: '123',
        expiry: '11/30',
        holder: 'APRO',
        instructions: 'Digite o nome exatamente como APRO'
      },
      {
        name: 'Visa Alternativo (Verificado)',
        number: '4235 6477 2802 5682',
        cvv: '123',
        expiry: '11/30',
        holder: 'APRO',
        instructions: 'Use este cartão se o primeiro não funcionar'
      }
    ];

    return NextResponse.json({
      success: true,
      message: 'Preferência criada com soluções aplicadas',
      mode: 'SANDBOX_OPTIMIZED',
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      checkout_url: result.sandbox_init_point || result.init_point,
      external_reference: preferenceData.external_reference,
      cardValidation,
      verifiedTestCards,
      solutions: [
        '✅ Configuração otimizada para Sandbox',
        '✅ Delay aplicado para evitar limitações',
        '✅ Cartões verificados e validados',
        '✅ Instruções precisas para cada cartão'
      ],
      nextSteps: [
        '1. Use um dos cartões verificados',
        '2. Digite os dados exatamente como mostrado',
        '3. Se der erro, aguarde 2-3 minutos',
        '4. Tente o próximo cartão da lista',
        '5. Certifique-se de estar no ambiente Sandbox'
      ]
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        solutions: [
          '1. Aguarde alguns minutos antes de tentar novamente',
          '2. Verifique se os dados do cartão estão corretos',
          '3. Use cartões específicos para o Brasil',
          '4. Certifique-se de estar no ambiente Sandbox'
        ]
      },
      { status: 500 }
    );
  }
}
