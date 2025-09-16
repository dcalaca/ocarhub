// Componente de filtros dinâmicos como Webmotors
"use client"

import { useState } from 'react'
import { useDynamicFilters } from '@/hooks/use-dynamic-filters'
import { VehicleSelector } from '@/components/vehicle-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RefreshCw, Search, X, Car, Calendar, Wrench } from 'lucide-react'

interface DynamicVehicleFiltersProps {
  onSelectionComplete?: (selection: {
    brand: string
    model: string
    year: number
    version: string
    fipePrice?: number
  }) => void
  showFipePrice?: boolean
  className?: string
}

export function DynamicVehicleFilters({
  onSelectionComplete,
  showFipePrice = true,
  className = ""
}: DynamicVehicleFiltersProps) {
  const {
    state,
    options,
    loading,
    fipePrice,
    isComplete,
    updateBrand,
    updateModel,
    updateYear,
    updateVersion,
    reset,
    getSelectionSummary,
    selectedBrand,
    selectedModel,
    selectedYear,
    selectedVersion
  } = useDynamicFilters()

  const [showAdvanced, setShowAdvanced] = useState(false)

  // Notificar quando seleção estiver completa
  const handleSelectionComplete = () => {
    if (isComplete && onSelectionComplete && selectedBrand && selectedModel && selectedYear && selectedVersion) {
      onSelectionComplete({
        brand: selectedBrand,
        model: selectedModel,
        year: selectedYear,
        version: selectedVersion,
        fipePrice: fipePrice || undefined
      })
    }
  }

  // Chamar quando seleção estiver completa
  useState(() => {
    if (isComplete) {
      handleSelectionComplete()
    }
  })

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Seleção de Veículo
          </CardTitle>
          <div className="flex items-center gap-2">
            {isComplete && (
              <Badge variant="default" className="bg-green-600">
                Seleção Completa
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Ocultar' : 'Avançado'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtros Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Marca */}
          <div className="space-y-2">
            <Label htmlFor="brand">
              Marca <span className="text-red-500">*</span>
              {loading.brands && <span className="text-xs text-blue-600 ml-2">Carregando...</span>}
            </Label>
            <VehicleSelector
              options={options.brands}
              value={selectedBrand || ""}
              onChange={updateBrand}
              placeholder={loading.brands ? "Carregando marcas..." : "Selecione a marca"}
              disabled={loading.brands}
            />
          </div>

          {/* Modelo */}
          <div className="space-y-2">
            <Label htmlFor="model">
              Modelo <span className="text-red-500">*</span>
              {loading.models && <span className="text-xs text-blue-600 ml-2">Carregando...</span>}
            </Label>
            <VehicleSelector
              options={options.models}
              value={selectedModel || ""}
              onChange={updateModel}
              placeholder={loading.models ? "Carregando modelos..." : "Selecione o modelo"}
              disabled={!selectedBrand || loading.models}
            />
          </div>

          {/* Ano */}
          <div className="space-y-2">
            <Label htmlFor="year">
              Ano <span className="text-red-500">*</span>
              {loading.years && <span className="text-xs text-blue-600 ml-2">Carregando...</span>}
            </Label>
            <VehicleSelector
              options={options.years}
              value={selectedYear?.toString() || ""}
              onChange={(value) => updateYear(value ? parseInt(value) : null)}
              placeholder={loading.years ? "Carregando anos..." : "Selecione o ano"}
              disabled={!selectedModel || loading.years}
            />
          </div>

          {/* Versão */}
          <div className="space-y-2">
            <Label htmlFor="version">
              Versão <span className="text-red-500">*</span>
              {loading.versions && <span className="text-xs text-blue-600 ml-2">Carregando...</span>}
            </Label>
            <VehicleSelector
              options={options.versions}
              value={selectedVersion || ""}
              onChange={updateVersion}
              placeholder={loading.versions ? "Carregando versões..." : "Selecione a versão"}
              disabled={!selectedYear || loading.versions}
            />
          </div>
        </div>

        {/* Resumo da Seleção */}
        {isComplete && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  {getSelectionSummary()}
                </span>
              </div>
              {showFipePrice && fipePrice && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  FIPE: R$ {fipePrice.toLocaleString('pt-BR')}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Filtros Avançados */}
        {showAdvanced && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Filtros Avançados</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar Tudo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Anos disponíveis: {options.years.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span>Versões disponíveis: {options.versions.length}</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <div>Marca: {selectedBrand || 'Não selecionada'}</div>
                <div>Modelo: {selectedModel || 'Não selecionado'}</div>
              </div>

              <div className="text-sm text-muted-foreground">
                <div>Ano: {selectedYear || 'Não selecionado'}</div>
                <div>Versão: {selectedVersion || 'Não selecionada'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            💡 Filtros dinâmicos atualizam automaticamente como na Webmotors
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              disabled={!selectedBrand}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Resetar
            </Button>
            {isComplete && (
              <Button
                size="sm"
                onClick={handleSelectionComplete}
              >
                <Search className="w-4 h-4 mr-1" />
                Confirmar Seleção
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
