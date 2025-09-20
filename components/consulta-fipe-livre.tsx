'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SmartFilterInput } from '@/components/smart-filter-input';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Car, DollarSign, Calendar, Search } from 'lucide-react';

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


interface PrecoFipe {
  marca: string;
  modelo: string;
  ano: number;
  fipe_code: string;
  reference_month: string;
  price: number;
  status: string;
}

export default function ConsultaFipeLivre() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [precoFipe, setPrecoFipe] = useState<PrecoFipe | null>(null);
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
          setPrecoFipe(null);
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
          setPrecoFipe(null);
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
          setModelos(data);
          setModeloSelecionado('');
          setPrecoFipe(null);
        } catch (error) {
          console.error('Erro ao carregar modelos:', error);
        }
      };
      carregarModelos();
    } else {
      setModelos([]);
      setModeloSelecionado('');
    }
  }, [marcaSelecionada, veiculoSelecionado, anoSelecionado]);

  const consultarFipe = async () => {
    if (!marcaSelecionada || !veiculoSelecionado || !anoSelecionado || !modeloSelecionado) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/fipe/consultar?marca=${marcaSelecionada}&veiculo=${veiculoSelecionado}&ano=${anoSelecionado}&modelo=${modeloSelecionado}`);
      const data = await response.json();
      setPrecoFipe(data[0] || null);
    } catch (error) {
      console.error('Erro ao consultar FIPE:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Consulta FIPE
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Consulte o valor FIPE de qualquer veículo
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Seleção de Marca */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Marca</label>
              <SmartFilterInput
                options={marcas}
                value={marcaSelecionada}
                onChange={setMarcaSelecionada}
                placeholder="Digite ou selecione a marca"
              />
            </div>

            {/* Seleção de Veículo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Veículo</label>
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
              <label className="text-sm font-medium">Ano</label>
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
              <label className="text-sm font-medium">Modelo</label>
              <SmartFilterInput
                options={modelos}
                value={modeloSelecionado}
                onChange={setModeloSelecionado}
                placeholder="Digite ou selecione o modelo"
                disabled={!anoSelecionado}
              />
            </div>
          </div>

          <Button 
            onClick={consultarFipe} 
            disabled={!marcaSelecionada || !veiculoSelecionado || !anoSelecionado || !modeloSelecionado || loading}
            className="w-full"
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Consultando...' : 'Consultar FIPE'}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado da Consulta */}
      {precoFipe && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resultado da Consulta FIPE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {precoFipe.marca} {precoFipe.modelo}
                  </h3>
                  <p className="text-muted-foreground">Ano {precoFipe.ano}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Código FIPE:</span>
                    <span className="font-mono text-sm">{precoFipe.fipe_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Referência:</span>
                    <span className="text-sm">{precoFipe.reference_month}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={precoFipe.status === 'ATUAL' ? 'default' : 'secondary'}>
                      {precoFipe.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {formatarPreco(precoFipe.price)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Valor FIPE de referência
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não encontrar resultado */}
      {!precoFipe && marcaSelecionada && veiculoSelecionado && modeloSelecionado && anoSelecionado && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum valor FIPE encontrado para esta combinação.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
