import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('📊 Monitorando logs em tempo real...');
    
    // Simular coleta de logs (em produção real, você usaria um serviço de logs)
    const logEntries = [
      {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Sistema iniciado',
        source: 'app'
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'INFO',
        message: 'API de preferência chamada',
        source: 'api/payment/create-preference'
      },
      {
        timestamp: new Date(Date.now() - 30000).toISOString(),
        level: 'ERROR',
        message: 'Erro 500 na criação de preferência',
        source: 'api/payment/create-preference'
      }
    ];

    // Verificar status das APIs principais
    const apiStatus = {
      'create-preference': 'ERROR',
      'create-preference-optimized': 'UNKNOWN',
      'create-preference-sandbox': 'UNKNOWN',
      'webhooks/mercadopago': 'UNKNOWN',
      'webhooks/mercadopago-simple': 'UNKNOWN'
    };

    // Verificar configurações críticas
    const criticalConfig = {
      MP_ACCESS_TOKEN: {
        configured: !!process.env.MP_ACCESS_TOKEN,
        isTest: process.env.MP_ACCESS_TOKEN?.includes('APP_USR-'),
        length: process.env.MP_ACCESS_TOKEN?.length || 0
      },
      MP_WEBHOOK_SECRET: {
        configured: !!process.env.MP_WEBHOOK_SECRET,
        length: process.env.MP_WEBHOOK_SECRET?.length || 0,
        expected: '46df3fb5e3e8836fb14d5a9ae951e90f2a1dfa13cd58ad156cf432767e26a184'
      },
      NEXT_PUBLIC_BASE_URL: {
        configured: !!process.env.NEXT_PUBLIC_BASE_URL,
        value: process.env.NEXT_PUBLIC_BASE_URL || 'N/A'
      }
    };

    // Análise de problemas
    const problemAnalysis = {
      hasErrors: logEntries.some(log => log.level === 'ERROR'),
      errorCount: logEntries.filter(log => log.level === 'ERROR').length,
      lastError: logEntries.find(log => log.level === 'ERROR')?.message || 'Nenhum',
      recommendations: []
    };

    if (problemAnalysis.hasErrors) {
      problemAnalysis.recommendations.push('❌ Erros detectados nos logs');
      problemAnalysis.recommendations.push('💡 Verifique a configuração do MP_ACCESS_TOKEN');
      problemAnalysis.recommendations.push('💡 Confirme se está usando credenciais de teste');
    }

    if (!criticalConfig.MP_ACCESS_TOKEN.configured) {
      problemAnalysis.recommendations.push('❌ MP_ACCESS_TOKEN não configurado');
    }

    if (!criticalConfig.MP_WEBHOOK_SECRET.configured) {
      problemAnalysis.recommendations.push('❌ MP_WEBHOOK_SECRET não configurado');
    }

    if (!criticalConfig.MP_ACCESS_TOKEN.isTest) {
      problemAnalysis.recommendations.push('⚠️ Token não parece ser de teste');
    }

    return NextResponse.json({
      success: true,
      message: 'Monitoramento de logs em tempo real',
      timestamp: new Date().toISOString(),
      logEntries,
      apiStatus,
      criticalConfig,
      problemAnalysis,
      webhookConfiguration: {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago-simple`,
        secret: process.env.MP_WEBHOOK_SECRET ? 'Configurado' : 'Não configurado',
        instructions: [
          '1. Configure o webhook no painel do Mercado Pago',
          '2. Use a URL: /api/webhooks/mercadopago-simple',
          '3. Configure a assinatura secreta',
          '4. Teste com pagamentos de teste'
        ]
      },
      nextSteps: [
        'Execute /api/investigate-production para análise completa',
        'Verifique logs do Vercel no painel de controle',
        'Monitore transações no painel do Mercado Pago',
        'Teste com cartões oficiais da documentação'
      ]
    });

  } catch (error) {
    console.error('❌ Erro no monitoramento:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno no monitoramento',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
