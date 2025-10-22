import { NextRequest, NextResponse } from 'next/server';
import { preference, MERCADOPAGO_CONFIG } from '@/lib/mercadopago';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando criação de preferência...');
    
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error('❌ MP_ACCESS_TOKEN não configurado');
      return NextResponse.json(
        { error: 'Configuração do Mercado Pago não encontrada' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('📊 Dados recebidos:', { 
      itemsCount: body.items?.length, 
      payerEmail: body.payer?.email,
      externalReference: body.external_reference 
    });

    const { items, payer, external_reference } = body;

    // Validar dados obrigatórios
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ Items são obrigatórios');
      return NextResponse.json(
        { error: 'Items são obrigatórios' },
        { status: 400 }
      );
    }

    if (!payer || !payer.name || !payer.email) {
      console.error('❌ Dados do pagador são obrigatórios');
      return NextResponse.json(
        { error: 'Dados do pagador são obrigatórios' },
        { status: 400 }
      );
    }

    // Preparar dados da preferência (versão simplificada)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ocarhub.vercel.app';
    
    const preferenceData = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        quantity: item.quantity || 1,
        unit_price: parseFloat(item.price),
        currency_id: 'BRL',
        category_id: item.category_id || 'others' // Melhora índice de aprovação
      })),
      payer: {
        name: payer.name,
        email: payer.email
      },
      back_urls: {
        success: `${baseUrl}/payment/success`,
        failure: `${baseUrl}/payment/failure`,
        pending: `${baseUrl}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: external_reference || `ocar-platform-${Date.now()}`
    };

    // Criar preferência
    console.log('🔄 Criando preferência no Mercado Pago...');
    console.log('📋 Dados da preferência:', JSON.stringify(preferenceData, null, 2));
    
    const response = await preference.create({ body: preferenceData });

    console.log('✅ Preferência criada:', response.id);
    console.log('🔗 URL de checkout:', response.init_point);

    return NextResponse.json({
      success: true,
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      external_reference: preferenceData.external_reference
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('❌ Mensagem de erro:', error.message);
      console.error('❌ Stack trace:', error.stack);
    }
    
    // Verificar se é erro do Mercado Pago
    if (error && typeof error === 'object' && 'response' in error) {
      const mpError = error as any;
      console.error('❌ Erro do Mercado Pago:', mpError.response?.data);
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Método GET para buscar preferência existente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preferenceId = searchParams.get('id');

    if (!preferenceId) {
      return NextResponse.json(
        { error: 'ID da preferência é obrigatório' },
        { status: 400 }
      );
    }

    const response = await preference.get({ id: preferenceId });

    return NextResponse.json({
      success: true,
      preference: response
    });

  } catch (error) {
    console.error('❌ Erro ao buscar preferência:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar preferência',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
