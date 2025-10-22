import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { valor, userId, descricao } = await request.json()

    // Validar dados obrigatórios
    if (!valor || !userId || !descricao) {
      return NextResponse.json(
        { error: 'Valor, userId e descricao são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar valor mínimo
    if (valor < 1) {
      return NextResponse.json(
        { error: 'Valor mínimo é R$ 1,00' },
        { status: 400 }
      )
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
    if (!MP_ACCESS_TOKEN) {
      console.error('❌ MP_ACCESS_TOKEN não configurado')
      return NextResponse.json(
        { error: 'Configuração de pagamento não disponível' },
        { status: 500 }
      )
    }

    // Criar preferência de pagamento
    const preferenceData = {
      items: [
        {
          id: `saldo_${userId}_${Date.now()}`,
          title: descricao,
          description: `Recarga de saldo - ${descricao}`,
          quantity: 1,
          unit_price: parseFloat(valor),
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ocarhub.com'}/conta?status=success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ocarhub.com'}/conta?status=failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ocarhub.com'}/conta?status=pending`
      },
      auto_return: 'approved',
      external_reference: `saldo_${userId}_${Date.now()}`,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ocarhub.com'}/api/webhook`,
      binary_mode: false, // Permitir pagamentos pendentes
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      payment_methods: {
        installments: 12, // Máximo de 12 parcelas
        default_installments: 1, // Parcela única por padrão
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments_default: 1
      },
      metadata: {
        userId: userId,
        tipo: 'recarga_saldo',
        valor: valor.toString()
      }
    }

    console.log('🚀 Criando preferência de pagamento:', {
      valor,
      userId,
      descricao,
      preferenceData: {
        ...preferenceData,
        items: preferenceData.items.map(item => ({ ...item, unit_price: item.unit_price }))
      }
    })

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `saldo_${userId}_${Date.now()}`
      },
      body: JSON.stringify(preferenceData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Erro ao criar preferência:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      return NextResponse.json(
        { error: 'Erro ao criar preferência de pagamento' },
        { status: 500 }
      )
    }

    const preference = await response.json()
    
    console.log('✅ Preferência criada com sucesso:', {
      id: preference.id,
      init_point: preference.init_point,
      external_reference: preference.external_reference
    })

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      externalReference: preference.external_reference
    })

  } catch (error) {
    console.error('❌ Erro na API createPreference:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
