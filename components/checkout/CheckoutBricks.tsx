'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CheckoutBricksProps {
  items: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    quantity: number;
    category_id?: string;
  }>;
  payer: {
    name: string;
    email: string;
  };
  external_reference?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export default function CheckoutBricks({ 
  items, 
  payer, 
  external_reference,
  onSuccess,
  onError 
}: CheckoutBricksProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [brickContainer, setBrickContainer] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // Verificar se está no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Inicializar Mercado Pago
  useEffect(() => {
    const initMP = async () => {
      try {
        const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
        if (!publicKey) {
          console.error('❌ NEXT_PUBLIC_MP_PUBLIC_KEY não configurado');
          return;
        }

        // Importar dinamicamente para evitar problemas de SSR
        const MercadoPagoSDK = await import('@mercadopago/sdk-react');
        const { initMercadoPago } = MercadoPagoSDK;
        
        if (!initMercadoPago) {
          throw new Error('initMercadoPago não encontrado no SDK');
        }
        
        await initMercadoPago(publicKey, {
          locale: 'pt-BR'
        });
        console.log('✅ Mercado Pago SDK inicializado');
      } catch (error) {
        console.error('❌ Erro ao inicializar Mercado Pago:', error);
        toast.error('Erro ao inicializar pagamento');
      }
    };

    // Só inicializar no cliente
    if (typeof window !== 'undefined') {
      initMP();
    }
  }, []);

  // Criar preferência
  const createPreference = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Criando preferência para Bricks...');
      
      const response = await fetch('/api/payment/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          payer,
          external_reference: external_reference || `bricks-${Date.now()}`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar preferência');
      }

      setPreferenceId(data.preference_id);
      console.log('✅ Preferência criada:', data.preference_id);
      
      // Inicializar Bricks
      await initializeBricks(data.preference_id);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao criar preferência:', error);
      toast.error(`Erro: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar Bricks
  const initializeBricks = async (preferenceId: string) => {
    // Só inicializar no cliente
    if (typeof window === 'undefined') {
      console.log('⚠️ Tentativa de inicializar Bricks no servidor, ignorando...');
      return;
    }

    try {
      console.log('🔍 Iniciando inicialização do Payment Brick...');
      
      // Importar o SDK completo do Mercado Pago
      const MercadoPagoSDK = await import('@mercadopago/sdk-react');
      console.log('📦 SDK importado:', Object.keys(MercadoPagoSDK));
      
      // Verificar se initMercadoPago está disponível
      if (!MercadoPagoSDK.initMercadoPago) {
        console.error('❌ initMercadoPago não encontrado no SDK:', MercadoPagoSDK);
        throw new Error('initMercadoPago não encontrado no SDK');
      }
      
      const { initMercadoPago } = MercadoPagoSDK;
      console.log('✅ initMercadoPago encontrado:', typeof initMercadoPago);
      
      // Inicializar Mercado Pago
      const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('NEXT_PUBLIC_MP_PUBLIC_KEY não configurado');
      }
      
      // Inicializar Mercado Pago
      await initMercadoPago(publicKey, {
        locale: 'pt-BR'
      });
      
      console.log('✅ Mercado Pago inicializado');
      
      // Aguardar um pouco para garantir que o SDK foi carregado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tentar diferentes abordagens para encontrar o objeto MercadoPago
      let mp = null;
      
      // Tentativa 1: Verificar se initMercadoPago retornou algo
      const initResult = await initMercadoPago(publicKey, { locale: 'pt-BR' });
      console.log('🔍 Resultado do initMercadoPago:', initResult);
      
      if (initResult && typeof initResult.bricks === 'function') {
        mp = initResult;
        console.log('✅ MercadoPago encontrado via retorno de initMercadoPago');
      }
      
      // Tentativa 2: Verificar window.MercadoPago
      if (!mp && typeof window !== 'undefined' && (window as any).MercadoPago) {
        mp = new (window as any).MercadoPago(publicKey);
        console.log('✅ MercadoPago encontrado via window.MercadoPago');
      }
      
      // Tentativa 3: Verificar se existe um objeto global
      if (!mp && typeof window !== 'undefined') {
        const globalKeys = Object.keys(window).filter(k => k.toLowerCase().includes('mercado'));
        console.log('🔍 Chaves globais relacionadas ao MercadoPago:', globalKeys);
        
        for (const key of globalKeys) {
          const obj = (window as any)[key];
          if (obj && typeof obj.bricks === 'function') {
            mp = obj;
            console.log(`✅ MercadoPago encontrado via ${key}`);
            break;
          }
        }
      }
      
      if (!mp) {
        console.error('❌ MercadoPago não encontrado em nenhuma abordagem');
        console.log('🔍 window object keys:', typeof window !== 'undefined' ? Object.keys(window).slice(0, 20) : 'window undefined');
        throw new Error('MercadoPago não encontrado');
      }
      
      const bricksBuilder = mp.bricks();
      console.log('✅ BricksBuilder criado:', bricksBuilder);
      
      // Continuar com a criação do Brick
      await createPaymentBrick(bricksBuilder, preferenceId);

    } catch (error) {
      console.error('❌ Erro ao inicializar Payment Brick:', error);
      toast.error('Erro ao carregar formulário de pagamento');
    }
  };

  // Função separada para criar o Payment Brick
  const createPaymentBrick = async (bricksBuilder: any, preferenceId: string) => {
    // Configurações do Payment Brick
    const settings = {
      initialization: {
        amount: items.reduce((total, item) => total + (item.price * item.quantity), 0),
        preferenceId: preferenceId,
      },
      callbacks: {
        onReady: () => {
          console.log('✅ Payment Brick pronto para uso');
          toast.success('Formulário de pagamento carregado');
        },
        onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
          console.log('📝 Dados do formulário:', formData);
          console.log('💳 Método selecionado:', selectedPaymentMethod);
          
          // Aqui você pode processar os dados antes do pagamento
          return new Promise((resolve) => {
            resolve();
          });
        },
        onError: (error: any) => {
          console.error('❌ Erro no Payment Brick:', error);
          toast.error('Erro no pagamento');
          onError?.(error.message);
        },
      },
      customization: {
        paymentMethods: {
          ticket: 'all',
          bankTransfer: 'all',
          creditCard: 'all',
          debitCard: 'all',
          mercadoPago: 'all',
          digitalWallet: 'all',
          digitalCurrency: 'all',
          cash: 'all',
          paypal: 'all',
        },
      },
    };

    // Criar o Payment Brick
    const paymentBrickController = await bricksBuilder.create(
      'payment',
      brickContainer,
      settings
    );

    console.log('🎯 Payment Brick criado:', paymentBrickController);
  };

  // Não renderizar nada durante SSR
  if (!isClient) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando componente de pagamento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Resumo do Pedido */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumo do Pedido
        </h3>
        
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-green-600">
              R$ {items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Botão para Iniciar Pagamento */}
      {!preferenceId && (
        <div className="text-center">
          <button
            onClick={createPreference}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Carregando...' : 'Continuar para Pagamento'}
          </button>
        </div>
      )}

      {/* Container do Bricks */}
      {preferenceId && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Formulário de Pagamento
          </h3>
          
          <div 
            id={brickContainer}
            className="min-h-[400px]"
            ref={(el) => {
              if (el && !brickContainer) {
                setBrickContainer(`brick-container-${Date.now()}`);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
