"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Car,
  Eye,
  MessageCircle,
  Heart,
  MoreVertical,
  Edit,
  Pause,
  Play,
  Trash2,
  Calendar,
  MapPin,
  Search,
  Plus,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import type { Vehicle } from "@/types"

// Mock data para anúncios do usuário
const mockUserVehicles: (Vehicle & {
  visualizacoes: number
  contatos: number
  favoritos: number
  dataExpiracao: Date
})[] = [
  {
    id: "1",
    donoId: "user123",
    marca: "Toyota",
    modelo: "Corolla",
    ano: 2022,
    preco: 95000,
    quilometragem: 25000,
    combustivel: "Flex",
    cambio: "Automático",
    cor: "Prata",
    cidade: "São Paulo",
    estado: "SP",
    fotos: ["/placeholder.svg?height=200&width=300"],
    dataCadastro: new Date("2024-01-15"),
    status: "ativo",
    plano: "destaque",
    fipe: 98000,
    descricao: "Corolla XEI 2022 em excelente estado, único dono, todas as revisões em dia.",
    visualizacoes: 1250,
    contatos: 45,
    favoritos: 23,
    dataExpiracao: new Date("2024-02-15"),
  },
  {
    id: "2",
    donoId: "user123",
    marca: "Honda",
    modelo: "Civic",
    ano: 2021,
    preco: 85000,
    quilometragem: 35000,
    combustivel: "Flex",
    cambio: "Manual",
    cor: "Branco",
    cidade: "São Paulo",
    estado: "SP",
    fotos: ["/placeholder.svg?height=200&width=300"],
    dataCadastro: new Date("2024-01-10"),
    status: "pausado",
    plano: "gratuito",
    fipe: 87000,
    descricao: "Civic LX 2021, segundo dono, bem conservado.",
    visualizacoes: 680,
    contatos: 18,
    favoritos: 12,
    dataExpiracao: new Date("2024-02-10"),
  },
  {
    id: "3",
    donoId: "user123",
    marca: "Volkswagen",
    modelo: "Jetta",
    ano: 2020,
    preco: 75000,
    quilometragem: 45000,
    combustivel: "Flex",
    cambio: "Automático",
    cor: "Preto",
    cidade: "São Paulo",
    estado: "SP",
    fotos: ["/placeholder.svg?height=200&width=300"],
    dataCadastro: new Date("2023-12-20"),
    status: "expirado",
    plano: "gratuito",
    fipe: 78000,
    descricao: "Jetta Comfortline 2020, muito bem cuidado.",
    visualizacoes: 420,
    contatos: 8,
    favoritos: 5,
    dataExpiracao: new Date("2024-01-20"),
  },
]

