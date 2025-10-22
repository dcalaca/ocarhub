import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Iniciando fluxo OAuth corrigido...');
    
    const body = await request.json();
    const { client_id, client_secret, grant_type = 'client_credentials' } = body;

    // Validar parâmetros obrigatórios
    if (!client_id || !client_secret) {
      return NextResponse.json({
        success: false,
        error: 'client_id e client_secret são obrigatórios'
      }, { status: 400 });
    }

    console.log('📋 Parâmetros OAuth:', {
      client_id: client_id.substring(0, 10) + '...',
      grant_type,
      has_secret: !!client_secret,
      secret_length: client_secret.length
    });

    // Preparar dados para requisição OAuth (formato correto)
    const oauthData = new URLSearchParams();
    oauthData.append('client_secret', client_secret);
    oauthData.append('client_id', client_id);
    oauthData.append('grant_type', grant_type);

    console.log('🔄 Fazendo requisição OAuth com form-data...');

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: oauthData.toString()
    });

    console.log('📡 Status da resposta OAuth:', response.status);
    console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro OAuth:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Erro na autenticação OAuth',
        details: errorText,
        status: response.status,
        troubleshooting: [
          '1. Verifique se client_id e client_secret estão corretos',
          '2. Confirme se são credenciais de teste',
          '3. Verifique se a aplicação está ativa',
          '4. Use o Access Token como client_secret',
          '5. Use o número da aplicação como client_id'
        ]
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('✅ Token OAuth obtido com sucesso');

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
      instructions: [
        '1. Use o access_token para fazer requisições autenticadas',
        '2. O token expira em ' + (result.expires_in / 3600) + ' horas',
        '3. Use refresh_token para renovar quando necessário',
        '4. Configure as credenciais na sua aplicação'
      ]
    });

  } catch (error) {
    console.error('❌ Erro no fluxo OAuth:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno no fluxo OAuth',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// Método GET para obter informações sobre OAuth
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Informações sobre OAuth do Mercado Pago',
      oauthInfo: {
        endpoint: 'https://api.mercadopago.com/oauth/token',
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        grantTypes: [
          'authorization_code - Fluxo com redirecionamento',
          'refresh_token - Renovar token expirado',
          'client_credentials - Sem interação do usuário'
        ],
        requiredParams: [
          'client_secret - Access Token da aplicação',
          'client_id - Número da aplicação',
          'grant_type - Tipo de operação'
        ]
      },
      examples: {
        clientCredentials: {
          client_secret: 'APP_USR-4645131775783967-102121-662cfe8408046307b825a79edd594a15-2939896816',
          client_id: '8224799763305887',
          grant_type: 'client_credentials'
        }
      },
      troubleshooting: [
        '❓ Use o Access Token como client_secret',
        '❓ Use o número da aplicação como client_id',
        '❓ Certifique-se de usar credenciais de teste',
        '❓ Verifique se a aplicação está ativa'
      ]
    });

  } catch (error) {
    console.error('❌ Erro ao obter informações OAuth:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno'
    }, { status: 500 });
  }
}
