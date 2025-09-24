'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const { filtersData, loading, error } = useFiltersData();
  const [selectedOpcionais, setSelectedOpcionais] = useState<string[]>(initialValues.opcionais || []);
  const [selectedCarroceria, setSelectedCarroceria] = useState<string>(initialValues.carroceria || '');
  const [selectedTipoVendedor, setSelectedTipoVendedor] = useState<string>(initialValues.tipoVendedor || '');
  const [selectedCaracteristicas, setSelectedCaracteristicas] = useState<string[]>(initialValues.caracteristicas || []);
  const [selectedBlindagem, setSelectedBlindagem] = useState<string>(initialValues.blindagem || '');
  const [selectedLeilao, setSelectedLeilao] = useState<string>(initialValues.leilao || '');

  // Agrupar opcionais por categoria
  const opcionaisPorCategoria = filtersData.opcionais.reduce((acc, opcional) => {
    const categoria = opcional.categoria || 'geral';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(opcional);
    return acc;
  }, {} as Record<string, typeof filtersData.opcionais>);

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

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro ao carregar opcionais</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Carroceria */}
      <Card>
        <CardHeader>
          <CardTitle>Carroceria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtersData.carrocerias.map((carroceria) => (
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
            {filtersData.tiposVendedor.map((tipo) => (
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
            {filtersData.caracteristicas.map((caracteristica) => (
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
            {filtersData.blindagem.map((blindagem) => (
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
            {filtersData.leilao.map((leilao) => (
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
            <div className="space-y-4">
              {Object.entries(opcionaisPorCategoria).map(([categoria, opcionais]) => (
                <div key={categoria}>
                  <h4 className="font-medium text-sm mb-2 capitalize">
                    {categoria === 'geral' ? 'Geral' : categoria}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {opcionais.map((opcional) => (
                      <div key={opcional.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`opcional-${opcional.id}`}
                          checked={selectedOpcionais.includes(opcional.nome)}
                          onCheckedChange={(checked) => handleOpcionalChange(opcional.nome, checked as boolean)}
                        />
                        <Label htmlFor={`opcional-${opcional.id}`} className="text-sm">
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
