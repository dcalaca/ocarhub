import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Verificando configuração da assinatura secreta...');
    
    // Verificar se a variável está configurada
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;
    
    const secretCheck = {
      isConfigured: !!webhookSecret,
      length: webhookSecret?.length || 0,
      startsWith: webhookSecret?.substring(0, 8) || 'N/A',
      endsWith: webhookSecret?.substring(webhookSecret.length - 8) || 'N/A',
      isExpectedFormat: webhookSecret === '46df3fb5e3e8836fb14d5a9ae951e90f2a1dfa13cd58ad156cf432767e26a184',
      recommendations: []
    };

    if (!secretCheck.isConfigured) {
      secretCheck.recommendations.push('❌ MP_WEBHOOK_SECRET não está configurado');
    } else if (secretCheck.length !== 64) {
      secretCheck.recommendations.push('⚠️ Assinatura secreta deve ter 64 caracteres');
    } else if (secretCheck.isExpectedFormat) {
      secretCheck.recommendations.push('✅ Assinatura secreta configurada corretamente');
    } else {
      secretCheck.recommendations.push('⚠️ Assinatura secreta diferente da esperada');
    }

    // Verificar outras variáveis relacionadas
    const envCheck = {
      MP_ACCESS_TOKEN: !!process.env.MP_ACCESS_TOKEN,
      MP_PUBLIC_KEY: !!process.env.MP_PUBLIC_KEY,
      MP_WEBHOOK_SECRET: !!process.env.MP_WEBHOOK_SECRET,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL
    };

    // Testar validação de assinatura se estiver configurada
    let signatureTest = {
      canTest: false,
      result: null,
      error: null
    };

    if (webhookSecret) {
      try {
        // Importar função de validação
        const { validateWebhookSignature } = await import('@/lib/mercadopago');
        
        // Testar com dados de exemplo
        const testBody = '{"test": "data"}';
        const testSignature = 'sha256=' + require('crypto')
          .createHmac('sha256', webhookSecret)
          .update(testBody)
          .digest('hex');
        
        signatureTest.canTest = true;
        signatureTest.result = validateWebhookSignature(testBody, testSignature);
        
        console.log('🧪 Teste de validação:', signatureTest.result ? '✅ Sucesso' : '❌ Falha');
      } catch (error) {
        signatureTest.error = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ Erro no teste de assinatura:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Verificação da assinatura secreta',
      timestamp: new Date().toISOString(),
      secretCheck,
      envCheck,
      signatureTest,
      expectedSecret: '46df3fb5e3e8836fb14d5a9ae951e90f2a1dfa13cd58ad156cf432767e26a184',
      instructions: [
        '1. Configure MP_WEBHOOK_SECRET no arquivo .env.local',
        '2. Use exatamente: 46df3fb5e3e8836fb14d5a9ae951e90f2a1dfa13cd58ad156cf432767e26a184',
        '3. Reinicie o servidor após configurar',
        '4. Configure o webhook no painel do Mercado Pago'
      ]
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
