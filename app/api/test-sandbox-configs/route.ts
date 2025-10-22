import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Investigando problema específico do sandbox...');
    
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'MP_ACCESS_TOKEN não configurado'
      }, { status: 500 });
    }

    // Testar diferentes configurações de preferência
    const testConfigurations = [
      {
        name: 'Configuração Mínima',
        data: {
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
          external_reference: `test-minimal-${Date.now()}`
        }
      },
      {
        name: 'Configuração com Back URLs',
        data: {
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
          external_reference: `test-backurls-${Date.now()}`
        }
      },
      {
        name: 'Configuração Completa',
        data: {
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
          external_reference: `test-complete-${Date.now()}`,
          payment_methods: {
            excluded_payment_methods: [],
            excluded_payment_types: []
          }
        }
      }
    ];

    const results = [];

    for (const config of testConfigurations) {
      try {
        console.log(`🧪 Testando: ${config.name}`);
        
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(config.data)
        });

        if (response.ok) {
          const result = await response.json();
          results.push({
            configuration: config.name,
            success: true,
            preference_id: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point,
            hasInitPoint: !!result.init_point,
            hasSandboxInitPoint: !!result.sandbox_init_point
          });
          console.log(`✅ ${config.name}: Sucesso - ${result.id}`);
        } else {
          const errorText = await response.text();
          results.push({
            configuration: config.name,
            success: false,
            status: response.status,
            error: errorText
          });
          console.log(`❌ ${config.name}: Erro - ${response.status}`);
        }
      } catch (error) {
        results.push({
          configuration: config.name,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        console.log(`❌ ${config.name}: Exceção - ${error}`);
      }
    }

    // Analisar resultados
    const successfulConfigs = results.filter(r => r.success);
    const failedConfigs = results.filter(r => !r.success);

    console.log(`📊 Resultados: ${successfulConfigs.length} sucessos, ${failedConfigs.length} falhas`);

    return NextResponse.json({
      success: true,
      message: 'Teste de configurações concluído',
      results,
      summary: {
        total: results.length,
        successful: successfulConfigs.length,
        failed: failedConfigs.length
      },
      recommendations: [
        successfulConfigs.length > 0 ? 
          '✅ Pelo menos uma configuração funcionou' : 
          '❌ Nenhuma configuração funcionou',
        '💡 Use a configuração que funcionou para criar preferências',
        '💡 Verifique se as URLs de retorno estão corretas',
        '💡 Considere usar apenas configuração mínima para testes'
      ],
      workingConfiguration: successfulConfigs.length > 0 ? 
        successfulConfigs[0].configuration : 
        null
    });

  } catch (error) {
    console.error('❌ Erro no teste de configurações:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno no teste',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
