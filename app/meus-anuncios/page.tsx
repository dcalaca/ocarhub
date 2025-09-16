"use client"

import { useState, useEffect } from "react"
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
  Clock,
  RefreshCw,
  Star,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { VehicleService, type Vehicle } from "@/lib/vehicle-service"

export default function MeusAnunciosPage() {
  const { user, debitSaldo } = useAuth()
  const { toast } = useToast()
  const [anuncios, setAnuncios] = useState<Vehicle[]>([])
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "pausado" | "expirado">("todos")
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState(true)

  // Carregar anúncios do usuário
  useEffect(() => {
    const loadAnuncios = async () => {
      console.log('🔍 useEffect executado - user:', user)
      if (!user?.id) {
        console.log('❌ Usuário não encontrado ou sem ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('🚗 Carregando anúncios do usuário:', user.id)
        const veiculos = await VehicleService.getUserVehicles(user.id)
        console.log('✅ Anúncios carregados:', veiculos)
        setAnuncios(veiculos)
      } catch (error) {
        console.error('❌ Erro ao carregar anúncios:', error)
        toast({
          title: "Erro ao carregar anúncios",
          description: "Não foi possível carregar seus anúncios. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    // Aguardar um pouco para garantir que o usuário foi carregado
    const timeoutId = setTimeout(loadAnuncios, 100)
    return () => clearTimeout(timeoutId)
  }, [user?.id, toast])

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
    totalVisualizacoes: anuncios.reduce((acc, a) => acc + a.views, 0),
    totalContatos: anuncios.reduce((acc, a) => acc + a.likes, 0), // Usando likes como contatos por enquanto
    totalFavoritos: anuncios.reduce((acc, a) => acc + a.shares, 0), // Usando shares como favoritos por enquanto
  }

  const handlePausar = async (id: string) => {
    setLoading(true)
    try {
      await VehicleService.pauseVehicle(id)
      setAnuncios((prev) => prev.map((a) => (a.id === id ? { ...a, status: "pausado" as const } : a)))
      toast({
        title: "Anúncio pausado",
        description: "Seu anúncio foi pausado com sucesso",
      })
    } catch (error) {
      console.error('❌ Erro ao pausar anúncio:', error)
      toast({
        title: "Erro ao pausar",
        description: "Não foi possível pausar o anúncio. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReativar = async (id: string) => {
    setLoading(true)
    try {
      await VehicleService.activateVehicle(id)
      setAnuncios((prev) => prev.map((a) => (a.id === id ? { ...a, status: "ativo" as const } : a)))
      toast({
        title: "Anúncio reativado",
        description: "Seu anúncio foi reativado com sucesso",
      })
    } catch (error) {
      console.error('❌ Erro ao reativar anúncio:', error)
      toast({
        title: "Erro ao reativar",
        description: "Não foi possível reativar o anúncio. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return

    setLoading(true)
    try {
      await VehicleService.deleteVehicle(id)
      setAnuncios((prev) => prev.filter((a) => a.id !== id))
      toast({
        title: "Anúncio excluído",
        description: "Seu anúncio foi excluído com sucesso",
      })
    } catch (error) {
      console.error('❌ Erro ao excluir anúncio:', error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o anúncio. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRenovar = async (id: string) => {
    if (!user) return

    const anuncio = anuncios.find(a => a.id === id)
    if (!anuncio) return

    const renovacaoPreco = 30 // R$ 30 para renovação de 45 dias
    const diasRestantes = calcularDiasRestantes(anuncio.created_at, anuncio.plano)
    
    if (user.saldo < renovacaoPreco) {
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de R$ ${renovacaoPreco.toFixed(2)} para renovar este anúncio`,
        variant: "destructive",
      })
      return
    }

    const mensagemConfirmacao = diasRestantes !== null && diasRestantes > 0
      ? `Renovar anúncio por mais 45 dias* por R$ ${renovacaoPreco.toFixed(2)}?\n\n*Renovação sem destaque\nDias restantes: ${diasRestantes}`
      : `Renovar anúncio por mais 45 dias* por R$ ${renovacaoPreco.toFixed(2)}?\n\n*Renovação sem destaque`

    if (!confirm(mensagemConfirmacao)) return

    setLoading(true)
    try {
      // Renovar o anúncio
      const sucesso = await VehicleService.renovarAnuncio(id, user.id)
      
      if (sucesso) {
        // Debitar o saldo
        const debitoSucesso = await debitSaldo(
          renovacaoPreco,
          "Renovação de anúncio Destaque - 45 dias (sem destaque)",
          "renovacao_destaque"
        )

        if (debitoSucesso) {
          toast({
            title: "Anúncio renovado!",
            description: "Seu anúncio foi renovado por mais 45 dias (sem destaque)",
          })
          // Recarregar anúncios
          const veiculos = await VehicleService.getUserVehicles(user.id)
          setAnuncios(veiculos)
        } else {
          toast({
            title: "Erro no pagamento",
            description: "Não foi possível processar o pagamento da renovação",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Erro ao renovar",
          description: "Não foi possível renovar o anúncio. Tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Erro ao renovar anúncio:', error)
      toast({
        title: "Erro ao renovar",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      pausado: "secondary",
      expirado: "destructive",
    } as const

    const labels = {
      ativo: "Ativo",
      pausado: "Pausado",
      expirado: "Expirado",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getPlanoBadge = (plano: string) => {
    const variants = {
      gratuito: "outline",
      destaque: "default",
      premium: "secondary",
    } as const

    const labels = {
      gratuito: "Gratuito",
      destaque: "Destaque",
      premium: "Premium",
    }

    return (
      <Badge variant={variants[plano as keyof typeof variants] || "outline"}>
        {labels[plano as keyof typeof labels] || plano}
      </Badge>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString))
  }

  // Calcular dias restantes para anúncios Destaque
  const calcularDiasRestantes = (createdAt: string, plano: string) => {
    if (plano !== "destaque") return null
    
    const dataCriacao = new Date(createdAt)
    const dataExpiracao = new Date(dataCriacao.getTime() + (60 * 24 * 60 * 60 * 1000)) // +60 dias
    const agora = new Date()
    const diasRestantes = Math.ceil((dataExpiracao.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diasRestantes)
  }

  // Verificar se pode renovar
  const podeRenovar = (anuncio: Vehicle) => {
    return anuncio.plano === "destaque" && anuncio.status === "ativo"
  }

  // Verificar se está próximo do vencimento (7 dias ou menos)
  const proximoVencimento = (anuncio: Vehicle) => {
    const diasRestantes = calcularDiasRestantes(anuncio.created_at, anuncio.plano)
    return diasRestantes !== null && diasRestantes <= 7 && diasRestantes > 0
  }

  // Verificar se expirou
  const expirado = (anuncio: Vehicle) => {
    const diasRestantes = calcularDiasRestantes(anuncio.created_at, anuncio.plano)
    return diasRestantes !== null && diasRestantes <= 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando seus anúncios...</p>
            </div>
          </div>
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
            <h1 className="text-3xl font-bold text-white">Meus Anúncios</h1>
            <p className="text-slate-300">Gerencie todos os seus anúncios de veículos</p>
          </div>
          <Link href="/anunciar">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Anúncio
            </Button>
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-6">
          <Card className="border-gray-200 bg-card">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{estatisticas.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{estatisticas.ativos}</div>
              <div className="text-xs text-muted-foreground">Ativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{estatisticas.pausados}</div>
              <div className="text-xs text-muted-foreground">Pausados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{estatisticas.expirados}</div>
              <div className="text-xs text-muted-foreground">Expirados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{estatisticas.totalVisualizacoes.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Visualizações</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{estatisticas.totalContatos}</div>
              <div className="text-xs text-muted-foreground">Contatos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{estatisticas.totalFavoritos}</div>
              <div className="text-xs text-muted-foreground">Favoritos</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por marca ou modelo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={filtroStatus} onValueChange={(value) => setFiltroStatus(value as any)}>
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="ativo">Ativos</TabsTrigger>
              <TabsTrigger value="pausado">Pausados</TabsTrigger>
              <TabsTrigger value="expirado">Expirados</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Alertas para anúncios próximos do vencimento */}
        {anunciosFiltrados.some(anuncio => proximoVencimento(anuncio)) && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Anúncios próximos do vencimento</h3>
            </div>
            <p className="text-sm text-orange-700">
              Você tem anúncios que expiram em breve. Renove-os para manter a visibilidade!
            </p>
          </div>
        )}

        {/* Lista de anúncios */}
        {anunciosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum anúncio encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {busca ? "Nenhum anúncio corresponde à sua busca." : "Você ainda não tem anúncios publicados."}
            </p>
            <Link href="/anunciar">
              <Button>Publicar primeiro anúncio</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anunciosFiltrados.map((anuncio) => {
              const diasRestantes = calcularDiasRestantes(anuncio.created_at, anuncio.plano)
              const podeRenovarAnuncio = podeRenovar(anuncio)
              const proximoVencimentoAnuncio = proximoVencimento(anuncio)
              const expiradoAnuncio = expirado(anuncio)
              
              return (
                <Card key={anuncio.id} className={`overflow-hidden ${
                  proximoVencimentoAnuncio ? 'ring-2 ring-orange-300' : ''
                }`}>
                  <div className="relative aspect-video">
                    <Image
                      src={anuncio.fotos[0] || "/placeholder.svg?height=200&width=300"}
                      alt={`${anuncio.marca} ${anuncio.modelo}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
                      {getStatusBadge(anuncio.status)}
                      {getPlanoBadge(anuncio.plano)}
                      {proximoVencimentoAnuncio && (
                        <Badge variant="destructive" className="animate-pulse">
                          <Clock className="w-3 h-3 mr-1" />
                          {diasRestantes} dias
                        </Badge>
                      )}
                      {expiradoAnuncio && (
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Expirado
                        </Badge>
                      )}
                      {podeRenovarAnuncio && !expiradoAnuncio && (
                        <Badge variant="default" className="bg-blue-600">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Pode renovar
                        </Badge>
                      )}
                    </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {anuncio.status === "ativo" ? (
                        <DropdownMenuItem onClick={() => handlePausar(anuncio.id)}>
                          <Pause className="mr-2 h-4 w-4" />
                          Pausar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleReativar(anuncio.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Reativar
                        </DropdownMenuItem>
                      )}
                      {podeRenovarAnuncio && (
                        <DropdownMenuItem onClick={() => handleRenovar(anuncio.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Renovar (+45 dias* - R$ 30)
                          {diasRestantes !== null && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({diasRestantes} dias restantes)
                            </span>
                          )}
                          <div className="text-xs text-orange-600 mt-1">
                            *Sem destaque
                          </div>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleExcluir(anuncio.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">
                      {anuncio.marca} {anuncio.modelo} {anuncio.ano}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {anuncio.cidade}{anuncio.estado ? `, ${anuncio.estado}` : ''}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(anuncio.preco)}
                      </div>
                      {anuncio.fipe && (
                        <div className="text-sm text-muted-foreground">
                          FIPE: {formatPrice(anuncio.fipe)}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-center">
                        <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-sm font-medium">{anuncio.views}</div>
                        <div className="text-xs text-muted-foreground">Visualizações</div>
                      </div>
                      <div className="text-center">
                        <MessageCircle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-sm font-medium">{anuncio.likes}</div>
                        <div className="text-xs text-muted-foreground">Contatos</div>
                      </div>
                      <div className="text-center">
                        <Heart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-sm font-medium">{anuncio.shares}</div>
                        <div className="text-xs text-muted-foreground">Favoritos</div>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Criado em {formatDate(anuncio.created_at)}
                      </div>
                      {diasRestantes !== null && (
                        <div className={`flex items-center gap-1 ${
                          proximoVencimentoAnuncio ? 'text-orange-600 font-medium' : 
                          expiradoAnuncio ? 'text-red-600 font-medium' : 
                          'text-muted-foreground'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {expiradoAnuncio ? 'Expirado' : `${diasRestantes} dias restantes`}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
