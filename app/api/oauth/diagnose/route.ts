import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Diagnóstico completo do OAuth...');
    
    const body = await request.json();
    const { client_id, client_secret, grant_type = 'client_credentials' } = body;

    // Log detalhado dos parâmetros
    console.log('📋 Parâmetros recebidos:', {
      client_id: client_id?.substring(0, 10) + '...',
      client_id_length: client_id?.length,
      grant_type,
      has_secret: !!client_secret,
      secret_length: client_secret?.length,
      secret_prefix: client_secret?.substring(0, 10) + '...'
    });

    // Validar parâmetros obrigatórios
    if (!client_id || !client_secret) {
      console.error('❌ Parâmetros obrigatórios ausentes');
      return NextResponse.json({
        success: false,
        error: 'client_id e client_secret são obrigatórios',
        received: {
          client_id: !!client_id,
          client_secret: !!client_secret
        }
      }, { status: 400 });
    }

    // Teste 1: Verificar formato das credenciais
    const credentialCheck = {
      client_id_valid: /^\d+$/.test(client_id),
      client_secret_valid: client_secret.length >= 20, // Client Secret em produção tem formato diferente
      client_id_length: client_id.length,
      client_secret_length: client_secret.length
    };

    console.log('🔍 Verificação de credenciais:', credentialCheck);

    if (!credentialCheck.client_id_valid) {
      return NextResponse.json({
        success: false,
        error: 'Client ID deve conter apenas números',
        details: `Recebido: ${client_id}`,
        expected: 'Número da aplicação (ex: 8224799763305887)'
      }, { status: 400 });
    }

    if (!credentialCheck.client_secret_valid) {
      return NextResponse.json({
        success: false,
        error: 'Client Secret deve ter pelo menos 20 caracteres',
        details: `Recebido: ${client_secret.substring(0, 20)}...`,
        expected: 'Client Secret da aplicação (formato varia entre sandbox e produção)'
      }, { status: 400 });
    }

    // Teste 2: Preparar dados OAuth
    console.log('🔄 Preparando dados OAuth...');
    
    const oauthData = new URLSearchParams();
    oauthData.append('client_secret', client_secret);
    oauthData.append('client_id', client_id);
    oauthData.append('grant_type', grant_type);
    oauthData.append('test_token', 'true'); // Importante para credenciais de teste

    console.log('📋 Dados OAuth preparados:', {
      client_secret_length: client_secret.length,
      client_id: client_id,
      grant_type,
      test_token: 'true',
      form_data_length: oauthData.toString().length
    });

    // Teste 3: Fazer requisição OAuth
    console.log('🌐 Fazendo requisição para Mercado Pago...');
    
    const startTime = Date.now();
    
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'OcarHub/1.0'
      },
      body: oauthData.toString()
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log('📡 Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      responseTime: responseTime + 'ms',
      headers: Object.fromEntries(response.headers.entries())
    });

    // Teste 4: Processar resposta
    const responseText = await response.text();
    console.log('📄 Conteúdo da resposta:', responseText.substring(0, 200) + '...');

    if (!response.ok) {
      console.error('❌ Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });

      let errorMessage = 'Erro na autenticação OAuth';
      let errorDetails = responseText;

      try {
        const errorJson = JSON.parse(responseText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
        if (errorJson.cause) {
          errorDetails = JSON.stringify(errorJson.cause);
        }
      } catch (parseError) {
        // Usar texto original se não conseguir fazer parse
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: errorDetails,
        status: response.status,
        statusText: response.statusText,
        responseTime: responseTime + 'ms',
        troubleshooting: [
          '1. Verifique se as credenciais estão corretas',
          '2. Confirme se são credenciais de produção',
          '3. Verifique se a aplicação está ativa',
          '4. Em produção: Client Secret tem formato diferente do Access Token',
          '5. Use o número da aplicação como client_id',
          '6. test_token=true foi adicionado para compatibilidade'
        ]
      }, { status: 500 });
    }

    // Sucesso
    const result = JSON.parse(responseText);
    console.log('✅ Token OAuth obtido com sucesso:', {
      access_token_length: result.access_token?.length,
      expires_in: result.expires_in,
      user_id: result.user_id,
      live_mode: result.live_mode
    });

    return NextResponse.json({
      success: true,
      message: 'Token OAuth criado com sucesso',
      token: {
        access_token: result.access_token,
        token_type: result.token_type,
        expires_in: result.expires_in,
        scope: result.scope,
        user_id: result.user_id,
        refresh_token: result.refresh_token,
        public_key: result.public_key,
        live_mode: result.live_mode
      },
      diagnostic: {
        credentialCheck,
        responseTime: responseTime + 'ms',
        status: response.status
      },
      instructions: [
        '1. Use o access_token para fazer requisições autenticadas',
        '2. O token expira em ' + (result.expires_in / 3600) + ' horas',
        '3. Use refresh_token para renovar quando necessário',
        '4. Configure as credenciais na sua aplicação'
      ]
    });

  } catch (error) {
    console.error('❌ Erro no diagnóstico OAuth:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno no diagnóstico OAuth',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      troubleshooting: [
        '1. Verifique se as credenciais estão corretas',
        '2. Confirme se são credenciais de teste',
        '3. Verifique se a aplicação está ativa',
        '4. Use o Access Token completo como client_secret',
        '5. Use o número da aplicação como client_id'
      ]
    }, { status: 500 });
  }
}
