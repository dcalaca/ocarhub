'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Tipos para o componente
interface PaymentItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  quantity?: number;
}

interface PayerData {
  name: string;
  surname?: string;
  email: string;
  phone?: {
    area_code: string;
    number: string;
  };
  identification?: {
    type: string;
    number: string;
  };
  address?: {
    street_name: string;
    street_number: string;
    zip_code: string;
  };
}

interface MercadoPagoCheckoutProps {
  items: PaymentItem[];
  payer?: Partial<PayerData>;
  external_reference?: string;
  onSuccess?: (preferenceId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function MercadoPagoCheckout({
  items,
  payer: initialPayer,
  external_reference,
  onSuccess,
  onError,
  className
}: MercadoPagoCheckoutProps) {
  const [payer, setPayer] = useState<PayerData>({
    name: initialPayer?.name || '',
    surname: initialPayer?.surname || '',
    email: initialPayer?.email || '',
    phone: initialPayer?.phone || { area_code: '', number: '' },
    identification: initialPayer?.identification || { type: 'CPF', number: '' },
    address: initialPayer?.address || { street_name: '', street_number: '', zip_code: '' }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Calcular total
  const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // Função para criar preferência
  const createPreference = async () => {
    setIsLoading(true);
    
    try {
      // Detectar se estamos em modo de teste baseado na URL ou configuração
      const isTestMode = window.location.hostname.includes('vercel.app') || 
                        window.location.hostname.includes('localhost');
      
      const apiEndpoint = isTestMode ? 
        '/api/payment/create-preference-test' : 
        '/api/payment/create-preference-official';
      
      console.log('🧪 Usando API:', apiEndpoint, 'Modo:', isTestMode ? 'TESTE' : 'PRODUÇÃO');
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          payer,
          external_reference: external_reference || `checkout-${Date.now()}`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar preferência');
      }

      setPreferenceId(data.preference_id);
      setCheckoutUrl(data.init_point);
      
      toast.success('Preferência criada com sucesso!');
      onSuccess?.(data.preference_id);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para abrir checkout
  const openCheckout = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
  };

  // Validação do formulário
  const isFormValid = payer.name && payer.email;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Checkout Mercado Pago
          </CardTitle>
          <CardDescription>
            Complete seus dados para prosseguir com o pagamento
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Resumo dos itens */}
          <div className="space-y-2">
            <h4 className="font-medium">Itens do Pedido</h4>
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.title}</p>
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Qtd: {item.quantity || 1}
                  </p>
                </div>
                <p className="font-medium">
                  R$ {(item.price * (item.quantity || 1)).toFixed(2)}
                </p>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-lg font-bold text-green-600">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Formulário do pagador */}
          <div className="space-y-4">
            <h4 className="font-medium">Dados do Pagador</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={payer.name}
                  onChange={(e) => setPayer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="surname">Sobrenome</Label>
                <Input
                  id="surname"
                  value={payer.surname || ''}
                  onChange={(e) => setPayer(prev => ({ ...prev, surname: e.target.value }))}
                  placeholder="Seu sobrenome"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={payer.email}
                onChange={(e) => setPayer(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone-area">DDD</Label>
                <Input
                  id="phone-area"
                  value={payer.phone?.area_code || ''}
                  onChange={(e) => setPayer(prev => ({ 
                    ...prev, 
                    phone: { ...prev.phone!, area_code: e.target.value }
                  }))}
                  placeholder="11"
                  maxLength={2}
                />
              </div>
              
              <div>
                <Label htmlFor="phone-number">Telefone</Label>
                <Input
                  id="phone-number"
                  value={payer.phone?.number || ''}
                  onChange={(e) => setPayer(prev => ({ 
                    ...prev, 
                    phone: { ...prev.phone!, number: e.target.value }
                  }))}
                  placeholder="999999999"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={payer.identification?.number || ''}
                onChange={(e) => setPayer(prev => ({ 
                  ...prev, 
                  identification: { ...prev.identification!, number: e.target.value }
                }))}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-3">
            {!preferenceId ? (
              <Button
                onClick={createPreference}
                disabled={!isFormValid || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando preferência...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Criar Preferência de Pagamento
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={openCheckout}
                className="w-full"
                size="lg"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Ir para Pagamento
              </Button>
            )}

            {preferenceId && (
              <div className="text-center text-sm text-gray-600">
                <p>Preferência criada: <code className="bg-gray-100 px-2 py-1 rounded">{preferenceId}</code></p>
              </div>
            )}
          </div>

          {/* Informações de teste */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">💳 Cartões de Teste</h5>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Aprovado:</strong> 4009 1753 3280 6176 (CVV: 123)</p>
              <p><strong>Recusado:</strong> 4000 0000 0000 0002 (CVV: 123)</p>
              <p><strong>Vencimento:</strong> 11/25</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para exibir status do pagamento
export function PaymentStatus({ status }: { status: 'success' | 'failure' | 'pending' }) {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      title: 'Pagamento Aprovado!',
      description: 'Seu pagamento foi processado com sucesso.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    failure: {
      icon: XCircle,
      title: 'Pagamento Recusado',
      description: 'Não foi possível processar seu pagamento.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    pending: {
      icon: Clock,
      title: 'Pagamento Pendente',
      description: 'Seu pagamento está sendo processado.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardContent className="flex flex-col items-center text-center py-8">
        <Icon className={`h-16 w-16 ${config.color} mb-4`} />
        <h2 className={`text-2xl font-bold ${config.color} mb-2`}>
          {config.title}
        </h2>
        <p className="text-gray-600 mb-4">
          {config.description}
        </p>
        <Button asChild>
          <a href="/">Voltar ao Início</a>
        </Button>
      </CardContent>
    </Card>
  );
}

export default MercadoPagoCheckout;
