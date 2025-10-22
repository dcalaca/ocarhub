'use client';

import { MercadoPagoProvider } from '@mercadopago/sdk-react';

interface MercadoPagoProviderWrapperProps {
  children: React.ReactNode;
}

export default function MercadoPagoProviderWrapper({ children }: MercadoPagoProviderWrapperProps) {
  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

  if (!publicKey) {
    console.error('❌ NEXT_PUBLIC_MP_PUBLIC_KEY não configurado');
    return <div>Erro: Chave pública do Mercado Pago não configurada</div>;
  }

  return (
    <MercadoPagoProvider 
      publicKey={publicKey}
      locale="pt-BR"
      options={{
        locale: 'pt-BR',
        advancedFraudPrevention: true,
        enableLogging: true
      }}
    >
      {children}
    </MercadoPagoProvider>
  );
}
