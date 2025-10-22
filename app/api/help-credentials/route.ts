import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Ajudando a encontrar credenciais de teste...');
    
    return NextResponse.json({
      success: true,
      message: 'Guia para encontrar suas credenciais de teste',
      instructions: {
        step1: {
          title: 'Acesse o Painel do Mercado Pago',
          description: 'Vá para https://www.mercadopago.com.br/developers',
          action: 'Faça login com sua conta do Mercado Pago'
        },
        step2: {
          title: 'Acesse Suas Integrações',
          description: 'No menu lateral, clique em "Suas integrações"',
          action: 'Você verá suas aplicações cadastradas'
        },
        step3: {
          title: 'Selecione sua Aplicação',
          description: 'Clique na aplicação que você quer usar para teste',
          action: 'Se não tiver nenhuma, crie uma nova aplicação'
        },
        step4: {
          title: 'Copie as Credenciais',
          description: 'Na aba "Credenciais", você encontrará:',
          credentials: {
            client_id: 'Seu Client ID (começa com números)',
            client_secret: 'Seu Client Secret (chave longa)'
          }
        },
        step5: {
          title: 'Use Credenciais de Teste',
          description: 'Certifique-se de usar as credenciais de TESTE',
          action: 'Não use as credenciais de produção'
        }
      },
      troubleshooting: [
        '❓ Não tem aplicação? Crie uma nova em "Suas integrações"',
        '❓ Não vê as credenciais? Verifique se está na aba correta',
        '❓ Credenciais não funcionam? Use as de TESTE, não produção',
        '❓ Ainda com erro? Verifique se a aplicação está ativa'
      ],
      exampleCredentials: {
        client_id: '1234567890123456',
        client_secret: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
      },
      nextSteps: [
        '1. Acesse o painel do Mercado Pago',
        '2. Vá em "Suas integrações"',
        '3. Selecione sua aplicação',
        '4. Copie Client ID e Client Secret de TESTE',
        '5. Cole na página de teste OAuth'
      ]
    });

  } catch (error) {
    console.error('❌ Erro no guia:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
