"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { getAllBrands, getModelsByBrand, getVersionsByModel, getYearsByVersion } from "@/lib/data/vehicles-database"
import {
  cores,
  carrocerias,
  opcionais,
  tiposVendedor,
  finaisPlaca,
  caracteristicas,
  estados,
  cidadesPorEstado,
  cambios,
  combustiveis,
} from "@/lib/data/filters"

export interface AdvancedSearchFilters {
  estado?: string
  cidade?: string
  condicao?: string
  marca?: string
  modelo?: string
  versao?: string
  anoMin?: number
  anoMax?: number
  precoMin?: number
  precoMax?: number
  quilometragem?: string
  kmMin?: number
  kmMax?: number
  cambio?: string
  combustivel?: string[]
  finalPlaca?: string
  tipoVendedor?: string[]
  cores?: string[]
  carroceria?: string[]
  opcionais?: string[]
  blindagem?: string
  leilao?: string
  caracteristicas?: string[]
  dataAnuncioMin?: string
  dataAnuncioMax?: string
  ordenacao: "relevancia" | "preco-asc" | "preco-desc" | "data-desc" | "km-asc"
}

interface AdvancedSearchFiltersProps {
  onSearch: (filters: AdvancedSearchFilters) => void
  initialFilters?: Partial<AdvancedSearchFilters>
}

