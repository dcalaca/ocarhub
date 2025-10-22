'use client';

import { useEffect, useState } from 'react';

interface MercadoPagoProviderWrapperProps {
  children: React.ReactNode;
}

export default function MercadoPagoProviderWrapper({ children }: MercadoPagoProviderWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [MercadoPagoProvider, setMercadoPagoProvider] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Carregar o provider apenas no cliente
    const loadProvider = async () => {
      try {
        const { MercadoPagoProvider } = await import('@mercadopago/sdk-react');
        setMercadoPagoProvider(() => MercadoPagoProvider);
      } catch (error) {
        console.error('❌ Erro ao carregar MercadoPagoProvider:', error);
      }
    };

    loadProvider();
  }, []);

  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

  // Durante o SSR ou se não estiver no cliente, renderizar apenas os children
  if (!isClient || !MercadoPagoProvider) {
    return <>{children}</>;
  }

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
