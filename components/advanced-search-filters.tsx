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
import { SmartFilterInput } from "@/components/smart-filter-input"
import { ExpandableFilterGroup } from "@/components/expandable-filter-group"
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
  termo?: string
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
    finalPlaca: "",
    tipoVendedor: [],
    caracteristicas: [],
    blindagem: "",
    leilao: "",
    cores: [],
    carroceria: [],
    opcionais: [],
    ...initialFilters,
  })


  // Opções para os filtros expansíveis
  const combustivelOptions = [
    { value: "flex", label: "Flex (Gasolina/Álcool)", count: 125956 },
    { value: "gasolina", label: "Gasolina", count: 32586 },
    { value: "alcool", label: "Álcool/Etanol", count: 433 },
    { value: "diesel", label: "Diesel", count: 13429 },
    { value: "diesel-s10", label: "Diesel S-10", count: 0 },
    { value: "eletrico", label: "Elétrico", count: 2321 },
    { value: "hibrido", label: "Híbrido", count: 7544 },
    { value: "hibrido-flex", label: "Híbrido Flex", count: 0 },
    { value: "gnv", label: "GNV", count: 178 },
    { value: "gnv-gasolina", label: "GNV/Gasolina", count: 0 },
    { value: "gasolina-gnv", label: "Gasolina/GNV", count: 0 },
    { value: "plug-in-hybrid", label: "Plug-in Hybrid", count: 0 },
  ]

  const finalPlacaOptions = [
    { value: "0", label: "0", count: 0 },
    { value: "1", label: "1", count: 0 },
    { value: "2", label: "2", count: 0 },
    { value: "3", label: "3", count: 0 },
    { value: "4", label: "4", count: 0 },
    { value: "5", label: "5", count: 0 },
    { value: "6", label: "6", count: 0 },
    { value: "7", label: "7", count: 0 },
    { value: "8", label: "8", count: 0 },
    { value: "9", label: "9", count: 0 },
  ]

  const tipoVendedorOptions = [
    { value: "concessionaria", label: "Concessionária", count: 0 },
    { value: "loja", label: "Loja", count: 0 },
    { value: "particular", label: "Particular", count: 0 },
    { value: "revenda", label: "Revenda", count: 0 },
  ]

  const caracteristicasVeiculoOptions = [
    { value: "aceita-troca", label: "Aceita Troca", count: 0 },
    { value: "alienado", label: "Alienado", count: 0 },
    { value: "garantia-fabrica", label: "Garantia de Fábrica", count: 0 },
    { value: "ipva-pago", label: "IPVA Pago", count: 0 },
    { value: "licenciado", label: "Licenciado", count: 0 },
    { value: "revisoes-concessionaria", label: "Revisões na Concessionária", count: 0 },
    { value: "unico-dono", label: "Único Dono", count: 0 },
  ]

  const blindagemOptions = [
    { value: "sim", label: "Sim", count: 0 },
    { value: "nao", label: "Não", count: 0 },
  ]

  const leilaoOptions = [
    { value: "sim", label: "Sim", count: 0 },
    { value: "nao", label: "Não", count: 0 },
  ]

  // Converter arrays existentes para o formato do ExpandableFilterGroup
  const coresOptions = cores.map(cor => ({ value: cor, label: cor, count: 0 }))
  const carroceriaOptions = carrocerias.map(carroceria => ({ value: carroceria, label: carroceria, count: 0 }))
  const opcionaisOptions = opcionais.map(opcional => ({ value: opcional, label: opcional, count: 0 }))

  // Estados para filtros inteligentes
  const [marcas, setMarcas] = useState<Array<{id: string, name: string}>>([])
  const [veiculos, setVeiculos] = useState<Array<{id: string, name: string}>>([])
  const [modelos, setModelos] = useState<Array<{id: string, name: string}>>([])
  const [anos, setAnos] = useState<Array<{id: number, name: string}>>([])
  const [estados, setEstados] = useState<Array<{id: string, name: string}>>([])
  const [cidades, setCidades] = useState<Array<{id: string, name: string}>>([])


  // Função para converter nome do estado para sigla
  const getSiglaEstado = (nomeEstado: string) => {
    const mapeamentoEstados: { [key: string]: string } = {
      'Acre': 'AC',
      'Alagoas': 'AL',
      'Amapá': 'AP',
      'Amazonas': 'AM',
      'Bahia': 'BA',
      'Ceará': 'CE',
      'Distrito Federal': 'DF',
      'Espírito Santo': 'ES',
      'Goiás': 'GO',
      'Maranhão': 'MA',
      'Mato Grosso': 'MT',
      'Mato Grosso do Sul': 'MS',
      'Minas Gerais': 'MG',
      'Pará': 'PA',
      'Paraíba': 'PB',
      'Paraná': 'PR',
      'Pernambuco': 'PE',
      'Piauí': 'PI',
      'Rio de Janeiro': 'RJ',
      'Rio Grande do Norte': 'RN',
      'Rio Grande do Sul': 'RS',
      'Rondônia': 'RO',
      'Roraima': 'RR',
      'Santa Catarina': 'SC',
      'São Paulo': 'SP',
      'Sergipe': 'SE',
      'Tocantins': 'TO'
    }
    return mapeamentoEstados[nomeEstado] || nomeEstado
  }

  // Estados para filtros dependentes
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [availableVersions, setAvailableVersions] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])

  // Carregar dados para filtros inteligentes
  useEffect(() => {
    const carregarMarcas = async () => {
      try {
        const response = await fetch('/api/fipe/marcas')
        const data = await response.json()
        setMarcas(data.map((marca: any) => ({ id: marca.id.toString(), name: marca.name })))
      } catch (error) {
        console.error('Erro ao carregar marcas:', error)
      }
    }
    carregarMarcas()
  }, [])

  // Carregar estados
  useEffect(() => {
    const carregarEstados = async () => {
      try {
        const response = await fetch('/api/estados')
        const data = await response.json()
        const estadosMapeados = data.map((estado: any) => ({ id: estado.nome, name: estado.nome }))
        setEstados(estadosMapeados)
      } catch (error) {
        console.error('Erro ao carregar estados:', error)
      }
    }
    carregarEstados()
  }, [])

  // Carregar cidades baseado no estado selecionado
  useEffect(() => {
    if (filters.estado) {
      const siglaEstado = getSiglaEstado(filters.estado)
      const carregarCidades = async () => {
        try {
          const response = await fetch(`/api/estados/${siglaEstado}/municipios`)
          const data = await response.json()
          const cidadesMapeadas = data.map((municipio: any) => ({ id: municipio.id.toString(), name: municipio.nome }))
          setCidades(cidadesMapeadas)
        } catch (error) {
          console.error('Erro ao carregar cidades:', error)
          setCidades([])
        }
      }
      carregarCidades()
    } else {
      setCidades([])
    }
  }, [filters.estado])

  // Carregar veículos quando marca for selecionada
  useEffect(() => {
    if (filters.marca) {
      const carregarVeiculos = async () => {
        try {
          const response = await fetch(`/api/fipe/modelos?marca=${filters.marca}`)
          const data = await response.json()
          setVeiculos(data.map((veiculo: any) => ({ id: veiculo.id.toString(), name: veiculo.name })))
        } catch (error) {
          console.error('Erro ao carregar veículos:', error)
        }
      }
      carregarVeiculos()
    } else {
      setVeiculos([])
    }
  }, [filters.marca])

  // Carregar anos quando veículo for selecionado
  useEffect(() => {
    if (filters.marca && filters.veiculo) {
      const carregarAnos = async () => {
        try {
          const response = await fetch(`/api/fipe/anos-por-veiculo?marca=${filters.marca}&veiculo=${filters.veiculo}`)
          const data = await response.json()
          setAnos(data.map((item: any) => ({ id: item.ano, name: item.ano.toString() })))
        } catch (error) {
          console.error('Erro ao carregar anos:', error)
        }
      }
      carregarAnos()
    } else {
      setAnos([])
    }
  }, [filters.marca, filters.veiculo])

  // Carregar modelos quando ano for selecionado
  useEffect(() => {
    if (filters.marca && filters.veiculo && filters.anoMin) {
      const carregarModelos = async () => {
        try {
          const response = await fetch(`/api/fipe/modelos-por-ano?marca=${filters.marca}&veiculo=${filters.veiculo}&ano=${filters.anoMin}`)
          const data = await response.json()
          setModelos(data.map((modelo: any) => ({ id: modelo.id.toString(), name: modelo.name })))
        } catch (error) {
          console.error('Erro ao carregar modelos:', error)
        }
      }
      carregarModelos()
    } else {
      setModelos([])
    }
  }, [filters.marca, filters.veiculo, filters.anoMin])




  const handleFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
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

      {/* Campo de busca por termo */}
      <div>
        <Label htmlFor="termo" className="text-sm text-gray-300">
          Buscar por termo
        </Label>
        <Input
          type="text"
          placeholder="Ex: Corolla, Honda, 2020..."
          value={filters.termo || ""}
          onChange={(e) => handleFilterChange("termo", e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1">
          Busca em marca, modelo, versão e descrição
        </p>
      </div>

      {/* Localização */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="estado" className="text-sm text-gray-300">
            Estado
          </Label>
          <SmartFilterInput
            options={estados}
            value={filters.estado || ""}
            onChange={(value) => {
              handleFilterChange("estado", value === "" ? undefined : value)
              handleFilterChange("cidade", undefined)
            }}
            placeholder="Digite ou selecione o estado"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="cidade" className="text-sm text-gray-300">
            Cidade
          </Label>
          <SmartFilterInput
            options={cidades}
            value={filters.cidade || ""}
            onChange={(value) => handleFilterChange("cidade", value === "" ? undefined : value)}
            placeholder={filters.estado ? "Digite ou selecione a cidade" : "Primeiro selecione o estado"}
            disabled={!filters.estado}
            className="bg-gray-800 border-gray-700 text-white"
          />
          {cidades.length === 0 && filters.estado && (
            <p className="text-sm text-gray-400 mt-1">Nenhuma opção encontrada</p>
          )}
        </div>
      </div>

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
        <SmartFilterInput
          options={marcas}
          value={filters.marca || ""}
          onChange={(value) => {
            handleFilterChange("marca", value === "" ? undefined : value)
            handleFilterChange("veiculo", undefined)
            handleFilterChange("anoMin", undefined)
            handleFilterChange("anoMax", undefined)
            handleFilterChange("modelo", undefined)
          }}
          placeholder="Digite ou selecione a marca"
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {/* Veículo */}
      <div>
        <Label htmlFor="veiculo" className="text-sm text-gray-300">
          Veículo
        </Label>
        <SmartFilterInput
          options={veiculos}
          value={filters.veiculo || ""}
          onChange={(value) => {
            handleFilterChange("veiculo", value === "" ? undefined : value)
            handleFilterChange("anoMin", undefined)
            handleFilterChange("anoMax", undefined)
            handleFilterChange("modelo", undefined)
          }}
          placeholder={filters.marca ? "Digite ou selecione o veículo" : "Primeiro selecione a marca"}
          disabled={!filters.marca}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {/* Ano */}
      <div>
        <Label className="text-sm text-gray-300">Ano</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <Label htmlFor="anoMin" className="text-xs text-gray-400">
              Ano mín.
            </Label>
            <SmartFilterInput
              options={anos}
              value={filters.anoMin?.toString() || ""}
              onChange={(value) => {
                handleFilterChange("anoMin", value ? Number(value) : undefined)
                handleFilterChange("modelo", undefined)
              }}
              placeholder={filters.veiculo ? "Ano mín." : "Primeiro selecione o veículo"}
              disabled={!filters.veiculo}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="anoMax" className="text-xs text-gray-400">
              Ano máx.
            </Label>
            <SmartFilterInput
              options={anos}
              value={filters.anoMax?.toString() || ""}
              onChange={(value) => handleFilterChange("anoMax", value ? Number(value) : undefined)}
              placeholder={filters.veiculo ? "Ano máx." : "Primeiro selecione o veículo"}
              disabled={!filters.veiculo}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
      </div>

      {/* Modelo */}
      <div>
        <Label htmlFor="modelo" className="text-sm text-gray-300">
          Modelo
        </Label>
        <SmartFilterInput
          options={modelos}
          value={filters.modelo || ""}
          onChange={(value) => handleFilterChange("modelo", value === "" ? undefined : value)}
          placeholder={filters.veiculo && filters.anoMin ? "Digite ou selecione o modelo" : "Primeiro selecione veículo e ano"}
          disabled={!filters.veiculo || !filters.anoMin}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {/* Preço */}
      <div>
        <Label className="text-sm text-gray-300">Preço (R$)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            type="text"
            placeholder="Preço mínimo"
            value={filters.precoMin ? filters.precoMin.toLocaleString('pt-BR') : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\./g, '').replace(',', '.')
              const numericValue = value ? Number(value) : undefined
              handleFilterChange("precoMin", numericValue)
            }}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <Input
            type="text"
            placeholder="Preço máximo"
            value={filters.precoMax ? filters.precoMax.toLocaleString('pt-BR') : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\./g, '').replace(',', '.')
              const numericValue = value ? Number(value) : undefined
              handleFilterChange("precoMax", numericValue)
            }}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        {/* Pré-seleções inteligentes */}
        <div className="mt-3">
          <Label className="text-xs text-gray-400 mb-2 block">Pré-seleções rápidas</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                handleFilterChange("precoMin", undefined)
                handleFilterChange("precoMax", undefined)
              }}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Qualquer preço
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("precoMax", 50000)}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Até 50 mil
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("precoMax", 70000)}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Até 70 mil
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("precoMax", 80000)}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Até 80 mil
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("precoMax", 100000)}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Até 100 mil
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("precoMax", 150000)}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Até 150 mil
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => handleFilterChange("precoMax", 200000)}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Até 200 mil
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("precoMax", 999999)}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              + 200 mil
            </button>
          </div>
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
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Input
              placeholder="KM máx."
              type="number"
              value={filters.kmMax || ""}
              onChange={(e) => handleFilterChange("kmMax", e.target.value ? Number(e.target.value) : undefined)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
      <ExpandableFilterGroup
        title="Combustível"
        options={combustivelOptions}
        selectedValues={filters.combustivel || []}
        onSelectionChange={(values) => handleFilterChange("combustivel", values)}
      />

      {/* Final da Placa */}
      <ExpandableFilterGroup
        title="Final da Placa"
        options={finalPlacaOptions}
        selectedValues={filters.finalPlaca ? [filters.finalPlaca] : []}
        onSelectionChange={(values) => handleFilterChange("finalPlaca", values[0] || "")}
      />

      {/* Tipo de Vendedor */}
      <ExpandableFilterGroup
        title="Tipo de Vendedor"
        options={tipoVendedorOptions}
        selectedValues={filters.tipoVendedor || []}
        onSelectionChange={(values) => handleFilterChange("tipoVendedor", values)}
      />

      {/* Características do Veículo */}
      <ExpandableFilterGroup
        title="Características do Veículo"
        options={caracteristicasVeiculoOptions}
        selectedValues={filters.caracteristicas || []}
        onSelectionChange={(values) => handleFilterChange("caracteristicas", values)}
      />

      {/* Blindagem */}
      <ExpandableFilterGroup
        title="Blindagem"
        options={blindagemOptions}
        selectedValues={filters.blindagem ? [filters.blindagem] : []}
        onSelectionChange={(values) => handleFilterChange("blindagem", values[0] || "")}
      />

      {/* Leilão */}
      <ExpandableFilterGroup
        title="Leilão"
        options={leilaoOptions}
        selectedValues={filters.leilao ? [filters.leilao] : []}
        onSelectionChange={(values) => handleFilterChange("leilao", values[0] || "")}
      />

      {/* Cor */}
      <ExpandableFilterGroup
        title="Cor"
        options={coresOptions}
        selectedValues={filters.cores || []}
        onSelectionChange={(values) => handleFilterChange("cores", values)}
      />

      {/* Carroceria */}
      <ExpandableFilterGroup
        title="Carroceria"
        options={carroceriaOptions}
        selectedValues={filters.carroceria || []}
        onSelectionChange={(values) => handleFilterChange("carroceria", values)}
      />

      {/* Opcionais */}
      <ExpandableFilterGroup
        title="Opcionais"
        options={opcionaisOptions}
        selectedValues={filters.opcionais || []}
        onSelectionChange={(values) => handleFilterChange("opcionais", values)}
      />

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
