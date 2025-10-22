import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

// Instâncias dos serviços
export const preference = new Preference(client);
export const payment = new Payment(client);

// Configurações de teste do Mercado Pago
export const MERCADOPAGO_CONFIG = {
  // Credenciais de teste (já configuradas no env.local.example)
  ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN!,
  PUBLIC_KEY: process.env.MP_PUBLIC_KEY!,
  WEBHOOK_SECRET: process.env.MP_WEBHOOK_SECRET!,
  
  // URLs de teste
  BASE_URL: 'https://api.mercadopago.com',
  SANDBOX_URL: 'https://api.mercadopago.com',
  
  // Configurações de ambiente
  IS_TEST_MODE: true,
  
  // Configurações de pagamento
  CURRENCY: 'BRL',
  COUNTRY: 'BR',
  
  // Configurações de webhook
  WEBHOOK_EVENTS: [
    'payment',
    'payment.created',
    'payment.updated',
    'payment.approved',
    'payment.rejected',
    'payment.cancelled',
    'payment.refunded'
  ]
};

// Função para verificar se as credenciais estão configuradas
export function validateMercadoPagoConfig(): boolean {
  const requiredVars = [
    'MP_ACCESS_TOKEN',
    'MP_PUBLIC_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente do Mercado Pago não configuradas:', missingVars);
    return false;
  }
  
  console.log('✅ Configuração do Mercado Pago validada com sucesso');
  return true;
}

// Função para testar a conexão com o Mercado Pago
export async function testMercadoPagoConnection(): Promise<boolean> {
  try {
    if (!validateMercadoPagoConfig()) {
      return false;
    }
    
    // Teste simples: buscar informações do usuário
    const response = await fetch(`${MERCADOPAGO_CONFIG.BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_CONFIG.ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Conexão com Mercado Pago estabelecida com sucesso');
      console.log('📊 Dados do usuário:', {
        id: userData.id,
        nickname: userData.nickname,
        email: userData.email,
        country_id: userData.country_id
      });
      return true;
    } else {
      console.error('❌ Erro ao conectar com Mercado Pago:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar conexão com Mercado Pago:', error);
    return false;
  }
}

export default {
  preference,
  payment,
  MERCADOPAGO_CONFIG,
  validateMercadoPagoConfig,
  testMercadoPagoConnection
};
