'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentStatus } from '@/components/mercadopago-checkout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, Mail, Phone } from 'lucide-react';

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkCount, setCheckCount] = useState(0);

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    if (paymentId) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [paymentId]);

  // Simular verificação periódica do status
  useEffect(() => {
    if (paymentId && checkCount < 5) {
      const interval = setInterval(() => {
        setCheckCount(prev => prev + 1);
        // Aqui você pode implementar uma verificação real do status do pagamento
        console.log(`Verificando status do pagamento ${paymentId}... (tentativa ${checkCount + 1})`);
      }, 30000); // Verificar a cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [paymentId, checkCount]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
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
        <PaymentStatus status="pending" />

        {/* Detalhes do pagamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
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
              <Badge className="bg-yellow-600">
                Pendente
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Data:</span>
              <span className="text-sm text-gray-600">
                {new Date().toLocaleString('pt-BR')}
              </span>
            </div>

            {checkCount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Verificações:</span>
                <span className="text-sm text-gray-600">
                  {checkCount} tentativas
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* O que está acontecendo */}
        <Card>
          <CardHeader>
            <CardTitle>O que está acontecendo?</CardTitle>
            <CardDescription>
              Seu pagamento está sendo processado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Processamento em Andamento</p>
                  <p className="text-sm text-gray-600">
                    Seu pagamento está sendo analisado pelo banco
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Notificação por Email</p>
                  <p className="text-sm text-gray-600">
                    Você receberá um email quando o status mudar
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Verificação Automática</p>
                  <p className="text-sm text-gray-600">
                    Estamos verificando o status automaticamente
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipos de pagamento pendente */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Pagamento Pendente</CardTitle>
            <CardDescription>
              Alguns métodos de pagamento podem demorar mais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium">Boleto Bancário:</span>
                <span className="text-gray-600">Até 3 dias úteis</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">PIX:</span>
                <span className="text-gray-600">Até 1 hora</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Cartão de Crédito:</span>
                <span className="text-gray-600">Até 30 minutos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Transferência:</span>
                <span className="text-gray-600">Até 1 dia útil</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suporte */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Precisa de Ajuda?
            </CardTitle>
            <CardDescription>
              Entre em contato conosco se tiver dúvidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> suporte@ocarplatform.com</p>
              <p><strong>WhatsApp:</strong> (11) 99999-9999</p>
              <p><strong>Horário:</strong> Segunda a Sexta, 9h às 18h</p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <a href="/checkout">
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar Status
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
