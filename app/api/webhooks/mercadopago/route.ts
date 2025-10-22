import { NextRequest, NextResponse } from 'next/server';
import { payment, validateWebhookSignature } from '@/lib/mercadopago';
import { createClient } from '@supabase/supabase-js';

// Configurar cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    const type = request.headers.get('x-request-id');

    console.log('🔔 Webhook recebido:', { type, signature: signature?.substring(0, 20) + '...' });

    // Validar assinatura do webhook (opcional, mas recomendado)
    if (process.env.MP_WEBHOOK_SECRET && signature) {
      const isValid = validateWebhookSignature(body, signature);
      if (!isValid) {
        console.error('❌ Assinatura do webhook inválida');
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
      }
    }

    // Parse do body
    let data;
    try {
      data = JSON.parse(body);
    } catch (error) {
      console.error('❌ Erro ao fazer parse do body:', error);
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }

    console.log('📊 Dados do webhook:', {
      type: data.type,
      action: data.action,
      id: data.data?.id
    });

    // Processar diferentes tipos de notificação
    switch (data.type) {
      case 'payment':
        await handlePaymentNotification(data);
        break;
      
      case 'plan':
        await handlePlanNotification(data);
        break;
      
      case 'subscription':
        await handleSubscriptionNotification(data);
        break;
      
      default:
        console.log('ℹ️ Tipo de notificação não processado:', data.type);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para processar notificações de pagamento
async function handlePaymentNotification(data: any) {
  try {
    const paymentId = data.data?.id;
    if (!paymentId) {
      console.error('❌ ID do pagamento não encontrado');
      return;
    }

    console.log('💳 Processando pagamento:', paymentId);

    // Buscar dados do pagamento no Mercado Pago
    const paymentData = await payment.get({ id: paymentId });
    
    console.log('📊 Dados do pagamento:', {
      id: paymentData.id,
      status: paymentData.status,
      external_reference: paymentData.external_reference,
      amount: paymentData.transaction_amount
    });

    // Extrair informações importantes
    const {
      id,
      status,
      external_reference,
      transaction_amount,
      payment_method_id,
      payment_type_id,
      date_approved,
      date_created,
      payer,
      metadata
    } = paymentData;

    // Preparar dados para salvar no banco
    const paymentRecord = {
      payment_id: id,
      status: status,
      external_reference: external_reference,
      amount: transaction_amount,
      payment_method: payment_method_id,
      payment_type: payment_type_id,
      date_approved: date_approved,
      date_created: date_created,
      payer_email: payer?.email,
      payer_name: payer?.first_name + ' ' + payer?.last_name,
      metadata: metadata,
      webhook_data: data,
      updated_at: new Date().toISOString()
    };

    // Salvar ou atualizar no banco de dados
    const { error: upsertError } = await supabase
      .from('payments')
      .upsert(paymentRecord, { 
        onConflict: 'payment_id',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('❌ Erro ao salvar pagamento no banco:', upsertError);
      return;
    }

    console.log('✅ Pagamento salvo no banco:', id);

    // Processar ações baseadas no status
    await processPaymentStatus(paymentData);

  } catch (error) {
    console.error('❌ Erro ao processar notificação de pagamento:', error);
  }
}

// Função para processar status do pagamento
async function processPaymentStatus(paymentData: any) {
  const { id, status, external_reference, transaction_amount } = paymentData;

  try {
    switch (status) {
      case 'approved':
        await handleApprovedPayment(paymentData);
        break;
      
      case 'rejected':
        await handleRejectedPayment(paymentData);
        break;
      
      case 'cancelled':
        await handleCancelledPayment(paymentData);
        break;
      
      case 'refunded':
        await handleRefundedPayment(paymentData);
        break;
      
      case 'pending':
        await handlePendingPayment(paymentData);
        break;
      
      default:
        console.log('ℹ️ Status não processado:', status);
    }
  } catch (error) {
    console.error('❌ Erro ao processar status do pagamento:', error);
  }
}

// Pagamento aprovado
async function handleApprovedPayment(paymentData: any) {
  const { id, external_reference, transaction_amount } = paymentData;
  
  console.log('✅ Pagamento aprovado:', id);

  try {
    // Ativar plano do usuário
    if (external_reference) {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          plano_ativo: true,
          data_ativacao: new Date().toISOString(),
          saldo: transaction_amount
        })
        .eq('external_reference', external_reference);

      if (updateError) {
        console.error('❌ Erro ao ativar plano:', updateError);
      } else {
        console.log('✅ Plano ativado para usuário:', external_reference);
      }
    }

    // Enviar email de confirmação (implementar conforme necessário)
    // await sendPaymentConfirmationEmail(paymentData);

  } catch (error) {
    console.error('❌ Erro ao processar pagamento aprovado:', error);
  }
}

// Pagamento rejeitado
async function handleRejectedPayment(paymentData: any) {
  const { id, external_reference } = paymentData;
  
  console.log('❌ Pagamento rejeitado:', id);

  try {
    // Registrar rejeição
    const { error: insertError } = await supabase
      .from('payment_rejections')
      .insert({
        payment_id: id,
        external_reference: external_reference,
        reason: paymentData.status_detail,
        rejected_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Erro ao registrar rejeição:', insertError);
    }

    // Enviar email de notificação (implementar conforme necessário)
    // await sendPaymentRejectionEmail(paymentData);

  } catch (error) {
    console.error('❌ Erro ao processar pagamento rejeitado:', error);
  }
}

// Pagamento cancelado
async function handleCancelledPayment(paymentData: any) {
  const { id, external_reference } = paymentData;
  
  console.log('🚫 Pagamento cancelado:', id);

  try {
    // Registrar cancelamento
    const { error: insertError } = await supabase
      .from('payment_cancellations')
      .insert({
        payment_id: id,
        external_reference: external_reference,
        cancelled_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Erro ao registrar cancelamento:', insertError);
    }

  } catch (error) {
    console.error('❌ Erro ao processar pagamento cancelado:', error);
  }
}

// Pagamento reembolsado
async function handleRefundedPayment(paymentData: any) {
  const { id, external_reference } = paymentData;
  
  console.log('💰 Pagamento reembolsado:', id);

  try {
    // Desativar plano do usuário
    if (external_reference) {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          plano_ativo: false,
          data_desativacao: new Date().toISOString()
        })
        .eq('external_reference', external_reference);

      if (updateError) {
        console.error('❌ Erro ao desativar plano:', updateError);
      } else {
        console.log('✅ Plano desativado para usuário:', external_reference);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao processar pagamento reembolsado:', error);
  }
}

// Pagamento pendente
async function handlePendingPayment(paymentData: any) {
  const { id, external_reference } = paymentData;
  
  console.log('⏳ Pagamento pendente:', id);

  try {
    // Registrar como pendente
    const { error: insertError } = await supabase
      .from('payment_pending')
      .insert({
        payment_id: id,
        external_reference: external_reference,
        pending_since: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Erro ao registrar pendência:', insertError);
    }

  } catch (error) {
    console.error('❌ Erro ao processar pagamento pendente:', error);
  }
}

// Função para processar notificações de plano (se aplicável)
async function handlePlanNotification(data: any) {
  console.log('📋 Notificação de plano:', data);
  // Implementar conforme necessário
}

// Função para processar notificações de assinatura (se aplicável)
async function handleSubscriptionNotification(data: any) {
  console.log('🔄 Notificação de assinatura:', data);
  // Implementar conforme necessário
}

// Método GET para teste
export async function GET() {
  return NextResponse.json({
    message: 'Webhook do Mercado Pago está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}
