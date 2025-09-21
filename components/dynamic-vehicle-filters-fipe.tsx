// Componente de filtros dinâmicos usando a estrutura FIPE normalizada
"use client"

import { useState, useEffect } from 'react'
import { VehicleSelector } from '@/components/vehicle-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RefreshCw, Search, X, Car, Calendar, Wrench, CheckCircle } from 'lucide-react'

interface DynamicVehicleFiltersFipeProps {
  onSelectionComplete?: (selection: {
    brand: string
    vehicle: string
    model: string
    year: number
    fipePrice?: number
  }) => void
  showFipePrice?: boolean
  className?: string
}

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

export function DynamicVehicleFiltersFipe({
  onSelectionComplete,
  showFipePrice = true,
  className = ""
}: DynamicVehicleFiltersFipeProps) {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [fipePrice, setFipePrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [marcaSelecionada, setMarcaSelecionada] = useState<string>('');
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<string>('');
  const [modeloSelecionado, setModeloSelecionado] = useState<string>('');
  const [anoSelecionado, setAnoSelecionado] = useState<string>('');

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
          setFipePrice(null);
        } catch (error) {
          console.error('Erro ao carregar veículos:', error);
        }
      };
      carregarVeiculos();
    } else {
      setVeiculos([]);
      setVeiculoSelecionado('');
    }
  }, [marcaSelecionada]);

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
          setFipePrice(null);
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
  }, [marcaSelecionada, veiculoSelecionado]);

  // Carregar modelos quando ano for selecionado
  useEffect(() => {
    if (marcaSelecionada && veiculoSelecionado && anoSelecionado) {
      const carregarModelos = async () => {
        try {
          const response = await fetch(`/api/fipe/modelos-por-ano?marca=${marcaSelecionada}&veiculo=${veiculoSelecionado}&ano=${anoSelecionado}`);
          const data = await response.json();
          
          if (Array.isArray(data)) {
            setModelos(data);
          } else {
            console.error('Dados de modelos não são um array:', data);
            setModelos([]);
          }
          
          setModeloSelecionado('');
          setFipePrice(null);
        } catch (error) {
          console.error('Erro ao carregar modelos:', error);
          setModelos([]);
        }
      };
      carregarModelos();
    } else {
      setModelos([]);
      setModeloSelecionado('');
    }
  }, [marcaSelecionada, veiculoSelecionado, anoSelecionado]);

  // Consultar preço FIPE quando todos os campos estiverem preenchidos
  useEffect(() => {
    if (marcaSelecionada && veiculoSelecionado && modeloSelecionado && anoSelecionado) {
      const consultarFipe = async () => {
        try {
          const response = await fetch(`/api/fipe/consultar?marca=${marcaSelecionada}&veiculo=${veiculoSelecionado}&ano=${anoSelecionado}&modelo=${modeloSelecionado}`);
          const data = await response.json();
          
          if (data && data.length > 0) {
            setFipePrice(data[0].price);
            
            // Notificar seleção completa
            if (onSelectionComplete) {
              onSelectionComplete({
                brand: marcaSelecionada,
                vehicle: veiculoSelecionado,
                model: modeloSelecionado,
                year: parseInt(anoSelecionado),
                fipePrice: data[0].price
              });
            }
          }
        } catch (error) {
          console.error('Erro ao consultar FIPE:', error);
        }
      };
      consultarFipe();
    }
  }, [marcaSelecionada, veiculoSelecionado, modeloSelecionado, anoSelecionado, onSelectionComplete]);

  const reset = () => {
    setMarcaSelecionada('');
    setVeiculoSelecionado('');
    setModeloSelecionado('');
    setAnoSelecionado('');
    setFipePrice(null);
  };

  const isComplete = marcaSelecionada && veiculoSelecionado && anoSelecionado && modeloSelecionado;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Seleção de Veículo
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Filtros Dinâmicos
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={!marcaSelecionada}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Seleção de Marca */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Marca</Label>
            <VehicleSelector
              options={marcas.map((marca) => ({
                value: marca.name,
                label: marca.name
              }))}
              value={marcaSelecionada}
              onChange={setMarcaSelecionada}
              placeholder="Selecione a marca"
            />
          </div>

          {/* Seleção de Veículo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Veículo</Label>
            <VehicleSelector
              options={veiculos.map((veiculo) => ({
                value: veiculo.name,
                label: veiculo.name
              }))}
              value={veiculoSelecionado}
              onChange={setVeiculoSelecionado}
              placeholder="Selecione o veículo"
              disabled={!marcaSelecionada}
            />
          </div>

          {/* Seleção de Ano */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ano</Label>
            <VehicleSelector
              options={anos.map((ano) => ({
                value: ano.toString(),
                label: ano.toString()
              }))}
              value={anoSelecionado}
              onChange={setAnoSelecionado}
              placeholder="Selecione o ano"
              disabled={!veiculoSelecionado}
            />
          </div>

          {/* Seleção de Modelo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Modelo</Label>
            <VehicleSelector
              options={Array.isArray(modelos) ? modelos.map((modelo) => ({
                value: modelo.name,
                label: modelo.name
              })) : []}
              value={modeloSelecionado}
              onChange={setModeloSelecionado}
              placeholder="Selecione o modelo"
              disabled={!anoSelecionado}
            />
          </div>
        </div>

        {/* Preço FIPE */}
        {showFipePrice && fipePrice && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Preço FIPE</p>
                <p className="text-2xl font-bold text-blue-600">
                  {fipePrice.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Referência
              </Badge>
            </div>
          </div>
        )}

        {/* Resumo da seleção */}
        {isComplete && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Seleção Completa</span>
            </div>
            <p className="text-sm text-green-700">
              {marcaSelecionada} {veiculoSelecionado} {modeloSelecionado} {anoSelecionado}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
