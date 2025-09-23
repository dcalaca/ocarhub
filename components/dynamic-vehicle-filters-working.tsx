// Componente de filtros dinâmicos funcionais usando hooks FIPE
"use client"

import { useState, useEffect } from 'react'
import { VehicleSelector } from '@/components/vehicle-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RefreshCw, Car, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { useFipeBrands, useFipeModels, useFipeYears } from '@/hooks/use-fipe-data'
import { dynamicFiltersService } from '@/lib/dynamic-filters-service'

interface DynamicVehicleFiltersWorkingProps {
  onSelectionComplete?: (selection: {
    brand: string
    model: string
    year: number
    version?: string
    fipePrice?: number
  }) => void
  showFipePrice?: boolean
  className?: string
}

export function DynamicVehicleFiltersWorking({
  onSelectionComplete,
  showFipePrice = true,
  className = ""
}: DynamicVehicleFiltersWorkingProps) {
  // Estados dos filtros
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [fipePrice, setFipePrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hooks FIPE
  const { brands, loading: brandsLoading } = useFipeBrands()
  const { models, loading: modelsLoading } = useFipeModels(selectedBrand)
  const { years, loading: yearsLoading } = useFipeYears(selectedBrand, selectedModel)

  // Resetar filtros dependentes quando marca muda
  useEffect(() => {
    if (selectedBrand) {
      setSelectedModel('')
      setSelectedYear('')
      setSelectedVersion('')
      setFipePrice(null)
    }
  }, [selectedBrand])

  // Resetar filtros dependentes quando modelo muda
  useEffect(() => {
    if (selectedModel) {
      setSelectedYear('')
      setSelectedVersion('')
      setFipePrice(null)
    }
  }, [selectedModel])

  // Resetar filtros dependentes quando ano muda
  useEffect(() => {
    if (selectedYear) {
      setSelectedVersion('')
      setFipePrice(null)
    }
  }, [selectedYear])

  // Buscar preço FIPE quando todos os campos estiverem preenchidos
  useEffect(() => {
    if (selectedBrand && selectedModel && selectedYear) {
      const buscarPrecoFipe = async () => {
        try {
          setLoading(true)
          setError(null)

          // Buscar o código da marca
          const brandData = brands.find(b => b.name === selectedBrand)
          if (!brandData) return

          // Buscar o código do modelo
          const modelData = models.find(m => m.name === selectedModel)
          if (!modelData) return

          // Buscar preço FIPE
          const price = await dynamicFiltersService.getFipePrice({
            brand: selectedBrand,
            model: selectedModel,
            year: parseInt(selectedYear),
            version: null,
            fipeCode: null
          })

          if (price) {
            setFipePrice(price)
            
            // Notificar seleção completa
            if (onSelectionComplete) {
              onSelectionComplete({
                brand: selectedBrand,
                model: selectedModel,
                year: parseInt(selectedYear),
                version: selectedVersion || undefined,
                fipePrice: price
              })
            }
          }
        } catch (err) {
          console.error('Erro ao buscar preço FIPE:', err)
          setError('Erro ao buscar preço FIPE')
        } finally {
          setLoading(false)
        }
      }

      buscarPrecoFipe()
    }
  }, [selectedBrand, selectedModel, selectedYear, selectedVersion, brands, models, onSelectionComplete])

  const reset = () => {
    setSelectedBrand('')
    setSelectedModel('')
    setSelectedYear('')
    setSelectedVersion('')
    setFipePrice(null)
    setError(null)
  }

  const isComplete = selectedBrand && selectedModel && selectedYear

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
              disabled={!selectedBrand}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Seleção de Marca */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Marca <span className="text-red-500">*</span>
              {brandsLoading && <span className="text-xs text-blue-600 ml-2">Carregando...</span>}
            </Label>
            <VehicleSelector
              options={brands.map((brand) => ({
                value: brand.name,
                label: brand.name
              }))}
              value={selectedBrand}
              onChange={setSelectedBrand}
              placeholder={brandsLoading ? "Carregando marcas..." : "Selecione a marca"}
              disabled={brandsLoading}
            />
          </div>

          {/* Seleção de Modelo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Modelo <span className="text-red-500">*</span>
              {modelsLoading && <span className="text-xs text-blue-600 ml-2">Carregando...</span>}
            </Label>
            <VehicleSelector
              options={models.map((model) => ({
                value: model.name,
                label: model.name
              }))}
              value={selectedModel}
              onChange={setSelectedModel}
              placeholder={modelsLoading ? "Carregando modelos..." : "Selecione o modelo"}
              disabled={!selectedBrand || modelsLoading}
            />
          </div>

          {/* Seleção de Ano */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Ano <span className="text-red-500">*</span>
              {yearsLoading && <span className="text-xs text-blue-600 ml-2">Carregando...</span>}
            </Label>
            <VehicleSelector
              options={years.map((year) => ({
                value: year.name,
                label: year.name
              }))}
              value={selectedYear}
              onChange={setSelectedYear}
              placeholder={yearsLoading ? "Carregando anos..." : "Selecione o ano"}
              disabled={!selectedModel || yearsLoading}
            />
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

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
              {selectedBrand} {selectedModel} {selectedYear}
            </p>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Buscando preço FIPE...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
