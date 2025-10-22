import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Verificação completa do ambiente Sandbox...');
    
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'MP_ACCESS_TOKEN não configurado'
      }, { status: 500 });
    }

    const token = process.env.MP_ACCESS_TOKEN;
    
    // 1. Verificar Credenciais de Teste
    const credentialsCheck = {
      hasToken: !!process.env.MP_ACCESS_TOKEN,
      hasPublicKey: !!process.env.MP_PUBLIC_KEY,
      hasWebhookSecret: !!process.env.MP_WEBHOOK_SECRET,
      tokenPrefix: token.substring(0, 10),
      isTestToken: token.includes('TEST') || token.includes('test') || token.includes('APP_USR-'),
      tokenLength: token.length,
      recommendations: []
    };

    if (!credentialsCheck.isTestToken) {
      credentialsCheck.recommendations.push('⚠️ Token não parece ser de teste - verifique se é APP_USR-');
    } else {
      credentialsCheck.recommendations.push('✅ Token de teste detectado corretamente');
    }

    // 2. Verificar Cartões de Teste Oficiais
    const officialTestCards = [
      {
        name: 'Visa Aprovado (Oficial)',
        number: '4009 1753 3280 6176',
        cvv: '123',
        expiry: '11/25',
        holder: 'APRO',
        source: 'Documentação oficial Mercado Pago',
        status: 'Recomendado'
      },
      {
        name: 'Mastercard Aprovado (Oficial)',
        number: '5031 4332 1540 6351',
        cvv: '123',
        expiry: '11/30',
        holder: 'APRO',
        source: 'Documentação oficial Mercado Pago',
        status: 'Recomendado'
      },
      {
        name: 'Visa Alternativo (Oficial)',
        number: '4235 6477 2802 5682',
        cvv: '123',
        expiry: '11/30',
        holder: 'APRO',
        source: 'Documentação oficial Mercado Pago',
        status: 'Alternativo'
      },
      {
        name: 'Visa Recusado (Oficial)',
        number: '4000 0000 0000 0002',
        cvv: '123',
        expiry: '11/25',
        holder: 'OTHE',
        source: 'Documentação oficial Mercado Pago',
        status: 'Para teste de erro'
      }
    ];

    // 3. Verificar URLs de Redirecionamento
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ocarhub.vercel.app';
    const redirectUrls = {
      success: `${baseUrl}/payment/success`,
      failure: `${baseUrl}/payment/failure`,
      pending: `${baseUrl}/payment/pending`,
      webhook: `${baseUrl}/api/webhooks/mercadopago-simple`,
      isTestEnvironment: baseUrl.includes('vercel.app') || baseUrl.includes('localhost'),
      recommendations: []
    };

    if (redirectUrls.isTestEnvironment) {
      redirectUrls.recommendations.push('✅ URLs apontam para ambiente de teste');
    } else {
      redirectUrls.recommendations.push('⚠️ URLs podem estar apontando para produção');
    }

    // 4. Testar Conexão com Mercado Pago
    console.log('🔄 Testando conexão com Mercado Pago...');
    
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let connectionTest = {
      success: false,
      status: response.status,
      userData: null,
      error: null
    };

    if (response.ok) {
      const userData = await response.json();
      connectionTest = {
        success: true,
        status: response.status,
        userData: {
          id: userData.id,
          nickname: userData.nickname,
          email: userData.email,
          country_id: userData.country_id,
          site_id: userData.site_id
        },
        error: null
      };
      console.log('✅ Conexão estabelecida com sucesso');
    } else {
      const errorText = await response.text();
      connectionTest.error = errorText;
      console.log('❌ Erro na conexão:', response.status);
    }

    // 5. Criar Preferência de Teste
    console.log('🧪 Criando preferência de teste...');
    
    const testPreference = {
      items: [
        {
          id: 'test-item',
          title: 'Teste de Verificação',
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
        success: redirectUrls.success,
        failure: redirectUrls.failure,
        pending: redirectUrls.pending
      },
      auto_return: 'approved',
      external_reference: `verification-test-${Date.now()}`
    };

    const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPreference)
    });

    let preferenceTest = {
      success: false,
      preferenceId: null,
      sandboxUrl: null,
      productionUrl: null,
      error: null
    };

    if (preferenceResponse.ok) {
      const result = await preferenceResponse.json();
      preferenceTest = {
        success: true,
        preferenceId: result.id,
        sandboxUrl: result.sandbox_init_point,
        productionUrl: result.init_point,
        error: null
      };
      console.log('✅ Preferência criada com sucesso');
    } else {
      const errorText = await preferenceResponse.text();
      preferenceTest.error = errorText;
      console.log('❌ Erro na criação da preferência:', preferenceResponse.status);
    }

    // 6. Resumo e Recomendações
    const summary = {
      credentialsValid: credentialsCheck.isTestToken && connectionTest.success,
      cardsAvailable: officialTestCards.length,
      urlsConfigured: redirectUrls.isTestEnvironment,
      preferenceWorking: preferenceTest.success,
      overallStatus: 'unknown'
    };

    if (summary.credentialsValid && summary.urlsConfigured && summary.preferenceWorking) {
      summary.overallStatus = 'excellent';
    } else if (summary.credentialsValid && summary.preferenceWorking) {
      summary.overallStatus = 'good';
    } else {
      summary.overallStatus = 'needs_attention';
    }

    const recommendations = [
      credentialsCheck.isTestToken ? 
        '✅ Credenciais de teste configuradas corretamente' : 
        '❌ Verifique se está usando credenciais de teste',
      connectionTest.success ? 
        '✅ Conexão com Mercado Pago funcionando' : 
        '❌ Problema na conexão com Mercado Pago',
      preferenceTest.success ? 
        '✅ Criação de preferências funcionando' : 
        '❌ Problema na criação de preferências',
      redirectUrls.isTestEnvironment ? 
        '✅ URLs de redirecionamento corretas' : 
        '⚠️ Verifique URLs de redirecionamento',
      '💡 Use os cartões oficiais da documentação',
      '💡 Certifique-se de estar no ambiente Sandbox',
      '💡 Configure webhook no painel do Mercado Pago'
    ];

    return NextResponse.json({
      success: true,
      message: 'Verificação completa do ambiente Sandbox',
      timestamp: new Date().toISOString(),
      credentialsCheck,
      officialTestCards,
      redirectUrls,
      connectionTest,
      preferenceTest,
      summary,
      recommendations
    });

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno na verificação',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
