'use client';

import { useState, useEffect } from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';
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

  // Inicializar Mercado Pago
  useEffect(() => {
    const initMP = async () => {
      try {
        const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
        if (!publicKey) {
          console.error('❌ NEXT_PUBLIC_MP_PUBLIC_KEY não configurado');
          return;
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
    try {
      const { Payment } = await import('@mercadopago/sdk-react');
      
      const payment = new Payment({
        container: brickContainer,
        initialization: {
          amount: items.reduce((total, item) => total + (item.price * item.quantity), 0),
          preferenceId: preferenceId,
        },
        callbacks: {
          onReady: () => {
            console.log('✅ Bricks pronto para uso');
            toast.success('Formulário de pagamento carregado');
          },
          onSubmit: async ({ selectedPaymentMethod, formData }) => {
            console.log('📝 Dados do formulário:', formData);
            console.log('💳 Método selecionado:', selectedPaymentMethod);
            
            // Aqui você pode processar os dados antes do pagamento
            return new Promise((resolve) => {
              resolve();
            });
          },
          onError: (error) => {
            console.error('❌ Erro no Bricks:', error);
            toast.error('Erro no pagamento');
            onError?.(error.message);
          },
        },
        customization: {
          visual: {
            style: {
              theme: 'default', // 'default' | 'dark' | 'bootstrap' | 'flat'
              customVariables: {
                colorPrimary: '#007bff',
                colorSecondary: '#6c757d',
                borderRadiusLarge: '8px',
                borderRadiusMedium: '6px',
                borderRadiusSmall: '4px',
              },
            },
            text: {
              color: '#000000',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: '400',
            },
            hideFormTitle: false,
            hidePaymentMethodHeader: false,
            hidePaymentMethodTitle: false,
            hideCardNumber: false,
            hideExpirationDate: false,
            hideSecurityCode: false,
            hideCardholderName: false,
            hideCardholderEmail: false,
            hideInstallments: false,
            hideIssuer: false,
            hidePix: false,
            hideTicket: false,
            hideBankTransfer: false,
            hideDigitalWallet: false,
            hideDigitalCurrency: false,
            hideCash: false,
            hideDebitCard: false,
            hideCreditCard: false,
            hidePrepaidCard: false,
            hidePaypal: false,
            hideMercadoPago: false,
            hideMercadoPagoWallet: false,
            hideMercadoPagoCredits: false,
            hideMercadoPagoDebit: false,
            hideMercadoPagoCredit: false,
            hideMercadoPagoPix: false,
            hideMercadoPagoTicket: false,
            hideMercadoPagoBankTransfer: false,
            hideMercadoPagoDigitalWallet: false,
            hideMercadoPagoDigitalCurrency: false,
            hideMercadoPagoCash: false,
            hideMercadoPagoDebitCard: false,
            hideMercadoPagoCreditCard: false,
            hideMercadoPagoPrepaidCard: false,
            hideMercadoPagoPaypal: false,
          },
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
      });

      console.log('🎯 Bricks Payment inicializado');

    } catch (error) {
      console.error('❌ Erro ao inicializar Bricks:', error);
      toast.error('Erro ao carregar formulário de pagamento');
    }
  };

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
