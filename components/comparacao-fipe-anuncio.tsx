'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, DollarSign, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

interface PrecoFipe {
  marca: string;
  modelo: string;
  ano: number;
  fipe_code: string;
  reference_month: string;
  price: number;
  status: string;
}

interface Anuncio {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
  vendedor: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
}

interface ComparacaoFipeProps {
  anuncio: Anuncio;
  onClose?: () => void;
}

export default function ComparacaoFipeAnuncio({ anuncio, onClose }: ComparacaoFipeProps) {
  const [precoFipe, setPrecoFipe] = useState<PrecoFipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    consultarFipeAnuncio();
  }, [anuncio]);

  const consultarFipeAnuncio = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/fipe/consultar?marca=${anuncio.marca}&modelo=${anuncio.modelo}&ano=${anuncio.ano}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setPrecoFipe(data[0]);
      } else {
        setError('Valor FIPE não encontrado para este veículo');
      }
    } catch (error) {
      console.error('Erro ao consultar FIPE:', error);
      setError('Erro ao consultar valor FIPE');
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

  const calcularDiferenca = () => {
    if (!precoFipe) return null;
    
    const diferenca = anuncio.preco - precoFipe.price;
    const percentual = (diferenca / precoFipe.price) * 100;
    
    return {
      valor: diferenca,
      percentual: percentual
    };
  };

  const getDiferencaIcon = (diferenca: number) => {
    if (diferenca > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (diferenca < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getDiferencaColor = (diferenca: number) => {
    if (diferenca > 0) return 'text-red-600';
    if (diferenca < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getDiferencaBadge = (diferenca: number) => {
    if (diferenca > 0) return <Badge variant="destructive">Acima da FIPE</Badge>;
    if (diferenca < 0) return <Badge variant="default">Abaixo da FIPE</Badge>;
    return <Badge variant="secondary">Igual à FIPE</Badge>;
  };

  const diferenca = calcularDiferenca();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Comparação FIPE x Anúncio
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Compare o preço do anúncio com o valor FIPE de referência
          </p>
        </CardHeader>
        <CardContent>
          {/* Informações do Anúncio */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">{anuncio.titulo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Veículo</p>
                <p className="font-medium">{anuncio.marca} {anuncio.modelo} {anuncio.ano}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendedor</p>
                <p className="font-medium">{anuncio.vendedor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Localização</p>
                <p className="font-medium">{anuncio.cidade}, {anuncio.estado}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contato</p>
                <p className="font-medium">{anuncio.telefone}</p>
              </div>
            </div>
          </div>

          {/* Comparação de Preços */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Consultando valor FIPE...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={consultarFipeAnuncio} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          ) : precoFipe && diferenca ? (
            <div className="space-y-6">
              {/* Preços */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preço do Anúncio */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Preço do Anúncio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {formatarPreco(anuncio.preco)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Valor solicitado pelo vendedor
                    </p>
                  </CardContent>
                </Card>

                {/* Preço FIPE */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Valor FIPE
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {formatarPreco(precoFipe.price)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Referência {precoFipe.reference_month}
                    </p>
                    <div className="mt-2">
                      <Badge variant={precoFipe.status === 'ATUAL' ? 'default' : 'secondary'}>
                        {precoFipe.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Análise da Diferença */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análise da Diferença</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getDiferencaIcon(diferenca.valor)}
                        <span className="text-sm font-medium">Diferença</span>
                      </div>
                      <div className={`text-2xl font-bold ${getDiferencaColor(diferenca.valor)}`}>
                        {formatarPreco(Math.abs(diferenca.valor))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {diferenca.valor > 0 ? 'Acima' : diferenca.valor < 0 ? 'Abaixo' : 'Igual'} da FIPE
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium mb-2">Percentual</div>
                      <div className={`text-2xl font-bold ${getDiferencaColor(diferenca.valor)}`}>
                        {Math.abs(diferenca.percentual).toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {diferenca.valor > 0 ? 'Acima' : diferenca.valor < 0 ? 'Abaixo' : 'Igual'} da FIPE
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium mb-2">Status</div>
                      <div className="mb-2">
                        {getDiferencaBadge(diferenca.valor)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {diferenca.valor > 0 ? 'Anúncio mais caro' : 
                         diferenca.valor < 0 ? 'Anúncio mais barato' : 
                         'Preço equilibrado'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações Adicionais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Técnicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Código FIPE</p>
                      <p className="font-mono text-sm">{precoFipe.fipe_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Referência</p>
                      <p className="text-sm">{precoFipe.reference_month}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {onClose && (
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      )}
    </div>
  );
}
