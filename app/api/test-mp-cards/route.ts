import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Investigando cartões de teste do Mercado Pago...');
    
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'MP_ACCESS_TOKEN não configurado'
      }, { status: 500 });
    }

    // Lista completa de cartões de teste do Mercado Pago
    const testCards = [
      {
        name: 'Visa Aprovado (Principal)',
        number: '4009 1753 3280 6176',
        cvv: '123',
        expiry: '11/25',
        holder: 'APRO',
        type: 'visa'
      },
      {
        name: 'Visa Aprovado (Alternativo)',
        number: '4235 6477 2802 5682',
        cvv: '123',
        expiry: '11/30',
        holder: 'APRO',
        type: 'visa'
      },
      {
        name: 'Mastercard Aprovado',
        number: '5031 4332 1540 6351',
        cvv: '123',
        expiry: '11/30',
        holder: 'APRO',
        type: 'mastercard'
      },
      {
        name: 'Visa Recusado',
        number: '4000 0000 0000 0002',
        cvv: '123',
        expiry: '11/25',
        holder: 'OTHE',
        type: 'visa'
      },
      {
        name: 'Visa Pendente',
        number: '4000 0000 0000 0004',
        cvv: '123',
        expiry: '11/25',
        holder: 'CONT',
        type: 'visa'
      },
      {
        name: 'Visa Saldo Insuficiente',
        number: '4000 0000 0000 0005',
        cvv: '123',
        expiry: '11/25',
        holder: 'FUND',
        type: 'visa'
      },
      {
        name: 'Visa CVV Inválido',
        number: '4000 0000 0000 0006',
        cvv: '123',
        expiry: '11/25',
        holder: 'SECU',
        type: 'visa'
      },
      {
        name: 'Visa Teste Simples',
        number: '4000 0000 0000 0001',
        cvv: '123',
        expiry: '11/25',
        holder: 'TEST',
        type: 'visa'
      }
    ];

    // Criar uma preferência de teste para cada cartão
    const results = [];
    
    for (const card of testCards) {
      try {
        console.log(`🧪 Testando cartão: ${card.name}`);
        
        const preferenceData = {
          items: [
            {
              id: 'test-item',
              title: 'Teste de Cartão',
              quantity: 1,
              unit_price: 10.00,
              currency_id: 'BRL'
            }
          ],
          payer: {
            name: card.holder,
            email: 'teste@exemplo.com'
          },
          external_reference: `test-card-${card.type}-${Date.now()}`
        };

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(preferenceData)
        });

        if (response.ok) {
          const result = await response.json();
          results.push({
            card: card,
            success: true,
            preference_id: result.id,
            sandbox_url: result.sandbox_init_point,
            recommendation: card.name.includes('Aprovado') ? '✅ Recomendado' : '⚠️ Para teste específico'
          });
          console.log(`✅ ${card.name}: Sucesso - ${result.id}`);
        } else {
          const errorText = await response.text();
          results.push({
            card: card,
            success: false,
            error: errorText,
            status: response.status
          });
          console.log(`❌ ${card.name}: Erro - ${response.status}`);
        }
      } catch (error) {
        results.push({
          card: card,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        console.log(`❌ ${card.name}: Exceção - ${error}`);
      }
    }

    // Analisar resultados
    const successfulCards = results.filter(r => r.success);
    const failedCards = results.filter(r => !r.success);

    console.log(`📊 Resultados: ${successfulCards.length} cartões funcionaram, ${failedCards.length} falharam`);

    return NextResponse.json({
      success: true,
      message: 'Teste de cartões concluído',
      total_cards: testCards.length,
      successful_cards: successfulCards.length,
      failed_cards: failedCards.length,
      results,
      recommendations: [
        successfulCards.length > 0 ? 
          '✅ Pelo menos um cartão funcionou' : 
          '❌ Nenhum cartão funcionou',
        '💡 Use os cartões que funcionaram para testes',
        '💡 Cartões "Aprovado" são ideais para testes de sucesso',
        '💡 Cartões "Recusado" são ideais para testes de erro',
        '💡 Se nenhum funcionar, pode ser problema do ambiente sandbox'
      ],
      working_cards: successfulCards.map(r => ({
        name: r.card.name,
        number: r.card.number,
        holder: r.card.holder,
        recommendation: r.recommendation
      }))
    });

  } catch (error) {
    console.error('❌ Erro no teste de cartões:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno no teste',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
