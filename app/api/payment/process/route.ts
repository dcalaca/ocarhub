import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      token,
      issuer_id,
      payment_method_id,
      transaction_amount,
      installments,
      payer,
      preferenceId
    } = body;

    console.log('🔄 Processando pagamento:', {
      token: token?.substring(0, 10) + '...',
      issuer_id,
      payment_method_id,
      transaction_amount,
      installments,
      preferenceId
    });

    // Criar pagamento no Mercado Pago
    const paymentData = {
      transaction_amount: transaction_amount,
      token: token,
      description: 'Pagamento via Checkout Bricks',
      installments: installments,
      payment_method_id: payment_method_id,
      issuer_id: issuer_id,
      payer: {
        email: payer.email,
        identification: {
          type: payer.identification.type,
          number: payer.identification.number
        }
      }
    };

    console.log('📤 Enviando para Mercado Pago:', paymentData);

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${preferenceId}-${Date.now()}`
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    console.log('📥 Resposta do Mercado Pago:', {
      status: response.status,
      id: result.id,
      status_detail: result.status_detail,
      status: result.status
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        payment: {
          id: result.id,
          status: result.status,
          status_detail: result.status_detail,
          transaction_amount: result.transaction_amount,
          date_approved: result.date_approved,
          payment_method_id: result.payment_method_id
        }
      });
    } else {
      console.error('❌ Erro do Mercado Pago:', result);
      return NextResponse.json({
        success: false,
        error: result.message || 'Erro no processamento do pagamento'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
