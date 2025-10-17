'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle } from 'lucide-react';
import { useFiltersData } from '@/hooks/use-filters-data';

interface OpcionaisSelectorProps {
  onOpcionaisChange: (opcionais: string[]) => void;
  onCarroceriaChange: (carroceria: string) => void;
  onTipoVendedorChange: (tipo: string) => void;
  onCaracteristicasChange: (caracteristicas: string[]) => void;
  onBlindagemChange: (blindagem: string) => void;
  onLeilaoChange: (leilao: string) => void;
  initialValues?: {
    opcionais?: string[];
    carroceria?: string;
    tipoVendedor?: string;
    caracteristicas?: string[];
    blindagem?: string;
    leilao?: string;
  };
}

export function OpcionaisSelector({
  onOpcionaisChange,
  onCarroceriaChange,
  onTipoVendedorChange,
  onCaracteristicasChange,
  onBlindagemChange,
  onLeilaoChange,
  initialValues = {}
}: OpcionaisSelectorProps) {
  const { filtersData, loading, error } = useFiltersData()
  
  // Debug logs
  console.log('🔍 OpcionaisSelector Debug:', {
    loading,
    error,
    filtersData: {
      combustiveis: filtersData.combustiveis?.length || 0,
      cores: filtersData.cores?.length || 0,
      carrocerias: filtersData.carrocerias?.length || 0,
      opcionais: filtersData.opcionais?.length || 0,
      tiposVendedor: filtersData.tiposVendedor?.length || 0,
      caracteristicas: filtersData.caracteristicas?.length || 0,
      finaisPlaca: filtersData.finaisPlaca?.length || 0,
      blindagem: filtersData.blindagem?.length || 0,
      leilao: filtersData.leilao?.length || 0
    }
  });
  const [selectedOpcionais, setSelectedOpcionais] = useState<string[]>(initialValues.opcionais || []);
  const [selectedCarroceria, setSelectedCarroceria] = useState<string>(initialValues.carroceria || '');
  const [selectedTipoVendedor, setSelectedTipoVendedor] = useState<string>(initialValues.tipoVendedor || '');
  const [selectedCaracteristicas, setSelectedCaracteristicas] = useState<string[]>(initialValues.caracteristicas || []);
  const [selectedBlindagem, setSelectedBlindagem] = useState<string>(initialValues.blindagem || '');
  const [selectedLeilao, setSelectedLeilao] = useState<string>(initialValues.leilao || '');

  const handleOpcionalChange = (opcional: string, checked: boolean) => {
    const newOpcionais = checked
      ? [...selectedOpcionais, opcional]
      : selectedOpcionais.filter(o => o !== opcional);
    
    setSelectedOpcionais(newOpcionais);
    onOpcionaisChange(newOpcionais);
  };

  const handleCaracteristicaChange = (caracteristica: string, checked: boolean) => {
    const newCaracteristicas = checked
      ? [...selectedCaracteristicas, caracteristica]
      : selectedCaracteristicas.filter(c => c !== caracteristica);
    
    setSelectedCaracteristicas(newCaracteristicas);
    onCaracteristicasChange(newCaracteristicas);
  };

  // Dados de fallback caso as APIs não funcionem
  const fallbackData = {
    combustiveis: [
      { id: 1, nome: 'Flex (Gasolina/Álcool)' },
      { id: 2, nome: 'Gasolina' },
      { id: 3, nome: 'Álcool/Etanol' },
      { id: 4, nome: 'Diesel' },
      { id: 5, nome: 'Elétrico' },
      { id: 6, nome: 'Híbrido' }
    ],
    cores: [
      { id: 1, nome: 'Branco' },
      { id: 2, nome: 'Prata' },
      { id: 3, nome: 'Preto' },
      { id: 4, nome: 'Cinza' },
      { id: 5, nome: 'Vermelho' },
      { id: 6, nome: 'Azul' },
      { id: 7, nome: 'Verde' }
    ],
    carrocerias: [
      { id: 1, nome: 'Hatch' },
      { id: 2, nome: 'Sedã' },
      { id: 3, nome: 'SUV' },
      { id: 4, nome: 'Picape' },
      { id: 5, nome: 'Conversível' },
      { id: 6, nome: 'Cupê' }
    ],
    opcionais: [
      { id: 1, nome: 'Ar Condicionado', categoria: 'conforto' },
      { id: 2, nome: 'Vidros Elétricos', categoria: 'conforto' },
      { id: 3, nome: 'Teto Solar', categoria: 'conforto' },
      { id: 4, nome: 'Travas Elétricas', categoria: 'conforto' },
      { id: 5, nome: 'Direção Hidráulica', categoria: 'conforto' },
      { id: 6, nome: 'Direção Elétrica', categoria: 'conforto' },
      { id: 7, nome: 'Bancos de Couro', categoria: 'conforto' },
      { id: 8, nome: 'Rodas de Liga Leve', categoria: 'estetica' },
      { id: 9, nome: 'Airbag', categoria: 'seguranca' },
      { id: 10, nome: 'ABS', categoria: 'seguranca' },
      { id: 11, nome: 'Alarme', categoria: 'seguranca' },
      { id: 12, nome: 'GPS', categoria: 'navegacao' },
      { id: 13, nome: 'Câmera de Ré', categoria: 'seguranca' },
      { id: 14, nome: 'Sensor de Estacionamento', categoria: 'seguranca' }
    ],
    tiposVendedor: [
      { id: 1, nome: 'Particular' },
      { id: 2, nome: 'Loja' },
      { id: 3, nome: 'Concessionária' },
      { id: 4, nome: 'Revenda' }
    ],
    caracteristicas: [
      { id: 1, nome: 'Aceita Troca' },
      { id: 2, nome: 'Alienado' },
      { id: 3, nome: 'Garantia de Fábrica' },
      { id: 4, nome: 'IPVA Pago' },
      { id: 5, nome: 'Licenciado' },
      { id: 6, nome: 'Revisões na Concessionária' },
      { id: 7, nome: 'Único Dono' }
    ],
    finaisPlaca: [
      { id: 1, numero: 0 },
      { id: 2, numero: 1 },
      { id: 3, numero: 2 },
      { id: 4, numero: 3 },
      { id: 5, numero: 4 },
      { id: 6, numero: 5 },
      { id: 7, numero: 6 },
      { id: 8, numero: 7 },
      { id: 9, numero: 8 },
      { id: 10, numero: 9 }
    ],
    blindagem: [
      { id: 1, nome: 'Sim' },
      { id: 2, nome: 'Não' }
    ],
    leilao: [
      { id: 1, nome: 'Sim' },
      { id: 2, nome: 'Não' }
    ]
  };

  // Usar dados do banco se disponíveis, senão usar fallback
  const dataToUse = {
    combustiveis: (Array.isArray(filtersData.combustiveis) && filtersData.combustiveis.length > 0) ? filtersData.combustiveis : fallbackData.combustiveis,
    cores: (Array.isArray(filtersData.cores) && filtersData.cores.length > 0) ? filtersData.cores : fallbackData.cores,
    carrocerias: (Array.isArray(filtersData.carrocerias) && filtersData.carrocerias.length > 0) ? filtersData.carrocerias : fallbackData.carrocerias,
    opcionais: (Array.isArray(filtersData.opcionais) && filtersData.opcionais.length > 0) ? filtersData.opcionais : fallbackData.opcionais,
    tiposVendedor: (Array.isArray(filtersData.tiposVendedor) && filtersData.tiposVendedor.length > 0) ? filtersData.tiposVendedor : fallbackData.tiposVendedor,
    caracteristicas: (Array.isArray(filtersData.caracteristicas) && filtersData.caracteristicas.length > 0) ? filtersData.caracteristicas : fallbackData.caracteristicas,
    finaisPlaca: (Array.isArray(filtersData.finaisPlaca) && filtersData.finaisPlaca.length > 0) ? filtersData.finaisPlaca : fallbackData.finaisPlaca,
    blindagem: (Array.isArray(filtersData.blindagem) && filtersData.blindagem.length > 0) ? filtersData.blindagem : fallbackData.blindagem,
    leilao: (Array.isArray(filtersData.leilao) && filtersData.leilao.length > 0) ? filtersData.leilao : fallbackData.leilao
  };

  console.log('🔍 DataToUse Debug:', {
    carrocerias: dataToUse.carrocerias.length,
    tiposVendedor: dataToUse.tiposVendedor.length,
    caracteristicas: dataToUse.caracteristicas.length,
    blindagem: dataToUse.blindagem.length,
    leilao: dataToUse.leilao.length,
    opcionais: dataToUse.opcionais.length
  });

  // Agrupar opcionais por categoria - usando dados de fallback se necessário
  const opcionaisArray = dataToUse.opcionais;
  const opcionaisPorCategoria = opcionaisArray.reduce((acc, opcional) => {
    const categoria = opcional.categoria || 'geral';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(opcional);
    return acc;
  }, {} as Record<string, typeof opcionaisArray>);

  // Sempre mostrar os dados, mesmo em loading ou erro
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Carregando opcionais...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aviso se estiver usando dados de fallback */}
      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Usando dados temporários. Execute o SQL no Supabase para dados completos.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Carroceria */}
      <Card>
        <CardHeader>
          <CardTitle>Carroceria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dataToUse.carrocerias.map((carroceria) => (
              <div key={carroceria.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`carroceria-${carroceria.id}`}
                  checked={selectedCarroceria === carroceria.nome}
                  onCheckedChange={(checked) => {
                    const newValue = checked ? carroceria.nome : '';
                    setSelectedCarroceria(newValue);
                    onCarroceriaChange(newValue);
                  }}
                />
                <Label htmlFor={`carroceria-${carroceria.id}`} className="text-sm">
                  {carroceria.nome}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tipo de Vendedor */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dataToUse.tiposVendedor.map((tipo) => (
              <div key={tipo.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`tipo-${tipo.id}`}
                  checked={selectedTipoVendedor === tipo.nome}
                  onCheckedChange={(checked) => {
                    const newValue = checked ? tipo.nome : '';
                    setSelectedTipoVendedor(newValue);
                    onTipoVendedorChange(newValue);
                  }}
                />
                <Label htmlFor={`tipo-${tipo.id}`} className="text-sm">
                  {tipo.nome}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Características */}
      <Card>
        <CardHeader>
          <CardTitle>Características do Veículo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dataToUse.caracteristicas.map((caracteristica) => (
              <div key={caracteristica.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`caracteristica-${caracteristica.id}`}
                  checked={selectedCaracteristicas.includes(caracteristica.nome)}
                  onCheckedChange={(checked) => handleCaracteristicaChange(caracteristica.nome, checked as boolean)}
                />
                <Label htmlFor={`caracteristica-${caracteristica.id}`} className="text-sm">
                  {caracteristica.nome}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blindagem */}
      <Card>
        <CardHeader>
          <CardTitle>Blindagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {dataToUse.blindagem.map((blindagem) => (
              <div key={blindagem.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`blindagem-${blindagem.id}`}
                  checked={selectedBlindagem === blindagem.nome}
                  onCheckedChange={(checked) => {
                    const newValue = checked ? blindagem.nome : '';
                    setSelectedBlindagem(newValue);
                    onBlindagemChange(newValue);
                  }}
                />
                <Label htmlFor={`blindagem-${blindagem.id}`} className="text-sm">
                  {blindagem.nome}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leilão */}
      <Card>
        <CardHeader>
          <CardTitle>Leilão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {dataToUse.leilao.map((leilao) => (
              <div key={leilao.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`leilao-${leilao.id}`}
                  checked={selectedLeilao === leilao.nome}
                  onCheckedChange={(checked) => {
                    const newValue = checked ? leilao.nome : '';
                    setSelectedLeilao(newValue);
                    onLeilaoChange(newValue);
                  }}
                />
                <Label htmlFor={`leilao-${leilao.id}`} className="text-sm">
                  {leilao.nome}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opcionais */}
      <Card>
        <CardHeader>
          <CardTitle>Opcionais</CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecione os opcionais do veículo
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-6">
              {Object.entries(opcionaisPorCategoria).map(([categoria, opcionais]) => (
                <div key={categoria} className="mb-6">
                  <h4 className="font-medium text-sm mb-4 capitalize text-primary">
                    {categoria === 'geral' ? 'Geral' : categoria}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {opcionais.map((opcional) => (
                      <div key={opcional.id} className="flex items-start space-x-3 py-2">
                        <Checkbox
                          id={`opcional-${opcional.id}`}
                          checked={selectedOpcionais.includes(opcional.nome)}
                          onCheckedChange={(checked) => handleOpcionalChange(opcional.nome, checked as boolean)}
                          className="mt-0.5"
                        />
                        <Label 
                          htmlFor={`opcional-${opcional.id}`} 
                          className="text-sm leading-relaxed cursor-pointer flex-1 break-words"
                        >
                          {opcional.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {selectedOpcionais.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Opcionais selecionados ({selectedOpcionais.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedOpcionais.map((opcional) => (
                  <Badge key={opcional} variant="secondary">
                    {opcional}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
