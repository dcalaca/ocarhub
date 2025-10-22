import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Analisando problema específico do sandbox...');
    
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'MP_ACCESS_TOKEN não configurado'
      }, { status: 500 });
    }

    // Verificar se é realmente sandbox
    const token = process.env.MP_ACCESS_TOKEN;
    const isSandbox = token.includes('TEST') || token.includes('test') || token.includes('APP_USR-');
    
    console.log('🧪 Modo detectado:', isSandbox ? 'SANDBOX' : 'PRODUÇÃO');

    // Informações sobre o problema do sandbox
    const sandboxInfo = {
      isSandbox,
      tokenPrefix: token.substring(0, 10),
      commonIssues: [
        'Cartões de teste podem ter restrições específicas',
        'Alguns cartões só funcionam em certas condições',
        'O ambiente sandbox pode ter limitações temporárias',
        'Cartões podem estar bloqueados por segurança',
        'Pode ser necessário usar cartões específicos da região'
      ],
      solutions: [
        'Tentar cartões diferentes da lista oficial',
        'Verificar se o cartão está na lista de cartões válidos',
        'Usar cartões específicos para o Brasil',
        'Verificar se há restrições no painel do Mercado Pago',
        'Contatar suporte do Mercado Pago se persistir'
      ],
      officialCards: {
        brazil: [
          {
            name: 'Visa Aprovado (Brasil)',
            number: '4009 1753 3280 6176',
            cvv: '123',
            expiry: '11/25',
            holder: 'APRO'
          },
          {
            name: 'Mastercard Aprovado (Brasil)',
            number: '5031 4332 1540 6351',
            cvv: '123',
            expiry: '11/30',
            holder: 'APRO'
          },
          {
            name: 'Visa Alternativo (Brasil)',
            number: '4235 6477 2802 5682',
            cvv: '123',
            expiry: '11/30',
            holder: 'APRO'
          }
        ],
        international: [
          {
            name: 'Visa Internacional',
            number: '4000 0000 0000 0001',
            cvv: '123',
            expiry: '11/25',
            holder: 'TEST'
          },
          {
            name: 'Mastercard Internacional',
            number: '5031 4332 1540 6351',
            cvv: '123',
            expiry: '11/30',
            holder: 'TEST'
          }
        ]
      },
      troubleshooting: [
        '1. Verifique se está no ambiente sandbox correto',
        '2. Use cartões específicos para o Brasil',
        '3. Digite o nome exatamente como mostrado',
        '4. Use CVV e vencimento corretos',
        '5. Se persistir, pode ser limitação do sandbox',
        '6. Considere usar credenciais de produção para testes finais'
      ]
    };

    return NextResponse.json({
      success: true,
      message: 'Análise do problema do sandbox concluída',
      sandboxInfo,
      nextSteps: [
        'Execute /api/test-mp-cards para testar todos os cartões',
        'Use os cartões específicos para o Brasil',
        'Se nenhum funcionar, pode ser limitação do sandbox',
        'Considere contatar suporte do Mercado Pago'
      ]
    });

  } catch (error) {
    console.error('❌ Erro na análise:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno na análise',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
