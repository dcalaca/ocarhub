import { preference, payment, MERCADOPAGO_CONFIG } from './lib/mercadopago';

// Exemplo de criação de preferência de pagamento
export async function createPaymentPreference(items: any[], payer: any) {
  try {
    const preferenceData = {
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: MERCADOPAGO_CONFIG.CURRENCY
      })),
      payer: {
        name: payer.name,
        email: payer.email,
        phone: payer.phone ? {
          area_code: payer.phone.area_code,
          number: payer.phone.number
        } : undefined
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      external_reference: payer.external_reference || 'ocar-platform'
    };

    const response = await preference.create({ body: preferenceData });
    
    console.log('✅ Preferência de pagamento criada:', response.id);
    return response;
  } catch (error) {
    console.error('❌ Erro ao criar preferência de pagamento:', error);
    throw error;
  }
}

// Exemplo de busca de pagamento por ID
export async function getPaymentById(paymentId: string) {
  try {
    const response = await payment.get({ id: paymentId });
    console.log('✅ Pagamento encontrado:', response.id);
    return response;
  } catch (error) {
    console.error('❌ Erro ao buscar pagamento:', error);
    throw error;
  }
}

// Exemplo de busca de pagamentos por referência externa
export async function getPaymentsByExternalReference(externalReference: string) {
  try {
    const response = await payment.search({
      options: {
        external_reference: externalReference
      }
    });
    
    console.log(`✅ Encontrados ${response.results.length} pagamentos para referência: ${externalReference}`);
    return response.results;
  } catch (error) {
    console.error('❌ Erro ao buscar pagamentos por referência:', error);
    throw error;
  }
}

// Exemplo de cancelamento de pagamento
export async function cancelPayment(paymentId: string) {
  try {
    const response = await payment.cancel({ id: paymentId });
    console.log('✅ Pagamento cancelado:', response.id);
    return response;
  } catch (error) {
    console.error('❌ Erro ao cancelar pagamento:', error);
    throw error;
  }
}

// Exemplo de reembolso de pagamento
export async function refundPayment(paymentId: string, amount?: number) {
  try {
    const refundData = amount ? { amount } : {};
    const response = await payment.refund({ 
      id: paymentId, 
      body: refundData 
    });
    
    console.log('✅ Reembolso processado:', response.id);
    return response;
  } catch (error) {
    console.error('❌ Erro ao processar reembolso:', error);
    throw error;
  }
}

// Exemplo de validação de webhook
export function validateWebhookSignature(body: string, signature: string): boolean {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', MERCADOPAGO_CONFIG.WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('❌ Erro ao validar assinatura do webhook:', error);
    return false;
  }
}

// Exemplo de uso completo
export async function exemploCompleto() {
  console.log('🚀 Exemplo completo de uso do SDK Mercado Pago\n');
  
  // Dados de exemplo
  const items = [
    {
      id: 'plano-basico',
      title: 'Plano Básico - Ocar Platform',
      quantity: 1,
      price: 29.90
    }
  ];
  
  const payer = {
    name: 'João Silva',
    email: 'joao@exemplo.com',
    phone: {
      area_code: '11',
      number: '999999999'
    },
    external_reference: 'user-123'
  };
  
  try {
    // 1. Criar preferência de pagamento
    console.log('1️⃣ Criando preferência de pagamento...');
    const preference = await createPaymentPreference(items, payer);
    console.log('🔗 URL de pagamento:', preference.init_point);
    
    // 2. Simular busca de pagamento (após pagamento)
    console.log('\n2️⃣ Buscando pagamento...');
    // const payment = await getPaymentById('123456789');
    
    // 3. Buscar pagamentos por referência
    console.log('\n3️⃣ Buscando pagamentos por referência...');
    const payments = await getPaymentsByExternalReference('user-123');
    
    console.log('\n✅ Exemplo concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no exemplo:', error);
  }
}

export default {
  createPaymentPreference,
  getPaymentById,
  getPaymentsByExternalReference,
  cancelPayment,
  refundPayment,
  validateWebhookSignature,
  exemploCompleto
};
