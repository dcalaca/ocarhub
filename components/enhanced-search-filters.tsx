"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import { SmartVehicleSelector, type VehicleSelection } from "./smart-vehicle-selector"
import { getAllYears } from "@/lib/data/vehicles-database"

interface EnhancedSearchFiltersProps {
  onSearch: (filters: EnhancedSearchFilters) => void
}

export interface EnhancedSearchFilters extends VehicleSelection {
  anoMin?: number
  anoMax?: number
  precoMin?: number
  precoMax?: number
  quilometragemMax?: number
  kmMin?: number
  kmMax?: number
  kmRange?: string
  cidade?: string
  ordenacao: "preco-asc" | "preco-desc" | "data-desc" | "km-asc"
}

const combustiveis = ["Flex", "Gasolina", "Etanol", "Diesel", "Elétrico", "Híbrido"]
const cambios = ["Manual", "Automático", "CVT"]

export function EnhancedSearchFilters({ onSearch }: EnhancedSearchFiltersProps) {
  const [filters, setFilters] = useState<EnhancedSearchFilters>({
    ordenacao: "data-desc",
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleVehicleSelectionChange = (selection: VehicleSelection) => {
    setFilters((prev) => ({ ...prev, ...selection }))
  }

  const handleFilterChange = (key: keyof EnhancedSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const clearFilters = () => {
    const clearedFilters: EnhancedSearchFilters = { ordenacao: "data-desc" }
    setFilters(clearedFilters)
    onSearch(clearedFilters)
  }

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => key !== "ordenacao" && filters[key as keyof EnhancedSearchFilters],
  ).length

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Seletor inteligente de veículos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Buscar Veículo</h3>
            <SmartVehicleSelector onSelectionChange={handleVehicleSelectionChange} initialValues={filters} />
          </div>

          {/* Localização */}
          <div>
            <Input
              placeholder="Cidade"
              value={filters.cidade || ""}
              onChange={(e) => handleFilterChange("cidade", e.target.value)}
            />
          </div>

          {/* Filtros avançados */}
          {showAdvanced && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ano mínimo</label>
                  <Select onValueChange={(value) => handleFilterChange("anoMin", Number.parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ano mín." />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllYears().map((ano) => (
                        <SelectItem key={ano} value={ano.toString()}>
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Ano máximo</label>
                  <Select onValueChange={(value) => handleFilterChange("anoMax", Number.parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ano máx." />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllYears().map((ano) => (
                        <SelectItem key={ano} value={ano.toString()}>
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Preço mínimo</label>
                  <Input
                    type="number"
                    placeholder="R$ 10.000"
                    value={filters.precoMin || ""}
                    onChange={(e) => handleFilterChange("precoMin", Number.parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Preço máximo</label>
                  <Input
                    type="number"
                    placeholder="R$ 100.000"
                    value={filters.precoMax || ""}
                    onChange={(e) => handleFilterChange("precoMax", Number.parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Combustível</label>
                  <Select onValueChange={(value) => handleFilterChange("combustivel", [value])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      {combustiveis.map((combustivel) => (
                        <SelectItem key={combustivel} value={combustivel}>
                          {combustivel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Câmbio</label>
                  <Select onValueChange={(value) => handleFilterChange("cambio", [value])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      {cambios.map((cambio) => (
                        <SelectItem key={cambio} value={cambio}>
                          {cambio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Quilometragem</label>
                  <div className="space-y-2">
                    <Select
                      value={filters.kmRange}
                      onValueChange={(value) => {
                        if (value === "custom") {
                          handleFilterChange("kmRange", value)
                        } else {
                          const [min, max] = value.split("-").map((v) => (v === "+" ? undefined : Number(v)))
                          handleFilterChange("quilometragemMax", max)
                          handleFilterChange("kmRange", value)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa de KM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-10000">Até 10.000 km</SelectItem>
                        <SelectItem value="0-20000">Até 20.000 km</SelectItem>
                        <SelectItem value="0-30000">Até 30.000 km</SelectItem>
                        <SelectItem value="0-50000">Até 50.000 km</SelectItem>
                        <SelectItem value="0-80000">Até 80.000 km</SelectItem>
                        <SelectItem value="0-100000">Até 100.000 km</SelectItem>
                        <SelectItem value="100000-+">Acima de 100.000 km</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>

                    {filters.kmRange === "custom" && (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="KM mínimo"
                          value={filters.kmMin || ""}
                          onChange={(e) => handleFilterChange("kmMin", Number.parseInt(e.target.value) || undefined)}
                        />
                        <Input
                          type="number"
                          placeholder="KM máximo"
                          value={filters.kmMax || ""}
                          onChange={(e) => handleFilterChange("kmMax", Number.parseInt(e.target.value) || undefined)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ordenação */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Ordenar por:</label>
              <Select value={filters.ordenacao} onValueChange={(value: any) => handleFilterChange("ordenacao", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data-desc">Mais recentes</SelectItem>
                  <SelectItem value="preco-asc">Menor preço</SelectItem>
                  <SelectItem value="preco-desc">Maior preço</SelectItem>
                  <SelectItem value="km-asc">Menor KM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {activeFiltersCount} filtro{activeFiltersCount > 1 ? "s" : ""}
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-transparent" onClick={clearFilters}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleSearch} className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showAdvanced ? "Ocultar filtros" : "Filtros avançados"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
