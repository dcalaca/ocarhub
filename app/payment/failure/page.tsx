'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentStatus } from '@/components/mercadopago-checkout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, CreditCard } from 'lucide-react';

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    if (paymentId) {
      // Aqui você pode buscar dados adicionais do pagamento se necessário
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [paymentId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Status do pagamento */}
        <PaymentStatus status="failure" />

        {/* Detalhes do pagamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Detalhes do Pagamento
            </CardTitle>
            <CardDescription>
              Informações sobre sua transação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentId && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ID do Pagamento:</span>
                <Badge variant="outline" className="font-mono">
                  {paymentId}
                </Badge>
              </div>
            )}
            
            {externalReference && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Referência:</span>
                <Badge variant="outline">
                  {externalReference}
                </Badge>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              <Badge className="bg-red-600">
                Recusado
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Data:</span>
              <span className="text-sm text-gray-600">
                {new Date().toLocaleString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Possíveis causas */}
        <Card>
          <CardHeader>
            <CardTitle>Possíveis Causas</CardTitle>
            <CardDescription>
              Por que o pagamento pode ter sido recusado?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Saldo Insuficiente</p>
                  <p className="text-sm text-gray-600">
                    Verifique se há saldo suficiente no cartão
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Dados Incorretos</p>
                  <p className="text-sm text-gray-600">
                    Verifique os dados do cartão e tente novamente
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Cartão Bloqueado</p>
                  <p className="text-sm text-gray-600">
                    Entre em contato com seu banco
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cartões de teste */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💳 Cartões de Teste</CardTitle>
            <CardDescription className="text-blue-700">
              Use estes cartões para testar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">Aprovado:</span>
                <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                  4009 1753 3280 6176
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">CVV:</span>
                <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">123</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">Vencimento:</span>
                <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">11/25</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <a href="/checkout">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </a>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <a href="/">
              Voltar ao Início
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
