'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState, useEffect } from 'react';

// Forçar renderização apenas no cliente
export default function CheckoutBricksPage() {
  const [isClient, setIsClient] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [CheckoutBricks, setCheckoutBricks] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Carregar componente apenas no cliente
    const loadComponent = async () => {
      try {
        const module = await import('@/components/checkout/CheckoutBricks');
        if (module.default) {
          setCheckoutBricks(() => module.default);
        } else {
          console.error('❌ Componente CheckoutBricks não encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar CheckoutBricks:', error);
      }
    };

    // Aguardar um pouco antes de carregar para garantir que está no cliente
    setTimeout(loadComponent, 100);
  }, []);

  // Dados de exemplo
  const exampleItems = [
    {
      id: 'plano-premium',
      title: 'Plano Premium Ocarhub',
      description: 'Acesso completo à plataforma',
      price: 59.90,
      quantity: 1,
      category_id: 'services'
    },
  ];

  const examplePayer = {
    name: 'Cliente Teste',
    email: 'cliente_teste@example.com',
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentSuccess(true);
    setPaymentId(paymentId);
    console.log('✅ Pagamento realizado com sucesso:', paymentId);
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Erro no pagamento:', error);
  };

  // Não renderizar nada durante SSR
  if (!isClient || !CheckoutBricks) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando formulário de pagamento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                ✅ Pagamento Aprovado!
              </h2>
              <p className="text-gray-600 mb-4">
                Seu pagamento foi processado com sucesso.
              </p>
              {paymentId && (
                <p className="text-sm text-gray-500 font-mono bg-gray-100 p-2 rounded">
                  ID: {paymentId}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voltar ao Início
              </button>
              
              <button
                onClick={() => {
                  setPaymentSuccess(false);
                  setPaymentId(null);
                }}
                className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fazer Novo Pagamento
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🚀 Checkout Bricks - Mercado Pago
            </h1>
            <p className="text-lg text-gray-600">
              Experiência de pagamento integrada no seu site
            </p>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              ✨ Vantagens do Checkout Bricks
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-blue-800">
              <div>
                <h3 className="font-semibold mb-2">🎯 Experiência do Usuário:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Formulário integrado no site</li>
                  <li>• Usuário não sai da página</li>
                  <li>• Design personalizado</li>
                  <li>• Maior conversão</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔧 Funcionalidades:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Cartão de crédito/débito</li>
                  <li>• PIX instantâneo</li>
                  <li>• Boleto bancário</li>
                  <li>• Carteira digital</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Checkout Bricks */}
          <CheckoutBricks
            items={exampleItems}
            payer={examplePayer}
            external_reference={`bricks-demo-${Date.now()}`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />

          {/* Instruções */}
          <div className="mt-8 bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Como Testar
            </h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Cartão de Teste:</strong> 4009 1753 3280 6176</p>
              <p><strong>CVV:</strong> 123</p>
              <p><strong>Vencimento:</strong> 11/25</p>
              <p><strong>Nome:</strong> APRO</p>
            </div>
          </div>
        </div>
      </div>
  );
}