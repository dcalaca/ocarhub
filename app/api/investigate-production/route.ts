import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Investigando logs e configurações no ambiente de produção...');
    
    // Verificar ambiente atual
    const environmentInfo = {
      isProduction: process.env.NODE_ENV === 'production',
      isVercel: !!process.env.VERCEL,
      vercelUrl: process.env.VERCEL_URL,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      timestamp: new Date().toISOString()
    };

    console.log('🌐 Ambiente detectado:', environmentInfo);

    // Verificar configurações do Mercado Pago
    const mpConfig = {
      hasAccessToken: !!process.env.MP_ACCESS_TOKEN,
      hasPublicKey: !!process.env.MP_PUBLIC_KEY,
      hasWebhookSecret: !!process.env.MP_WEBHOOK_SECRET,
      tokenPrefix: process.env.MP_ACCESS_TOKEN?.substring(0, 10) || 'N/A',
      isTestToken: process.env.MP_ACCESS_TOKEN?.includes('TEST') || 
                   process.env.MP_ACCESS_TOKEN?.includes('APP_USR-'),
      webhookSecretLength: process.env.MP_WEBHOOK_SECRET?.length || 0
    };

    console.log('🔑 Configuração MP:', mpConfig);

    // Verificar URLs de webhook
    const webhookUrls = {
      current: `${environmentInfo.baseUrl}/api/webhooks/mercadopago`,
      simple: `${environmentInfo.baseUrl}/api/webhooks/mercadopago-simple`,
      test: `${environmentInfo.baseUrl}/api/webhooks/mercadopago/test`,
      recommendations: []
    };

    if (environmentInfo.isVercel) {
      webhookUrls.recommendations.push('✅ Ambiente Vercel detectado');
      webhookUrls.recommendations.push('💡 Use a URL simples para webhooks');
    }

    // Testar conectividade com Mercado Pago
    let connectivityTest = {
      success: false,
      status: null,
      error: null,
      userInfo: null
    };

    if (process.env.MP_ACCESS_TOKEN) {
      try {
        console.log('🔄 Testando conectividade com Mercado Pago...');
        
        const response = await fetch('https://api.mercadopago.com/users/me', {
          headers: {
            'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        connectivityTest.status = response.status;
        
        if (response.ok) {
          const userData = await response.json();
          connectivityTest.success = true;
          connectivityTest.userInfo = {
            id: userData.id,
            nickname: userData.nickname,
            email: userData.email,
            country_id: userData.country_id,
            site_id: userData.site_id
          };
          console.log('✅ Conectividade OK');
        } else {
          const errorText = await response.text();
          connectivityTest.error = errorText;
          console.log('❌ Erro na conectividade:', response.status);
        }
      } catch (error) {
        connectivityTest.error = error instanceof Error ? error.message : 'Erro desconhecido';
        console.log('❌ Exceção na conectividade:', error);
      }
    }

    // Testar criação de preferência
    let preferenceTest = {
      success: false,
      preferenceId: null,
      sandboxUrl: null,
      error: null
    };

    if (connectivityTest.success) {
      try {
        console.log('🧪 Testando criação de preferência...');
        
        const testPreference = {
          items: [
            {
              id: 'test-item',
              title: 'Teste de Produção',
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
            success: `${environmentInfo.baseUrl}/payment/success`,
            failure: `${environmentInfo.baseUrl}/payment/failure`,
            pending: `${environmentInfo.baseUrl}/payment/pending`
          },
          auto_return: 'approved',
          external_reference: `production-test-${Date.now()}`
        };

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testPreference)
        });

        if (response.ok) {
          const result = await response.json();
          preferenceTest.success = true;
          preferenceTest.preferenceId = result.id;
          preferenceTest.sandboxUrl = result.sandbox_init_point;
          console.log('✅ Preferência criada:', result.id);
        } else {
          const errorText = await response.text();
          preferenceTest.error = errorText;
          console.log('❌ Erro na preferência:', response.status);
        }
      } catch (error) {
        preferenceTest.error = error instanceof Error ? error.message : 'Erro desconhecido';
        console.log('❌ Exceção na preferência:', error);
      }
    }

    // Análise de problemas comuns
    const commonIssues = {
      webhookNotConfigured: !mpConfig.hasWebhookSecret,
      wrongEnvironment: !mpConfig.isTestToken,
      invalidUrls: !environmentInfo.baseUrl,
      connectivityIssues: !connectivityTest.success,
      preferenceIssues: !preferenceTest.success
    };

    const troubleshootingSteps = [
      '1. Verifique os logs do Vercel para erros específicos',
      '2. Confirme se o webhook está configurado no painel do MP',
      '3. Use a URL simples do webhook: /api/webhooks/mercadopago-simple',
      '4. Verifique se as credenciais são de teste (APP_USR-)',
      '5. Teste com cartões oficiais da documentação',
      '6. Monitore as tentativas de pagamento no painel do MP'
    ];

    return NextResponse.json({
      success: true,
      message: 'Investigação completa do ambiente de produção',
      timestamp: new Date().toISOString(),
      environmentInfo,
      mpConfig,
      webhookUrls,
      connectivityTest,
      preferenceTest,
      commonIssues,
      troubleshootingSteps,
      nextSteps: [
        'Execute esta API para monitorar logs em tempo real',
        'Verifique o painel do Mercado Pago para transações',
        'Configure webhook com a URL simples fornecida',
        'Use cartões oficiais da documentação para teste'
      ]
    });

  } catch (error) {
    console.error('❌ Erro na investigação:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno na investigação',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
