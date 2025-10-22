import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Verificando credenciais do Mercado Pago...');
    
    // Verificar se as variáveis de ambiente estão configuradas
    const envCheck = {
      MP_ACCESS_TOKEN: !!process.env.MP_ACCESS_TOKEN,
      MP_PUBLIC_KEY: !!process.env.MP_PUBLIC_KEY,
      MP_WEBHOOK_SECRET: !!process.env.MP_WEBHOOK_SECRET,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL
    };
    
    console.log('📊 Status das variáveis:', envCheck);
    
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'MP_ACCESS_TOKEN não configurado',
        environment: envCheck
      }, { status: 500 });
    }

    // Testar conexão com Mercado Pago
    console.log('🔄 Testando conexão com Mercado Pago...');
    
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
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
        environment: envCheck
      }, { status: 500 });
    }

    const userData = await response.json();
    console.log('✅ Conexão estabelecida com sucesso');
    console.log('👤 Dados do usuário:', {
      id: userData.id,
      nickname: userData.nickname,
      email: userData.email,
      country_id: userData.country_id
    });

    // Verificar se é conta de teste ou produção
    const isTestMode = process.env.MP_ACCESS_TOKEN.includes('TEST') || 
                      process.env.MP_ACCESS_TOKEN.includes('test');
    
    console.log('🧪 Modo de teste:', isTestMode);

    // Testar criação de preferência simples
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
      external_reference: `test-${Date.now()}`
    };

    const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
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
        user: {
          id: userData.id,
          nickname: userData.nickname,
          email: userData.email,
          country_id: userData.country_id
        }
      }, { status: 500 });
    }

    const preferenceResult = await preferenceResponse.json();
    console.log('✅ Preferência de teste criada:', preferenceResult.id);

    return NextResponse.json({
      success: true,
      message: 'Credenciais do Mercado Pago estão funcionando corretamente',
      environment: envCheck,
      user: {
        id: userData.id,
        nickname: userData.nickname,
        email: userData.email,
        country_id: userData.country_id
      },
      testMode: isTestMode,
      testPreference: {
        id: preferenceResult.id,
        init_point: preferenceResult.init_point
      }
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
