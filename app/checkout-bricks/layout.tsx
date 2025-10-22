'use client';

import { MercadoPagoProviderWrapper } from '@/components/providers/MercadoPagoProvider';

interface CheckoutLayoutProps {
  children: React.ReactNode;
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <MercadoPagoProviderWrapper>
      {children}
    </MercadoPagoProviderWrapper>
  );
}
