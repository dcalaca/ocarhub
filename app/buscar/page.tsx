"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { VehicleCard } from "@/components/vehicle-card"
import {
  AdvancedSearchFilters,
  type AdvancedSearchFilters as SearchFiltersType,
} from "@/components/advanced-search-filters"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Filter,
  Grid3X3,
  List,
  MapPin,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react"
import type { Vehicle } from "@/types"
import { VehiclesService } from "@/lib/vehicles-service"

function SearchPageContent() {
  const searchParams = useSearchParams()

  // Estados principais
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFilters, setCurrentFilters] = useState<SearchFiltersType>({
    ordenacao: "relevancia",
  })

  // Estados da interface
  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Estatísticas
  const [searchStats, setSearchStats] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    showing: 0,
  })

  // Carrega veículos na inicialização
  useEffect(() => {
    loadVehicles()
  }, [])

  // Aplica filtros da URL na inicialização
  useEffect(() => {
    const urlFilters = parseUrlFilters()
    if (Object.keys(urlFilters).length > 0) {
      setCurrentFilters((prev) => ({ ...prev, ...urlFilters }))
    }
  }, [searchParams])

  useEffect(() => {
    // Remover qualquer flag que possa estar causando redirecionamento
    sessionStorage.removeItem("fromSearch")
  }, [])

  // Aplica filtros quando mudam
  useEffect(() => {
    applyFilters()
  }, [vehicles, currentFilters, currentPage, itemsPerPage])

  const loadVehicles = async () => {
    setLoading(true)
    console.log("🔍 Carregando veículos para busca...")

    try {
      const vehiclesData = await VehiclesService.getVehicles({
        status: 'ativo',
        limit: 100 // Carregar mais veículos para busca
      })
      
      setVehicles(vehiclesData)
      console.log(`✅ ${vehiclesData.length} veículos carregados do Supabase`)
    } catch (error) {
      console.error('❌ Erro ao carregar veículos:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const parseUrlFilters = (): Partial<SearchFiltersType> => {
    const filters: Partial<SearchFiltersType> = {}

    // Parse dos parâmetros da URL
    const brand = searchParams.get("brand")
    const model = searchParams.get("model")
    const year = searchParams.get("year")
    const priceMin = searchParams.get("precoMin")
    const priceMax = searchParams.get("precoMax")
    const city = searchParams.get("cidade")
    const plan = searchParams.get("plano")

    if (brand) filters.marca = brand
    if (model) filters.modelo = model
    if (year) filters.anoMin = Number.parseInt(year)
    if (priceMin) filters.precoMin = Number.parseInt(priceMin)
    if (priceMax) filters.precoMax = Number.parseInt(priceMax)
    if (city) filters.cidade = city

    return filters
  }

  const applyFilters = () => {
    let filtered = [...vehicles]

    // Aplicar filtros
    if (currentFilters.marca) {
      filtered = filtered.filter((v) => v.marca.toLowerCase().includes(currentFilters.marca!.toLowerCase()))
    }

    if (currentFilters.modelo) {
      filtered = filtered.filter((v) => v.modelo.toLowerCase().includes(currentFilters.modelo!.toLowerCase()))
    }

    if (currentFilters.anoMin) {
      filtered = filtered.filter((v) => v.ano >= currentFilters.anoMin!)
    }

    if (currentFilters.anoMax) {
      filtered = filtered.filter((v) => v.ano <= currentFilters.anoMax!)
    }

    if (currentFilters.precoMin) {
      filtered = filtered.filter((v) => v.preco >= currentFilters.precoMin!)
    }

    if (currentFilters.precoMax) {
      filtered = filtered.filter((v) => v.preco <= currentFilters.precoMax!)
    }

    if (currentFilters.cidade) {
      filtered = filtered.filter((v) => v.cidade.toLowerCase().includes(currentFilters.cidade!.toLowerCase()))
    }

    if (currentFilters.combustivel && currentFilters.combustivel.length > 0) {
      filtered = filtered.filter((v) => v.combustivel.some((c) => currentFilters.combustivel!.includes(c)))
    }

    if (currentFilters.cambio) {
      filtered = filtered.filter((v) => v.cambio === currentFilters.cambio)
    }

    // Aplicar filtros de arrays (combustível, cores, etc.)
    if (currentFilters.cores && currentFilters.cores.length > 0) {
      filtered = filtered.filter((v) => currentFilters.cores!.includes(v.cor))
    }

    if (currentFilters.carroceria && currentFilters.carroceria.length > 0) {
      filtered = filtered.filter((v) => currentFilters.carroceria!.some((c) => v.categoria === c))
    }

    if (currentFilters.opcionais && currentFilters.opcionais.length > 0) {
      filtered = filtered.filter((v) => currentFilters.opcionais!.some((opcional) => v.opcionais.includes(opcional)))
    }

    if (currentFilters.tipoVendedor && currentFilters.tipoVendedor.length > 0) {
      // Simular tipo de vendedor baseado no ID do dono
      filtered = filtered.filter((v) => {
        const isParticular = v.donoId.includes("user")
        const isLoja = v.donoId.includes("dealer")

        if (currentFilters.tipoVendedor!.includes("Particular") && isParticular) return true
        if (currentFilters.tipoVendedor!.includes("Loja") && isLoja) return true
        if (currentFilters.tipoVendedor!.includes("Concessionária") && !isParticular && !isLoja) return true
        return false
      })
    }

    // Filtros de quilometragem personalizada
    if (currentFilters.kmMin) {
      filtered = filtered.filter((v) => v.quilometragem >= currentFilters.kmMin!)
    }

    if (currentFilters.kmMax) {
      filtered = filtered.filter((v) => v.quilometragem <= currentFilters.kmMax!)
    }

    // Filtros avançados
    if (currentFilters.blindagem) {
      const temBlindagem = currentFilters.blindagem === "sim"
      filtered = filtered.filter((v) => v.opcionais.includes("Blindagem") === temBlindagem)
    }

    if (currentFilters.caracteristicas && currentFilters.caracteristicas.length > 0) {
      filtered = filtered.filter((v) => currentFilters.caracteristicas!.some((carac) => v.opcionais.includes(carac)))
    }

    // Aplicar ordenação
    switch (currentFilters.ordenacao) {
      case "preco-asc":
        filtered.sort((a, b) => a.preco - b.preco)
        break
      case "preco-desc":
        filtered.sort((a, b) => b.preco - a.preco)
        break
      case "data-desc":
        filtered.sort((a, b) => b.dataCadastro.getTime() - a.dataCadastro.getTime())
        break
      case "km-asc":
        filtered.sort((a, b) => a.quilometragem - b.quilometragem)
        break
      default: // relevancia
        filtered.sort((a, b) => {
          // Prioriza veículos verificados e em destaque
          const scoreA = (a.verificado ? 2 : 0) + (a.plano === "destaque" ? 1 : 0)
          const scoreB = (b.verificado ? 2 : 0) + (b.plano === "destaque" ? 1 : 0)
          return scoreB - scoreA
        })
    }

    // Calcular estatísticas
    const total = filtered.length
    const pages = Math.ceil(total / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedVehicles = filtered.slice(startIndex, endIndex)

    setFilteredVehicles(paginatedVehicles)
    setSearchStats({
      total,
      pages,
      currentPage,
      showing: paginatedVehicles.length,
    })
  }

  const handleSearch = (filters: SearchFiltersType) => {
    setCurrentFilters(filters)
    setCurrentPage(1) // Reset para primeira página

    // Atualizar URL
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "relevancia") {
        params.set(key, value.toString())
      }
    })

    const newUrl = `/buscar${params.toString() ? `?${params.toString()}` : ""}`
    window.history.pushState({}, "", newUrl)
  }

  const clearFilters = () => {
    setCurrentFilters({ ordenacao: "relevancia" })
    setCurrentPage(1)
    window.history.pushState({}, "", "/buscar")
  }

  const getActiveFiltersCount = () => {
    return Object.entries(currentFilters).filter(([key, value]) => {
      if (key === "ordenacao") return false
      if (Array.isArray(value)) return value.length > 0
      return value !== undefined && value !== null && value !== ""
    }).length
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
              <p className="text-purple-100">Carregando veículos...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section da Busca */}
      <div className="relative bg-gradient-to-r from-purple-900/90 to-purple-600/90 text-white py-8 pb-4">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-white">
              Buscar Veículos
            </h1>
            <div className="flex items-center justify-center gap-2 text-purple-100">
              <Sparkles className="w-5 h-5" />
              <span className="text-lg">
                {searchStats.total > 0
                  ? `${searchStats.total} veículo${searchStats.total > 1 ? "s" : ""} encontrado${searchStats.total > 1 ? "s" : ""}`
                  : "Nenhum veículo encontrado"}
              </span>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Barra de controles - movida para dentro da seção hero */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {showFilters ? "Ocultar" : "Mostrar"} Filtros
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-purple-500 text-white">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
                <span className="text-sm text-purple-100">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, searchStats.total)} de {searchStats.total}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/20 rounded-lg bg-white/10">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none bg-transparent hover:bg-white/20 text-white"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none bg-transparent hover:bg-white/20 text-white"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select
                  value={currentFilters.ordenacao}
                  onValueChange={(value: any) => handleSearch({ ...currentFilters, ordenacao: value })}
                >
                  <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevancia">Relevância</SelectItem>
                    <SelectItem value="data-desc">Mais recentes</SelectItem>
                    <SelectItem value="preco-asc">Menor preço</SelectItem>
                    <SelectItem value="preco-desc">Maior preço</SelectItem>
                    <SelectItem value="km-asc">Menor quilometragem</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-full sm:w-32 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 por página</SelectItem>
                    <SelectItem value="24">24 por página</SelectItem>
                    <SelectItem value="48">48 por página</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Filtros ativos */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-4">
              <span className="text-sm text-purple-100">Filtros ativos:</span>
              {currentFilters.marca && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 text-white">
                  Marca: {currentFilters.marca}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleSearch({ ...currentFilters, marca: undefined })}
                  />
                </Badge>
              )}
              {currentFilters.modelo && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 text-white">
                  Modelo: {currentFilters.modelo}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleSearch({ ...currentFilters, modelo: undefined })}
                  />
                </Badge>
              )}
              {currentFilters.cidade && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 text-white">
                  <MapPin className="w-3 h-3" />
                  {currentFilters.cidade}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleSearch({ ...currentFilters, cidade: undefined })}
                  />
                </Badge>
              )}
              {(currentFilters.precoMin || currentFilters.precoMax) && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 text-white">
                  Preço: {currentFilters.precoMin ? formatPrice(currentFilters.precoMin) : "Min"} -{" "}
                  {currentFilters.precoMax ? formatPrice(currentFilters.precoMax) : "Max"}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleSearch({ ...currentFilters, precoMin: undefined, precoMax: undefined })}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-purple-100 hover:text-white"
              >
                Limpar todos
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de filtros */}
          {showFilters && (
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <div className="lg:sticky lg:top-8">
                <AdvancedSearchFilters onSearch={handleSearch} initialFilters={currentFilters} />
              </div>
            </div>
          )}

          {/* Área principal */}
          <div className="flex-1 min-w-0">
            {/* Lista de veículos */}
            {filteredVehicles.length > 0 ? (
              <>
                <div
                  className={`grid gap-4 sm:gap-6 ${
                    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                  }`}
                >
                  {filteredVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} viewMode={viewMode} />
                  ))}
                </div>

                {/* Paginação */}
                {searchStats.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, searchStats.pages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`w-10 ${
                              page === currentPage
                                ? "bg-purple-600 text-white"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                            }`}
                          >
                            {page}
                          </Button>
                        )
                      })}

                      {searchStats.pages > 5 && (
                        <>
                          <span className="px-2 text-purple-100">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(searchStats.pages)}
                            className="w-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            {searchStats.pages}
                          </Button>
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === searchStats.pages}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Estado vazio */
              <Card className="p-12 text-center bg-white/10 backdrop-blur-sm border-white/20">
                <div className="max-w-md mx-auto">
                  <Filter className="w-16 h-16 text-purple-200 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Nenhum veículo encontrado</h3>
                  <p className="text-purple-100 mb-6">
                    Tente ajustar os filtros ou remover algumas restrições para ver mais resultados.
                  </p>
                  <Button onClick={clearFilters} className="bg-purple-600 hover:bg-purple-700 text-white">
                    Limpar todos os filtros
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
