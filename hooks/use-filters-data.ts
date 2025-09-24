'use client';

import { useState, useEffect } from 'react';

interface FilterItem {
  id: number;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  categoria?: string;
  numero?: number;
}

interface FiltersData {
  combustiveis: FilterItem[];
  cores: FilterItem[];
  carrocerias: FilterItem[];
  opcionais: FilterItem[];
  tiposVendedor: FilterItem[];
  caracteristicas: FilterItem[];
  finaisPlaca: FilterItem[];
  blindagem: FilterItem[];
  leilao: FilterItem[];
}

export function useFiltersData() {
  const [filtersData, setFiltersData] = useState<FiltersData>({
    combustiveis: [],
    cores: [],
    carrocerias: [],
    opcionais: [],
    tiposVendedor: [],
    caracteristicas: [],
    finaisPlaca: [],
    blindagem: [],
    leilao: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        combustiveisRes,
        coresRes,
        carroceriasRes,
        opcionaisRes,
        tiposVendedorRes,
        caracteristicasRes,
        finaisPlacaRes,
        blindagemRes,
        leilaoRes
      ] = await Promise.all([
        fetch('/api/filters/combustiveis'),
        fetch('/api/filters/cores'),
        fetch('/api/filters/carrocerias'),
        fetch('/api/filters/opcionais'),
        fetch('/api/filters/tipos-vendedor'),
        fetch('/api/filters/caracteristicas'),
        fetch('/api/filters/finais-placa'),
        fetch('/api/filters/blindagem'),
        fetch('/api/filters/leilao')
      ]);

      const [
        combustiveis,
        cores,
        carrocerias,
        opcionais,
        tiposVendedor,
        caracteristicas,
        finaisPlaca,
        blindagem,
        leilao
      ] = await Promise.all([
        combustiveisRes.json(),
        coresRes.json(),
        carroceriasRes.json(),
        opcionaisRes.json(),
        tiposVendedorRes.json(),
        caracteristicasRes.json(),
        finaisPlacaRes.json(),
        blindagemRes.json(),
        leilaoRes.json()
      ]);

      // Debug: verificar se as respostas são arrays
      console.log('🔍 Debug - Respostas das APIs:', {
        combustiveis: Array.isArray(combustiveis) ? combustiveis.length : typeof combustiveis,
        cores: Array.isArray(cores) ? cores.length : typeof cores,
        carrocerias: Array.isArray(carrocerias) ? carrocerias.length : typeof carrocerias,
        opcionais: Array.isArray(opcionais) ? opcionais.length : typeof opcionais,
        tiposVendedor: Array.isArray(tiposVendedor) ? tiposVendedor.length : typeof tiposVendedor,
        caracteristicas: Array.isArray(caracteristicas) ? caracteristicas.length : typeof caracteristicas,
        finaisPlaca: Array.isArray(finaisPlaca) ? finaisPlaca.length : typeof finaisPlaca,
        blindagem: Array.isArray(blindagem) ? blindagem.length : typeof blindagem,
        leilao: Array.isArray(leilao) ? leilao.length : typeof leilao
      });

      setFiltersData({
        combustiveis,
        cores,
        carrocerias,
        opcionais,
        tiposVendedor,
        caracteristicas,
        finaisPlaca,
        blindagem,
        leilao
      });
    } catch (err) {
      console.error('Erro ao carregar filtros:', err);
      setError('Erro ao carregar dados dos filtros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  return {
    filtersData,
    loading,
    error,
    refetch: fetchFilters
  };
}
