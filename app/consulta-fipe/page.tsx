import ConsultaFipeLivre from '@/components/consulta-fipe-livre';
import { Header } from '@/components/header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consulta FIPE - OcarHub',
  description: 'Consulte o valor FIPE de qualquer veículo de forma rápida e precisa'
}

export default function ConsultaFipePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 content-with-header">
        <ConsultaFipeLivre />
      </div>
    </div>
  );
}
