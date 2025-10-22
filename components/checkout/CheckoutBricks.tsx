'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

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
  const [isClient, setIsClient] = useState(false);
  const [isSDKReady, setIsSDKReady] = useState(false);

  // Verificar se está no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Inicializar Mercado Pago (apenas uma vez)
  useEffect(() => {
    if (!isClient) return;

    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (!publicKey) {
      console.error('❌ NEXT_PUBLIC_MP_PUBLIC_KEY não configurado');
      return;
    }

    console.log('🔧 Inicializando Mercado Pago SDK...');
    initMercadoPago(publicKey, {
      locale: 'pt-BR'
    });
    console.log('✅ Mercado Pago SDK inicializado');
    setIsSDKReady(true);
  }, [isClient]);

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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao criar preferência:', error);
      toast.error(`Erro: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Configurações do Payment Brick
  const paymentSettings = {
    initialization: {
      preferenceId: preferenceId || '',
      redirectMode: 'modal' as const
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

      {/* Payment Brick Component */}
      {preferenceId && isSDKReady && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Formulário de Pagamento
          </h3>

          <Payment
            initialization={paymentSettings.initialization}
            customization={paymentSettings.customization}
            onSubmit={paymentSettings.callbacks.onSubmit}
            onReady={paymentSettings.callbacks.onReady}
            onError={paymentSettings.callbacks.onError}
          />
        </div>
      )}
    </div>
  );
}
