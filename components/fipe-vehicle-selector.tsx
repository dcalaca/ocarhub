'use client';

import { useState, useEffect } from 'react';
import { SmartFilterInput } from '@/components/smart-filter-input';
import { Label } from '@/components/ui/label';

interface Marca {
  id: number;
  name: string;
}

interface Veiculo {
  id: number;
  name: string;
}

interface Modelo {
  id: number;
  name: string;
}

interface FipeVehicleSelectorProps {
  onSelectionChange?: (selection: {
    marca?: string;
    veiculo?: string;
    ano?: number;
    modelo?: string;
  }) => void;
  initialValues?: {
    marca?: string;
    veiculo?: string;
    ano?: number;
    modelo?: string;
  };
}

export function FipeVehicleSelector({ onSelectionChange, initialValues = {} }: FipeVehicleSelectorProps) {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  
  const [marcaSelecionada, setMarcaSelecionada] = useState<string>(initialValues.marca || '');
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<string>(initialValues.veiculo || '');
  const [anoSelecionado, setAnoSelecionado] = useState<string>(initialValues.ano?.toString() || '');
  const [modeloSelecionado, setModeloSelecionado] = useState<string>(initialValues.modelo || '');

  // Carregar marcas
  useEffect(() => {
    const carregarMarcas = async () => {
      try {
        const response = await fetch('/api/fipe/marcas');
        const data = await response.json();
        setMarcas(data);
      } catch (error) {
        console.error('Erro ao carregar marcas:', error);
      }
    };
    carregarMarcas();
  }, []);

  // Carregar veículos quando marca for selecionada
  useEffect(() => {
    if (marcaSelecionada) {
      const carregarVeiculos = async () => {
        try {
          const response = await fetch(`/api/fipe/modelos?marca=${marcaSelecionada}`);
          const data = await response.json();
          setVeiculos(data);
          setVeiculoSelecionado('');
          setAnos([]);
          setAnoSelecionado('');
          setModelos([]);
          setModeloSelecionado('');
          
          // Notificar mudança
          onSelectionChange?.({
            marca: marcaSelecionada,
            veiculo: undefined,
            ano: undefined,
            modelo: undefined
          });
        } catch (error) {
          console.error('Erro ao carregar veículos:', error);
        }
      };
      carregarVeiculos();
    } else {
      setVeiculos([]);
      setVeiculoSelecionado('');
    }
  }, [marcaSelecionada, onSelectionChange]);

  // Carregar anos quando veículo for selecionado
  useEffect(() => {
    if (marcaSelecionada && veiculoSelecionado) {
      const carregarAnos = async () => {
        try {
          const response = await fetch(`/api/fipe/anos-por-veiculo?marca=${marcaSelecionada}&veiculo=${veiculoSelecionado}`);
          const data = await response.json();
          
          if (Array.isArray(data)) {
            const anosUnicos = [...new Set(data.map((item: any) => item.ano))]
              .filter(ano => ano && ano > 1990) // Filtrar anos válidos
              .sort((a, b) => b - a); // Priorizar anos mais recentes
            setAnos(anosUnicos);
          } else {
            setAnos([]);
          }
          
          setAnoSelecionado('');
          setModelos([]);
          setModeloSelecionado('');
          
          // Notificar mudança
          onSelectionChange?.({
            marca: marcaSelecionada,
            veiculo: veiculoSelecionado,
            ano: undefined,
            modelo: undefined
          });
        } catch (error) {
          console.error('Erro ao carregar anos:', error);
          setAnos([]);
        }
      };
      carregarAnos();
    } else {
      setAnos([]);
      setAnoSelecionado('');
    }
  }, [marcaSelecionada, veiculoSelecionado, onSelectionChange]);

  // Carregar modelos quando ano for selecionado
  useEffect(() => {
    if (marcaSelecionada && veiculoSelecionado && anoSelecionado) {
      const carregarModelos = async () => {
        try {
          const response = await fetch(`/api/fipe/modelos-por-ano?marca=${marcaSelecionada}&veiculo=${veiculoSelecionado}&ano=${anoSelecionado}`);
          const data = await response.json();
          setModelos(data);
          setModeloSelecionado('');
          
          // Notificar mudança
          onSelectionChange?.({
            marca: marcaSelecionada,
            veiculo: veiculoSelecionado,
            ano: parseInt(anoSelecionado),
            modelo: undefined
          });
        } catch (error) {
          console.error('Erro ao carregar modelos:', error);
        }
      };
      carregarModelos();
    } else {
      setModelos([]);
      setModeloSelecionado('');
    }
  }, [marcaSelecionada, veiculoSelecionado, anoSelecionado, onSelectionChange]);

  // Notificar quando modelo for selecionado
  useEffect(() => {
    if (modeloSelecionado) {
      onSelectionChange?.({
        marca: marcaSelecionada,
        veiculo: veiculoSelecionado,
        ano: parseInt(anoSelecionado),
        modelo: modeloSelecionado
      });
    }
  }, [modeloSelecionado, marcaSelecionada, veiculoSelecionado, anoSelecionado, onSelectionChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Seleção de Marca */}
      <div className="space-y-2">
        <Label htmlFor="marca">Marca</Label>
        <SmartFilterInput
          options={marcas}
          value={marcaSelecionada}
          onChange={setMarcaSelecionada}
          placeholder="Digite ou selecione a marca"
        />
      </div>

      {/* Seleção de Veículo */}
      <div className="space-y-2">
        <Label htmlFor="veiculo">Veículo</Label>
        <SmartFilterInput
          options={veiculos}
          value={veiculoSelecionado}
          onChange={setVeiculoSelecionado}
          placeholder="Digite ou selecione o veículo"
          disabled={!marcaSelecionada}
        />
      </div>

      {/* Seleção de Ano */}
      <div className="space-y-2">
        <Label htmlFor="ano">Ano</Label>
        <SmartFilterInput
          options={anos.map(ano => ({ id: ano, name: ano.toString() }))}
          value={anoSelecionado}
          onChange={setAnoSelecionado}
          placeholder="Digite ou selecione o ano"
          disabled={!veiculoSelecionado}
        />
      </div>

      {/* Seleção de Modelo */}
      <div className="space-y-2">
        <Label htmlFor="modelo">Modelo</Label>
        <SmartFilterInput
          options={modelos}
          value={modeloSelecionado}
          onChange={setModeloSelecionado}
          placeholder="Digite ou selecione o modelo"
          disabled={!anoSelecionado}
        />
      </div>
    </div>
  );
}