export function AdvancedSearchFilters({ onSearch, initialFilters = {} }: AdvancedSearchFiltersProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    ordenacao: initialFilters.ordenacao || "relevancia",
    combustivel: [],
    tipoVendedor: [],
    cores: [],
    carroceria: [],
    opcionais: [],
    caracteristicas: [],
    ...initialFilters,
  })

  const [expandedSections, setExpandedSections] = useState({
    localizacao: true,
    tipoVendedor: false,
    caracteristicasVeiculo: false,
    filtrosAvancados: false,
  })

  // Estados para filtros dependentes
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [availableVersions, setAvailableVersions] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])

  // Atualizar modelos quando marca muda
  useEffect(() => {
    if (filters.marca) {
      const models = getModelsByBrand(filters.marca)
      setAvailableModels(models)

      // Limpar modelo, versão e ano se não estão mais disponíveis
      if (filters.modelo && !models.includes(filters.modelo)) {
        setFilters((prev) => ({ ...prev, modelo: undefined, versao: undefined, anoMin: undefined, anoMax: undefined }))
      }
    } else {
      setAvailableModels([])
      setFilters((prev) => ({ ...prev, modelo: undefined, versao: undefined, anoMin: undefined, anoMax: undefined }))
    }
  }, [filters.marca])

  // Atualizar versões quando modelo muda
  useEffect(() => {
    if (filters.marca && filters.modelo) {
      const versions = getVersionsByModel(filters.marca, filters.modelo)
      setAvailableVersions(versions)

      // Limpar versão se não está mais disponível
      if (filters.versao && !versions.includes(filters.versao)) {
        setFilters((prev) => ({ ...prev, versao: undefined, anoMin: undefined, anoMax: undefined }))
      }
    } else {
      setAvailableVersions([])
      setFilters((prev) => ({ ...prev, versao: undefined, anoMin: undefined, anoMax: undefined }))
    }
  }, [filters.marca, filters.modelo])

  // Atualizar anos quando versão muda
  useEffect(() => {
    if (filters.marca && filters.modelo && filters.versao) {
      const years = getYearsByVersion(filters.marca, filters.modelo, filters.versao)
      setAvailableYears(years)
    } else {
      setAvailableYears([])
    }
  }, [filters.marca, filters.modelo, filters.versao])

  const handleFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleArrayFilterToggle = (key: keyof AdvancedSearchFilters, value: string) => {
    setFilters((prev) => {
      const currentArray = (prev[key] as string[]) || []
      if (currentArray.includes(value)) {
        return { ...prev, [key]: currentArray.filter((item) => item !== value) }
      } else {
        return { ...prev, [key]: [...currentArray, value] }
      }
    })
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const clearFilters = () => {
    setFilters({
      ordenacao: "relevancia",
      combustivel: [],
      tipoVendedor: [],
      cores: [],
      carroceria: [],
      opcionais: [],
      caracteristicas: [],
    })
  }

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "ordenacao") return false
      if (Array.isArray(value)) return value.length > 0
      return value !== undefined && value !== null && value !== ""
    }).length
  }

  const getCidadesDisponiveis = () => {
    if (!filters.estado) return []
    return cidadesPorEstado[filters.estado] || []
  }

  // Obter todas as marcas disponíveis
  const allBrands = getAllBrands()

  return (
    <div className="w-full bg-gray-900 text-white p-4 space-y-4 lg:max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Filtros Avançados</h2>
        {getActiveFiltersCount() > 0 && (
          <Badge variant="secondary" className="ml-2">
            {getActiveFiltersCount()}
          </Badge>
        )}
      </div>

      {/* Localização */}
      <Collapsible open={expandedSections.localizacao} onOpenChange={() => toggleSection("localizacao")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left">
          <span className="font-medium">Localização</span>
          {expandedSections.localizacao ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-2">
          <div>
            <Label htmlFor="estado" className="text-sm text-gray-300">
              Estado
            </Label>
            <Select
              value={filters.estado || ""}
              onValueChange={(value) => {
                handleFilterChange("estado", value === "" ? undefined : value)
                handleFilterChange("cidade", undefined)
              }}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {estados.map((estado) => (
                  <SelectItem key={estado.sigla} value={estado.sigla} className="text-white">
                    {estado.nome} ({estado.sigla})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cidade" className="text-sm text-gray-300">
              Cidade
            </Label>
            <Select
              value={filters.cidade || ""}
              onValueChange={(value) => handleFilterChange("cidade", value === "" ? undefined : value)}
              disabled={!filters.estado}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {getCidadesDisponiveis().map((cidade) => (
                  <SelectItem key={cidade} value={cidade} className="text-white">
                    {cidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Condição */}
      <div>
        <Label htmlFor="condicao" className="text-sm text-gray-300">
          Condição
        </Label>
        <Select
          value={filters.condicao || ""}
          onValueChange={(value) => handleFilterChange("condicao", value === "" ? undefined : value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Novo/Usado" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="novo" className="text-white">
              Novo
            </SelectItem>
            <SelectItem value="usado" className="text-white">
              Usado
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Marca */}
      <div>
        <Label htmlFor="marca" className="text-sm text-gray-300">
          Marca
        </Label>
        <Select
          value={filters.marca || ""}
          onValueChange={(value) => handleFilterChange("marca", value === "" ? undefined : value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Selecione a marca" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {allBrands.map((marca) => (
              <SelectItem key={marca} value={marca} className="text-white">
                {marca}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Modelo */}
      <div>
        <Label htmlFor="modelo" className="text-sm text-gray-300">
          Modelo
        </Label>
        <Select
          value={filters.modelo || ""}
          onValueChange={(value) => handleFilterChange("modelo", value === "" ? undefined : value)}
          disabled={!filters.marca}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder={filters.marca ? "Selecione o modelo" : "Primeiro selecione a marca"} />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {availableModels.map((modelo) => (
              <SelectItem key={modelo} value={modelo} className="text-white">
                {modelo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Versão */}
      <div>
        <Label htmlFor="versao" className="text-sm text-gray-300">
          Versão
        </Label>
        <Select
          value={filters.versao || ""}
          onValueChange={(value) => handleFilterChange("versao", value === "" ? undefined : value)}
          disabled={!filters.modelo}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder={filters.modelo ? "Selecione a versão" : "Primeiro selecione o modelo"} />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {availableVersions.map((versao) => (
              <SelectItem key={versao} value={versao} className="text-white">
                {versao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ano */}
      <div>
        <Label className="text-sm text-gray-300">Ano</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Select
            value={filters.anoMin?.toString() || ""}
            onValueChange={(value) => handleFilterChange("anoMin", value ? Number(value) : undefined)}
            disabled={!filters.versao}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Ano mín." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {(availableYears.length > 0 ? availableYears : Array.from({ length: 30 }, (_, i) => 2024 - i)).map(
                (ano) => (
                  <SelectItem key={ano} value={ano.toString()} className="text-white">
                    {ano}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Select
            value={filters.anoMax?.toString() || ""}
            onValueChange={(value) => handleFilterChange("anoMax", value ? Number(value) : undefined)}
            disabled={!filters.versao}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Ano máx." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {(availableYears.length > 0 ? availableYears : Array.from({ length: 30 }, (_, i) => 2024 - i)).map(
                (ano) => (
                  <SelectItem key={ano} value={ano.toString()} className="text-white">
                    {ano}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preço */}
      <div>
        <Label className="text-sm text-gray-300">Preço (R$)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={filters.precoMin || ""}
            onChange={(e) => handleFilterChange("precoMin", e.target.value ? Number(e.target.value) : undefined)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <Input
            placeholder="Max"
            type="number"
            value={filters.precoMax || ""}
            onChange={(e) => handleFilterChange("precoMax", e.target.value ? Number(e.target.value) : undefined)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Quilometragem */}
      <div>
        <Label className="text-sm text-gray-300">Quilometragem</Label>
        <Select
          value={filters.quilometragem || ""}
          onValueChange={(value) => {
            handleFilterChange("quilometragem", value === "" ? undefined : value)
            if (value === "" || value !== "personalizado") {
              handleFilterChange("kmMin", undefined)
              handleFilterChange("kmMax", undefined)
            }
          }}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Selecione a faixa de KM" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="0-10000" className="text-white">
              Até 10.000 km
            </SelectItem>
            <SelectItem value="0-20000" className="text-white">
              Até 20.000 km
            </SelectItem>
            <SelectItem value="0-30000" className="text-white">
              Até 30.000 km
            </SelectItem>
            <SelectItem value="0-50000" className="text-white">
              Até 50.000 km
            </SelectItem>
            <SelectItem value="0-80000" className="text-white">
              Até 80.000 km
            </SelectItem>
            <SelectItem value="0-100000" className="text-white">
              Até 100.000 km
            </SelectItem>
            <SelectItem value="100000+" className="text-white">
              Acima de 100.000 km
            </SelectItem>
            <SelectItem value="personalizado" className="text-white">
              Personalizado
            </SelectItem>
          </SelectContent>
        </Select>

        {filters.quilometragem === "personalizado" && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Input
              placeholder="KM mín."
              type="number"
              value={filters.kmMin || ""}
              onChange={(e) => handleFilterChange("kmMin", e.target.value ? Number(e.target.value) : undefined)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
            <Input
              placeholder="KM máx."
              type="number"
              value={filters.kmMax || ""}
              onChange={(e) => handleFilterChange("kmMax", e.target.value ? Number(e.target.value) : undefined)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
        )}
      </div>

      {/* Câmbio */}
      <div>
        <Label className="text-sm text-gray-300">Câmbio</Label>
        <Select
          value={filters.cambio || ""}
          onValueChange={(value) => handleFilterChange("cambio", value === "" ? undefined : value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Selecione o câmbio" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {cambios.map((cambio) => (
              <SelectItem key={cambio} value={cambio} className="text-white">
                {cambio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Combustível */}
      <div>
        <Label className="text-sm text-gray-300">Combustível</Label>
        <div className="space-y-2">
          {combustiveis.map((combustivel) => (
            <div key={combustivel} className="flex items-center space-x-2">
              <Checkbox
                id={`combustivel-${combustivel}`}
                checked={filters.combustivel?.includes(combustivel) || false}
                onCheckedChange={() => handleArrayFilterToggle("combustivel", combustivel)}
                className="border-gray-600 data-[state=checked]:bg-purple-600"
              />
              <Label htmlFor={`combustivel-${combustivel}`} className="text-sm text-gray-300 cursor-pointer">
                {combustivel}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Final da Placa */}
      <div>
        <Label className="text-sm text-gray-300">Final da Placa</Label>
        <Select
          value={filters.finalPlaca || ""}
          onValueChange={(value) => handleFilterChange("finalPlaca", value === "" ? undefined : value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Selecione o final" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {finaisPlaca.map((final) => (
              <SelectItem key={final.value} value={final.value} className="text-white">
                {final.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de Vendedor */}
      <Collapsible open={expandedSections.tipoVendedor} onOpenChange={() => toggleSection("tipoVendedor")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left">
          <span className="font-medium">Tipo de Vendedor</span>
          {expandedSections.tipoVendedor ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {tiposVendedor.map((tipo) => (
            <div key={tipo} className="flex items-center space-x-2">
              <Checkbox
                id={`vendedor-${tipo}`}
                checked={filters.tipoVendedor?.includes(tipo) || false}
                onCheckedChange={() => handleArrayFilterToggle("tipoVendedor", tipo)}
                className="border-gray-600 data-[state=checked]:bg-purple-600"
              />
              <Label htmlFor={`vendedor-${tipo}`} className="text-sm text-gray-300 cursor-pointer">
                {tipo}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Características do Veículo */}
      <Collapsible
        open={expandedSections.caracteristicasVeiculo}
        onOpenChange={() => toggleSection("caracteristicasVeiculo")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left">
          <span className="font-medium">Características do Veículo</span>
          {expandedSections.caracteristicasVeiculo ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-2">
          {/* Cores */}
          <div>
            <Label className="text-sm text-gray-300 mb-2 block">Cores</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {cores.map((cor) => (
                <div key={cor} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cor-${cor}`}
                    checked={filters.cores?.includes(cor) || false}
                    onCheckedChange={() => handleArrayFilterToggle("cores", cor)}
                    className="border-gray-600 data-[state=checked]:bg-purple-600"
                  />
                  <Label htmlFor={`cor-${cor}`} className="text-sm text-gray-300 cursor-pointer">
                    {cor}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Carroceria */}
          <div>
            <Label className="text-sm text-gray-300 mb-2 block">Carroceria</Label>
            <div className="space-y-2">
              {carrocerias.map((carroceria) => (
                <div key={carroceria} className="flex items-center space-x-2">
                  <Checkbox
                    id={`carroceria-${carroceria}`}
                    checked={filters.carroceria?.includes(carroceria) || false}
                    onCheckedChange={() => handleArrayFilterToggle("carroceria", carroceria)}
                    className="border-gray-600 data-[state=checked]:bg-purple-600"
                  />
                  <Label htmlFor={`carroceria-${carroceria}`} className="text-sm text-gray-300 cursor-pointer">
                    {carroceria}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Opcionais */}
          <div>
            <Label className="text-sm text-gray-300 mb-2 block">Opcionais</Label>
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-4">
                {opcionais.map((opcional) => (
                  <div key={opcional} className="flex items-center space-x-2">
                    <Checkbox
                      id={`opcional-${opcional}`}
                      checked={filters.opcionais?.includes(opcional) || false}
                      onCheckedChange={() => handleArrayFilterToggle("opcionais", opcional)}
                      className="border-gray-600 data-[state=checked]:bg-purple-600"
                    />
                    <Label htmlFor={`opcional-${opcional}`} className="text-sm text-gray-300 cursor-pointer">
                      {opcional}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Filtros Avançados */}
      <Collapsible open={expandedSections.filtrosAvancados} onOpenChange={() => toggleSection("filtrosAvancados")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left">
          <span className="font-medium">Filtros Avançados</span>
          {expandedSections.filtrosAvancados ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-2">
          {/* Blindagem */}
          <div>
            <Label className="text-sm text-gray-300">Blindagem</Label>
            <Select
              value={filters.blindagem || ""}
              onValueChange={(value) => handleFilterChange("blindagem", value === "" ? undefined : value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="sim" className="text-white">
                  Sim
                </SelectItem>
                <SelectItem value="nao" className="text-white">
                  Não
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leilão */}
          <div>
            <Label className="text-sm text-gray-300">Leilão</Label>
            <Select
              value={filters.leilao || ""}
              onValueChange={(value) => handleFilterChange("leilao", value === "" ? undefined : value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="sim" className="text-white">
                  Sim
                </SelectItem>
                <SelectItem value="nao" className="text-white">
                  Não
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Características */}
          <div>
            <Label className="text-sm text-gray-300 mb-2 block">Características</Label>
            <div className="space-y-2">
              {caracteristicas.map((caracteristica) => (
                <div key={caracteristica} className="flex items-center space-x-2">
                  <Checkbox
                    id={`caracteristica-${caracteristica}`}
                    checked={filters.caracteristicas?.includes(caracteristica) || false}
                    onCheckedChange={() => handleArrayFilterToggle("caracteristicas", caracteristica)}
                    className="border-gray-600 data-[state=checked]:bg-purple-600"
                  />
                  <Label htmlFor={`caracteristica-${caracteristica}`} className="text-sm text-gray-300 cursor-pointer">
                    {caracteristica}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Ordenar por */}
      <div>
        <Label className="text-sm text-gray-300">Ordenar por</Label>
        <Select value={filters.ordenacao} onValueChange={(value) => handleFilterChange("ordenacao", value as any)}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Relevância" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="relevancia" className="text-white">
              Relevância
            </SelectItem>
            <SelectItem value="preco-asc" className="text-white">
              Menor preço
            </SelectItem>
            <SelectItem value="preco-desc" className="text-white">
              Maior preço
            </SelectItem>
            <SelectItem value="data-desc" className="text-white">
              Mais recente
            </SelectItem>
            <SelectItem value="km-asc" className="text-white">
              Menor KM
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data do Anúncio */}
      <div>
        <Label className="text-sm text-gray-300">Data do Anúncio</Label>
        <div className="space-y-2">
          <div>
            <Label className="text-xs text-gray-400">De</Label>
            <Input
              type="date"
              value={filters.dataAnuncioMin || ""}
              onChange={(e) => handleFilterChange("dataAnuncioMin", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-400">Até</Label>
            <Input
              type="date"
              value={filters.dataAnuncioMax || ""}
              onChange={(e) => handleFilterChange("dataAnuncioMax", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="space-y-2 pt-4">
        <Button onClick={handleSearch} className="w-full bg-purple-600 hover:bg-purple-700">
          <Search className="w-4 h-4 mr-2" />
          Buscar Veículos
        </Button>
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  )
}
