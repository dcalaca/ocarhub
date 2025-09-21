'use client';

import { useState } from 'react';
import ComparacaoFipeAnuncio from '@/components/comparacao-fipe-anuncio';

// Dados de exemplo para teste
const anuncioExemplo = {
  id: '1',
  marca: 'Honda',
  modelo: 'Civic',
  ano: 2020,
  preco: 85000,
  titulo: 'Honda Civic 2020 - Excelente estado',
  descricao: 'Veículo em perfeito estado, único dono, revisões em dia',
  vendedor: 'João Silva',
  telefone: '(11) 99999-9999',
  cidade: 'São Paulo',
  estado: 'SP'
};

export default function TesteComparacaoPage() {
  const [showComparacao, setShowComparacao] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste - Comparação FIPE x Anúncio</h1>
        
        {/* Card do Anúncio */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{anuncioExemplo.titulo}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Veículo</p>
              <p className="font-medium">{anuncioExemplo.marca} {anuncioExemplo.modelo} {anuncioExemplo.ano}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Preço</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(anuncioExemplo.preco)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendedor</p>
              <p className="font-medium">{anuncioExemplo.vendedor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contato</p>
              <p className="font-medium">{anuncioExemplo.telefone}</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowComparacao(!showComparacao)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showComparacao ? 'Ocultar' : 'Ver'} Comparação FIPE
          </button>
        </div>

        {/* Comparação FIPE */}
        {showComparacao && (
          <ComparacaoFipeAnuncio 
            anuncio={anuncioExemplo}
            onClose={() => setShowComparacao(false)}
          />
        )}
      </div>
    </div>
  );
}
