'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentStatus } from '@/components/mercadopago-checkout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    if (paymentId) {
      // Aqui você pode buscar dados adicionais do pagamento se necessário
      // Por exemplo, buscar informações do banco de dados usando o payment_id
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        <PaymentStatus status="success" />

        {/* Detalhes do pagamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
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
              <Badge className="bg-green-600">
                Aprovado
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

        {/* Próximos passos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
            <CardDescription>
              O que acontece agora?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Pagamento Confirmado</p>
                  <p className="text-sm text-gray-600">
                    Seu pagamento foi processado com sucesso
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Confirmação por Email</p>
                  <p className="text-sm text-gray-600">
                    Você receberá um email de confirmação em breve
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Acesso Liberado</p>
                  <p className="text-sm text-gray-600">
                    Seus serviços já estão disponíveis
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/dashboard"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-700 transition-colors"
          >
            Ir para Dashboard
          </a>
          <a
            href="/"
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-center hover:bg-gray-200 transition-colors"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
    </div>
  );
}
