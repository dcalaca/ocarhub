'use client';

import { useState } from 'react';
import { MercadoPagoCheckout } from '@/components/mercadopago-checkout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CreditCard, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Planos disponíveis
  const plans = [
    {
      id: 'plano-basico',
      title: 'Plano Básico',
      description: 'Ideal para começar',
      price: 29.90,
      features: ['Até 5 anúncios', 'Suporte por email', 'Relatórios básicos'],
      popular: false
    },
    {
      id: 'plano-premium',
      title: 'Plano Premium',
      description: 'Para quem quer mais',
      price: 59.90,
      features: ['Até 20 anúncios', 'Suporte prioritário', 'Relatórios avançados', 'API access'],
      popular: true
    },
    {
      id: 'plano-enterprise',
      title: 'Plano Enterprise',
      description: 'Para grandes empresas',
      price: 99.90,
      features: ['Anúncios ilimitados', 'Suporte 24/7', 'Relatórios customizados', 'API completa', 'Integração personalizada'],
      popular: false
    }
  ];

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  // Dados do pagador (pode vir de um formulário de cadastro)
  const payerData = {
    name: 'João Silva',
    email: 'joao@exemplo.com',
    phone: {
      area_code: '11',
      number: '999999999'
    }
  };

  const handlePaymentSuccess = (preferenceId: string) => {
    console.log('✅ Preferência criada:', preferenceId);
    // Aqui você pode redirecionar ou mostrar uma mensagem de sucesso
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Erro no pagamento:', error);
    // Aqui você pode mostrar uma mensagem de erro
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Escolha seu Plano</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Selecione o plano que melhor atende às suas necessidades e prossiga com o pagamento seguro através do Mercado Pago.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seleção de Planos */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Planos Disponíveis</h2>
            
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {plan.title}
                        {plan.popular && (
                          <Badge className="bg-blue-600">Popular</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        R$ {plan.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">/mês</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            {/* Informações sobre pagamento */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Pagamento Seguro</h4>
                    <p className="text-sm text-green-700">
                      Seus dados estão protegidos com criptografia SSL e processados pelo Mercado Pago.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout */}
          <div>
            {selectedPlan ? (
              <MercadoPagoCheckout
                items={[{
                  id: selectedPlanData!.id,
                  title: selectedPlanData!.title,
                  description: selectedPlanData!.description,
                  price: selectedPlanData!.price,
                  quantity: 1
                }]}
                payer={payerData}
                external_reference={`plano-${selectedPlan}-${Date.now()}`}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Selecione um Plano
                  </h3>
                  <p className="text-gray-500 text-center">
                    Escolha um dos planos ao lado para prosseguir com o pagamento.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="text-center py-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Pagamento Seguro</h4>
              <p className="text-sm text-gray-600">
                Processado pelo Mercado Pago com máxima segurança
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">Ativação Imediata</h4>
              <p className="text-sm text-gray-600">
                Seu plano é ativado automaticamente após o pagamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">Suporte 24/7</h4>
              <p className="text-sm text-gray-600">
                Nossa equipe está sempre disponível para ajudar
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
