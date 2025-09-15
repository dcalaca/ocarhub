"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { VehicleCard } from "@/components/vehicle-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Heart,
  Grid3X3,
  List,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  DollarSign,
  Car,
  Sparkles,
} from "lucide-react"
import type { Vehicle } from "@/types"
import { VehiclesService } from "@/lib/vehicles-service"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface FavoriteFilters {
  busca?: string
  marca?: string
  precoMin?: number
  precoMax?: number
  anoMin?: number
  anoMax?: number
  ordenacao: "data-add" | "preco-asc" | "preco-desc" | "ano-desc" | "marca"
}

export default function FavoritesPage() {
  const { user, userInteractions, toggleFavorito } = useAuth()
  const { toast } = useToast()

  // Estados principais
  const [favoriteVehicles, setFavoriteVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  // Estados da interface
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  // Estados dos filtros
  const [filters, setFilters] = useState<FavoriteFilters>({
    ordenacao: "data-add",
  })

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    valorTotal: 0,
    precoMedio: 0,
    marcaMaisComum: "",
  })

  useEffect(() => {
    if (user) {
      loadFavorites()
    } else {
      setLoading(false)
    }
  }, [user, userInteractions.favoritos])

  useEffect(() => {
    applyFilters()
  }, [favoriteVehicles, filters])

  const loadFavorites = async () => {
    if (!user) return
    
    setLoading(true)
    console.log("🔍 Carregando favoritos do usuário...")

    try {
      // Buscar favoritos do usuário do Supabase
      const favoritesData = await VehiclesService.getUserFavorites(user.id)
      
      // Adiciona data de quando foi favoritado (simulado por enquanto)
      const favoritesWithDate = favoritesData.map((vehicle) => ({
        ...vehicle,
        dataFavoritado: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
      }))

      setFavoriteVehicles(favoritesWithDate)
      calculateStats(favoritesWithDate)
      console.log(`✅ ${favoritesWithDate.length} favoritos carregados do Supabase`)
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error)
      setFavoriteVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (vehicles: Vehicle[]) => {
    const total = vehicles.length
    const valorTotal = vehicles.reduce((sum, v) => sum + v.preco, 0)
    const precoMedio = total > 0 ? valorTotal / total : 0

    // Marca mais comum
    const marcas = vehicles.reduce(
      (acc, v) => {
        acc[v.marca] = (acc[v.marca] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const marcaMaisComum = Object.entries(marcas).sort(([, a], [, b]) => b - a)[0]?.[0] || ""

    setStats({
      total,
      valorTotal,
      precoMedio,
      marcaMaisComum,
    })
  }

  const applyFilters = () => {
    let filtered = [...favoriteVehicles]

    // Filtro de busca
    if (filters.busca) {
      const searchTerm = filters.busca.toLowerCase()
      filtered = filtered.filter(
        (v) =>
          v.marca.toLowerCase().includes(searchTerm) ||
          v.modelo.toLowerCase().includes(searchTerm) ||
          v.cidade.toLowerCase().includes(searchTerm),
      )
    }

    // Filtro de marca
    if (filters.marca) {
      filtered = filtered.filter((v) => v.marca === filters.marca)
    }

    // Filtros de preço
    if (filters.precoMin) {
      filtered = filtered.filter((v) => v.preco >= filters.precoMin!)
    }
    if (filters.precoMax) {
      filtered = filtered.filter((v) => v.preco <= filters.precoMax!)
    }

    // Filtros de ano
    if (filters.anoMin) {
      filtered = filtered.filter((v) => v.ano >= filters.anoMin!)
    }
    if (filters.anoMax) {
      filtered = filtered.filter((v) => v.ano <= filters.anoMax!)
    }

    // Ordenação
    switch (filters.ordenacao) {
      case "data-add":
        filtered.sort((a, b) => (b as any).dataFavoritado?.getTime() - (a as any).dataFavoritado?.getTime())
        break
      case "preco-asc":
        filtered.sort((a, b) => a.preco - b.preco)
        break
      case "preco-desc":
        filtered.sort((a, b) => b.preco - a.preco)
        break
      case "ano-desc":
        filtered.sort((a, b) => b.ano - a.ano)
        break
      case "marca":
        filtered.sort((a, b) => a.marca.localeCompare(b.marca))
        break
    }

    setFilteredVehicles(filtered)
  }

  const handleFilterChange = (key: keyof FavoriteFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ ordenacao: "data-add" })
  }

  const handleRemoveFavorite = async (vehicleId: string) => {
    await toggleFavorito(vehicleId)

    setFavoriteVehicles((prev) => {
      const updated = prev.filter((v) => v.id !== vehicleId)
      calculateStats(updated)
      return updated
    })

    toast({
      title: "Removido dos favoritos",
      description: "Veículo removido da sua lista de favoritos",
    })
  }

  const clearAllFavorites = () => {
    setFavoriteVehicles([])
    setStats({ total: 0, valorTotal: 0, precoMedio: 0, marcaMaisComum: "" })

    toast({
      title: "Favoritos limpos",
      description: "Todos os veículos foram removidos dos favoritos",
    })
  }

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "ordenacao") return false
      return value !== undefined && value !== null && value !== ""
    }).length
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getMarcasUnicas = () => {
    const marcas = [...new Set(favoriteVehicles.map((v) => v.marca))].sort()
    return marcas
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Faça login para ver seus favoritos</h1>
            <p className="text-muted-foreground mb-6">
              Entre na sua conta para acessar sua lista de veículos favoritos
            </p>
            <Button asChild>
              <a href="/login">Fazer Login</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Meus Favoritos</h1>
              <p className="text-slate-300">
                {stats.total > 0
                  ? `${stats.total} veículo${stats.total > 1 ? "s" : ""} na sua lista de favoritos`
                  : "Sua lista de favoritos está vazia"}
              </p>
            </div>
          </div>

          {/* Estatísticas */}
          {stats.total > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Car className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-sm text-slate-300">Veículos</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{formatPrice(stats.valorTotal)}</div>
                  <div className="text-sm text-slate-300">Valor Total</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{formatPrice(stats.precoMedio)}</div>
                  <div className="text-sm text-slate-300">Preço Médio</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.marcaMaisComum}</div>
                  <div className="text-sm text-slate-300">Marca Favorita</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {favoriteVehicles.length === 0 ? (
          /* Estado vazio */
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h3>
            <p className="text-muted-foreground mb-6">
              Comece a favoritar veículos para vê-los aqui. Use o ❤️ nos anúncios para adicionar aos favoritos.
            </p>
            <Button asChild>
              <a href="/buscar">Buscar Veículos</a>
            </Button>
          </Card>
        ) : (
          <>
            {/* Controles */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {showFilters ? "Ocultar" : "Mostrar"} Filtros
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>

                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFavorites}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Todos
                </Button>
              </div>

              <Select value={filters.ordenacao} onValueChange={(value: any) => handleFilterChange("ordenacao", value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data-add">Adicionados recentemente</SelectItem>
                  <SelectItem value="preco-asc">Menor preço</SelectItem>
                  <SelectItem value="preco-desc">Maior preço</SelectItem>
                  <SelectItem value="ano-desc">Mais novos</SelectItem>
                  <SelectItem value="marca">Marca (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros */}
            {showFilters && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filtros
                    </span>
                    {getActiveFiltersCount() > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="w-4 h-4 mr-2" />
                        Limpar
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="busca">Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="busca"
                          placeholder="Marca, modelo, cidade..."
                          value={filters.busca || ""}
                          onChange={(e) => handleFilterChange("busca", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="marca">Marca</Label>
                      <Select value={filters.marca} onValueChange={(value) => handleFilterChange("marca", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas as marcas" />
                        </SelectTrigger>
                        <SelectContent>
                          {getMarcasUnicas().map((marca) => (
                            <SelectItem key={marca} value={marca}>
                              {marca}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Preço</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.precoMin || ""}
                          onChange={(e) => handleFilterChange("precoMin", Number.parseInt(e.target.value) || undefined)}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.precoMax || ""}
                          onChange={(e) => handleFilterChange("precoMax", Number.parseInt(e.target.value) || undefined)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Ano</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.anoMin || ""}
                          onChange={(e) => handleFilterChange("anoMin", Number.parseInt(e.target.value) || undefined)}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.anoMax || ""}
                          onChange={(e) => handleFilterChange("anoMax", Number.parseInt(e.target.value) || undefined)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de favoritos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Mostrando {filteredVehicles.length} de {favoriteVehicles.length} favoritos
                </span>
              </div>

              {filteredVehicles.length > 0 ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                  }`}
                >
                  {filteredVehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onFavorite={handleRemoveFavorite}
                      showRemoveFromFavorites={true}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum favorito encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar os filtros para encontrar seus veículos favoritos
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