export default function MeusAnunciosPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [anuncios, setAnuncios] = useState(mockUserVehicles)
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "pausado" | "expirado">("todos")
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState(false)

  const anunciosFiltrados = anuncios.filter((anuncio) => {
    const matchStatus = filtroStatus === "todos" || anuncio.status === filtroStatus
    const matchBusca =
      busca === "" ||
      anuncio.marca.toLowerCase().includes(busca.toLowerCase()) ||
      anuncio.modelo.toLowerCase().includes(busca.toLowerCase())
    return matchStatus && matchBusca
  })

  const estatisticas = {
    total: anuncios.length,
    ativos: anuncios.filter((a) => a.status === "ativo").length,
    pausados: anuncios.filter((a) => a.status === "pausado").length,
    expirados: anuncios.filter((a) => a.status === "expirado").length,
    totalVisualizacoes: anuncios.reduce((acc, a) => acc + a.visualizacoes, 0),
    totalContatos: anuncios.reduce((acc, a) => acc + a.contatos, 0),
    totalFavoritos: anuncios.reduce((acc, a) => acc + a.favoritos, 0),
  }

  const handlePausar = async (id: string) => {
    setLoading(true)
    // Simular API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setAnuncios((prev) => prev.map((a) => (a.id === id ? { ...a, status: "pausado" as const } : a)))

    toast({
      title: "Anúncio pausado",
      description: "Seu anúncio foi pausado com sucesso",
    })
    setLoading(false)
  }

  const handleReativar = async (id: string) => {
    setLoading(true)
    // Simular API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setAnuncios((prev) => prev.map((a) => (a.id === id ? { ...a, status: "ativo" as const } : a)))

    toast({
      title: "Anúncio reativado",
      description: "Seu anúncio foi reativado com sucesso",
    })
    setLoading(false)
  }

  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return

    setLoading(true)
    // Simular API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setAnuncios((prev) => prev.filter((a) => a.id !== id))

    toast({
      title: "Anúncio excluído",
      description: "Seu anúncio foi excluído com sucesso",
    })
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
      case "pausado":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pausado</Badge>
      case "expirado":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expirado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlanoBadge = (plano: string) => {
    switch (plano) {
      case "destaque":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Destaque</Badge>
      case "premium":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Premium</Badge>
      default:
        return <Badge variant="outline">Gratuito</Badge>
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Login necessário</h1>
          <p className="text-muted-foreground mb-6">Você precisa estar logado para ver seus anúncios</p>
          <Button asChild>
            <Link href="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Meus Anúncios</h1>
            <p className="text-muted-foreground">Gerencie todos os seus anúncios de veículos</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/anunciar" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Anúncio
            </Link>
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-6">
          <Card className="col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{estatisticas.total}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{estatisticas.ativos}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Ativos</div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{estatisticas.pausados}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Pausados</div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-red-600">{estatisticas.expirados}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Expirados</div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">
                {estatisticas.totalVisualizacoes.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Visualizações</div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{estatisticas.totalContatos}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Contatos</div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-pink-600">{estatisticas.totalFavoritos}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Favoritos</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por marca ou modelo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs
            value={filtroStatus}
            onValueChange={(value) => setFiltroStatus(value as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="todos" className="text-xs sm:text-sm">
                Todos
              </TabsTrigger>
              <TabsTrigger value="ativo" className="text-xs sm:text-sm">
                Ativos
              </TabsTrigger>
              <TabsTrigger value="pausado" className="text-xs sm:text-sm">
                Pausados
              </TabsTrigger>
              <TabsTrigger value="expirado" className="text-xs sm:text-sm">
                Expirados
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Lista de anúncios */}
        {anunciosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum anúncio encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {busca ? "Tente ajustar os filtros de busca" : "Você ainda não tem anúncios cadastrados"}
              </p>
              <Button asChild>
                <Link href="/anunciar">Criar Primeiro Anúncio</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {anunciosFiltrados.map((anuncio) => (
              <Card key={anuncio.id} className="overflow-hidden">
                <div className="relative">
                  <Image
                    src={anuncio.fotos[0] || "/placeholder.svg"}
                    alt={`${anuncio.marca} ${anuncio.modelo}`}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    {getStatusBadge(anuncio.status)}
                    {getPlanoBadge(anuncio.plano)}
                  </div>
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/veiculo/${anuncio.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Anúncio
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/anunciar?edit=${anuncio.id}`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        {anuncio.status === "ativo" ? (
                          <DropdownMenuItem onClick={() => handlePausar(anuncio.id)} disabled={loading}>
                            <Pause className="mr-2 h-4 w-4" />
                            Pausar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleReativar(anuncio.id)} disabled={loading}>
                            <Play className="mr-2 h-4 w-4" />
                            Reativar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleExcluir(anuncio.id)}
                          disabled={loading}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg">
                      {anuncio.marca} {anuncio.modelo} {anuncio.ano}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {anuncio.cidade}, {anuncio.estado}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-green-600">
                      {anuncio.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                    {anuncio.fipe && (
                      <div className="text-sm text-muted-foreground">
                        FIPE: {anuncio.fipe.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div className="flex flex-col items-center">
                      <Eye className="w-4 h-4 text-blue-600 mb-1" />
                      <span className="font-semibold">{anuncio.visualizacoes}</span>
                      <span className="text-xs text-muted-foreground">Visualizações</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <MessageCircle className="w-4 h-4 text-green-600 mb-1" />
                      <span className="font-semibold">{anuncio.contatos}</span>
                      <span className="text-xs text-muted-foreground">Contatos</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Heart className="w-4 h-4 text-red-600 mb-1" />
                      <span className="font-semibold">{anuncio.favoritos}</span>
                      <span className="text-xs text-muted-foreground">Favoritos</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Expira em {anuncio.dataExpiracao.toLocaleDateString("pt-BR")}
                    </div>
                    <div>Publicado em {anuncio.dataCadastro.toLocaleDateString("pt-BR")}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
