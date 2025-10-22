import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Diagnóstico completo do Mercado Pago...');
    
    // Verificar todas as variáveis de ambiente
    const envCheck = {
      MP_ACCESS_TOKEN: !!process.env.MP_ACCESS_TOKEN,
      MP_PUBLIC_KEY: !!process.env.MP_PUBLIC_KEY,
      MP_WEBHOOK_SECRET: !!process.env.MP_WEBHOOK_SECRET,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
      NODE_ENV: process.env.NODE_ENV
    };
    
    console.log('📊 Status das variáveis:', envCheck);
    
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'MP_ACCESS_TOKEN não configurado',
        environment: envCheck
      }, { status: 500 });
    }

    // Analisar o token de acesso
    const token = process.env.MP_ACCESS_TOKEN;
    const tokenAnalysis = {
      length: token.length,
      startsWith: token.substring(0, 10),
      containsTest: token.includes('TEST') || token.includes('test'),
      containsAppUsr: token.includes('APP_USR-'),
      containsProd: token.includes('PROD') || token.includes('prod'),
      isTestToken: token.includes('TEST') || token.includes('test') || token.includes('APP_USR-')
    };
    
    console.log('🔑 Análise do token:', tokenAnalysis);

    // Testar conexão com Mercado Pago
    console.log('🔄 Testando conexão com Mercado Pago...');
    
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na conexão:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Erro na conexão com Mercado Pago',
        status: response.status,
        details: errorText,
        environment: envCheck,
        tokenAnalysis
      }, { status: 500 });
    }

    const userData = await response.json();
    console.log('✅ Conexão estabelecida com sucesso');
    console.log('👤 Dados do usuário:', {
      id: userData.id,
      nickname: userData.nickname,
      email: userData.email,
      country_id: userData.country_id,
      site_id: userData.site_id
    });

    // Testar criação de preferência com dados mínimos
    console.log('🧪 Testando criação de preferência...');
    
    const testPreference = {
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
      external_reference: `diagnostic-test-${Date.now()}`
    };

    const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPreference)
    });

    console.log('📡 Status da preferência:', preferenceResponse.status);

    if (!preferenceResponse.ok) {
      const errorText = await preferenceResponse.text();
      console.error('❌ Erro na criação de preferência:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Erro na criação de preferência de teste',
        status: preferenceResponse.status,
        details: errorText,
        environment: envCheck,
        tokenAnalysis,
        user: {
          id: userData.id,
          nickname: userData.nickname,
          email: userData.email,
          country_id: userData.country_id,
          site_id: userData.site_id
        }
      }, { status: 500 });
    }

    const preferenceResult = await preferenceResponse.json();
    console.log('✅ Preferência de teste criada:', preferenceResult.id);

    // Verificar se a preferência tem URLs corretas
    const urlAnalysis = {
      init_point: preferenceResult.init_point,
      sandbox_init_point: preferenceResult.sandbox_init_point,
      hasInitPoint: !!preferenceResult.init_point,
      hasSandboxInitPoint: !!preferenceResult.sandbox_init_point,
      initPointIsSandbox: preferenceResult.init_point?.includes('sandbox') || false
    };

    console.log('🔗 Análise das URLs:', urlAnalysis);

    return NextResponse.json({
      success: true,
      message: 'Diagnóstico completo realizado',
      environment: envCheck,
      tokenAnalysis,
      user: {
        id: userData.id,
        nickname: userData.nickname,
        email: userData.email,
        country_id: userData.country_id,
        site_id: userData.site_id
      },
      testPreference: {
        id: preferenceResult.id,
        init_point: preferenceResult.init_point,
        sandbox_init_point: preferenceResult.sandbox_init_point
      },
      urlAnalysis,
      recommendations: [
        tokenAnalysis.isTestToken ? 
          '✅ Usando credenciais de TESTE - correto para desenvolvimento' : 
          '⚠️ Usando credenciais de PRODUÇÃO - cuidado!',
        urlAnalysis.initPointIsSandbox ? 
          '✅ URL de sandbox detectada - correto para teste' : 
          '⚠️ URL de produção detectada - pode causar erro',
        '💡 Use apenas cartões de teste com credenciais de teste',
        '💡 Configure NEXT_PUBLIC_BASE_URL no Vercel se necessário'
      ]
    });

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno no diagnóstico',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
