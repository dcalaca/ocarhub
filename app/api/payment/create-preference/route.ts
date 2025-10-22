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

    // Preparar dados da preferência
    const preferenceData = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        quantity: item.quantity || 1,
        unit_price: parseFloat(item.price),
        currency_id: MERCADOPAGO_CONFIG.CURRENCY
      })),
      payer: {
        name: payer.name,
        surname: payer.surname || '',
        email: payer.email,
        phone: payer.phone ? {
          area_code: payer.phone.area_code,
          number: payer.phone.number
        } : undefined,
        identification: payer.identification ? {
          type: payer.identification.type,
          number: payer.identification.number
        } : undefined,
        address: payer.address ? {
          street_name: payer.address.street_name,
          street_number: payer.address.street_number,
          zip_code: payer.address.zip_code
        } : undefined
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      external_reference: external_reference || `ocar-platform-${Date.now()}`,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      additional_info: {
        items: items.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          category_id: 'others',
          quantity: item.quantity || 1,
          unit_price: parseFloat(item.price)
        })),
        payer: {
          first_name: payer.name.split(' ')[0],
          last_name: payer.name.split(' ').slice(1).join(' ') || '',
          phone: payer.phone ? {
            area_code: payer.phone.area_code,
            number: payer.phone.number
          } : undefined,
          address: payer.address ? {
            zip_code: payer.address.zip_code,
            street_name: payer.address.street_name,
            street_number: payer.address.street_number
          } : undefined
        }
      }
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
