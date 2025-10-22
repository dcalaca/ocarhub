import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Iniciando fluxo OAuth para contas de teste...');
    
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
      has_secret: !!client_secret
    });

    // Preparar dados para requisição OAuth
    const oauthData = {
      client_secret,
      client_id,
      grant_type
    };

    // Adicionar parâmetros opcionais se fornecidos
    if (body.code) oauthData.code = body.code;
    if (body.code_verifier) oauthData.code_verifier = body.code_verifier;
    if (body.redirect_uri) oauthData.redirect_uri = body.redirect_uri;
    if (body.refresh_token) oauthData.refresh_token = body.refresh_token;
    if (body.test_token !== undefined) oauthData.test_token = body.test_token;

    console.log('🔄 Fazendo requisição OAuth...');

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(oauthData)
    });

    console.log('📡 Status da resposta OAuth:', response.status);

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
          '4. Consulte a documentação OAuth do Mercado Pago'
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
      details: error instanceof Error ? error.message : 'Erro desconhecido'
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
        grantTypes: [
          'authorization_code - Fluxo com redirecionamento',
          'refresh_token - Renovar token expirado',
          'client_credentials - Sem interação do usuário'
        ],
        requiredParams: [
          'client_secret - Chave privada da aplicação',
          'client_id - ID da aplicação',
          'grant_type - Tipo de operação'
        ],
        optionalParams: [
          'code - Código de autorização',
          'code_verifier - Verificador do código',
          'redirect_uri - URL de redirecionamento',
          'refresh_token - Token de renovação',
          'test_token - Se é token de teste'
        ]
      },
      examples: {
        clientCredentials: {
          client_secret: 'SEU_CLIENT_SECRET',
          client_id: 'SEU_CLIENT_ID',
          grant_type: 'client_credentials'
        },
        authorizationCode: {
          client_secret: 'SEU_CLIENT_SECRET',
          client_id: 'SEU_CLIENT_ID',
          grant_type: 'authorization_code',
          code: 'TG-XXXXXXXX-241983636',
          redirect_uri: 'https://seu-site.com/callback'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter informações OAuth:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno'
    }, { status: 500 });
  }
}
