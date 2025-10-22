import { NextRequest, NextResponse } from 'next/server';
import { payment } from '@/lib/mercadopago';
import { createClient } from '@supabase/supabase-js';

// Configurar cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook recebido - processando sem validação de assinatura');
    
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    const type = request.headers.get('x-request-id');

    console.log('📊 Headers recebidos:', {
      hasSignature: !!signature,
      hasType: !!type,
      bodyLength: body.length,
      timestamp: new Date().toISOString()
    });

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
      id: data.data?.id,
      live_mode: data.live_mode,
      user_id: data.user_id
    });

    // Processar apenas notificações de pagamento
    if (data.type === 'payment') {
      await handlePaymentNotification(data);
    } else {
      console.log('ℹ️ Tipo de notificação não processado:', data.type);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processado com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
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
      amount: paymentData.transaction_amount,
      payment_method: paymentData.payment_method_id
    });

    // Preparar dados para salvar no banco
    const paymentRecord = {
      payment_id: paymentData.id,
      status: paymentData.status,
      external_reference: paymentData.external_reference,
      amount: paymentData.transaction_amount,
      payment_method: paymentData.payment_method_id,
      payment_type: paymentData.payment_type_id,
      date_approved: paymentData.date_approved,
      date_created: paymentData.date_created,
      payer_email: paymentData.payer?.email,
      payer_name: `${paymentData.payer?.first_name || ''} ${paymentData.payer?.last_name || ''}`.trim(),
      webhook_data: data,
      updated_at: new Date().toISOString()
    };

    // Salvar no banco de dados
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

    console.log('✅ Pagamento salvo no banco:', paymentData.id);

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
    console.log(`🔄 Processando status do pagamento ${id}: ${status}`);

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
    // Ativar plano do usuário se houver external_reference
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

  } catch (error) {
    console.error('❌ Erro ao processar pagamento aprovado:', error);
  }
}

// Pagamento rejeitado
async function handleRejectedPayment(paymentData: any) {
  const { id, external_reference } = paymentData;
  
  console.log('❌ Pagamento rejeitado:', id);
  // Implementar lógica de rejeição se necessário
}

// Pagamento cancelado
async function handleCancelledPayment(paymentData: any) {
  const { id, external_reference } = paymentData;
  
  console.log('🚫 Pagamento cancelado:', id);
  // Implementar lógica de cancelamento se necessário
}

// Pagamento reembolsado
async function handleRefundedPayment(paymentData: any) {
  const { id, external_reference } = paymentData;
  
  console.log('💰 Pagamento reembolsado:', id);
  // Implementar lógica de reembolso se necessário
}

// Pagamento pendente
async function handlePendingPayment(paymentData: any) {
  const { id, external_reference } = paymentData;
  
  console.log('⏳ Pagamento pendente:', id);
  // Implementar lógica de pendência se necessário
}

// Método GET para teste
export async function GET() {
  return NextResponse.json({
    message: 'Webhook do Mercado Pago está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    status: 'active'
  });
}
