"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
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
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { VehicleService } from "@/lib/vehicle-service"
import { PlansService } from "@/lib/plans-service"
import { Vehicle } from "@/types"
import Image from "next/image"

export default function MeusAnunciosPage() {
  const { user, debitSaldo } = useAuth()
  const { toast } = useToast()
  const [anuncios, setAnuncios] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todos")

  useEffect(() => {
    if (user?.id) {
      loadAnuncios()
    }
  }, [user?.id])

  const loadAnuncios = async () => {
    try {
      setLoading(true)
      const userVehicles = await VehicleService.getUserVehicles(user.id)
      setAnuncios(userVehicles)
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus anúncios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const anunciosFiltrados = anuncios.filter((anuncio) => {
    const matchesSearch = anuncio.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         anuncio.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    
    switch (activeTab) {
      case "ativos":
        return matchesSearch && anuncio.status === "ativo"
      case "pausados":
        return matchesSearch && anuncio.status === "pausado"
      case "expirados":
        return matchesSearch && anuncio.status === "expirado"
      default:
        return matchesSearch
    }
  })

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

  // Função para verificar se pode reativar (máximo 30 dias)
  const canReactivate = (createdAt: string) => {
    const createdDate = new Date(createdAt)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff <= 30
  }

  // Funções de gerenciamento de anúncios
  const updateAnuncioStatus = async (anuncioId: string, newStatus: string) => {
    try {
      await VehicleService.updateVehicle(anuncioId, { status: newStatus })
      
      // Atualizar o estado local
      setAnuncios(prev => prev.map(anuncio => 
        anuncio.id === anuncioId 
          ? { ...anuncio, status: newStatus as any }
          : anuncio
      ))
      
      toast({
        title: "Status atualizado",
        description: `Anúncio ${newStatus === "ativo" ? "ativado" : newStatus === "pausado" ? "pausado" : "marcado como vendido"} com sucesso!`,
      })
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o status do anúncio. ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      })
    }
  }

  const deleteAnuncio = async (anuncioId: string) => {
    try {
      await VehicleService.deleteVehicle(anuncioId)
      
      // Remover do estado local
      setAnuncios(prev => prev.filter(anuncio => anuncio.id !== anuncioId))
      
      toast({
        title: "Anúncio excluído",
        description: "O anúncio foi excluído permanentemente.",
      })
    } catch (error) {
      console.error("Erro ao excluir anúncio:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o anúncio.",
        variant: "destructive",
      })
    }
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

        {anunciosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum anúncio encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Tente ajustar os filtros de busca" : "Comece criando seu primeiro anúncio"}
            </p>
            <Link href="/anunciar">
              <Button>Publicar primeiro anúncio</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anunciosFiltrados.map((anuncio) => (
              <Card key={anuncio.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Link href={`/veiculo/${anuncio.id}`}>
                    <div className="relative aspect-video">
                      <Image
                        src={anuncio.fotos && anuncio.fotos.length > 0 ? anuncio.fotos[0] : "/placeholder.svg?height=200&width=300"}
                        alt={`${anuncio.marca} ${anuncio.modelo}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
                      <Badge variant={
                        anuncio.status === "ativo" ? "default" : 
                        anuncio.status === "vendido" ? "destructive" : 
                        anuncio.status === "pendente_pagamento" ? "secondary" :
                        "secondary"
                      }>
                        {anuncio.status === "vendido" ? "vendido" : 
                         anuncio.status === "pendente_pagamento" ? "aguardando pagamento" :
                         anuncio.status}
                      </Badge>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Botão de gerenciamento */}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {anuncio.status === "ativo" && (
                          <>
                            <DropdownMenuItem onClick={() => updateAnuncioStatus(anuncio.id, "pausado")}>
                              <Pause className="mr-2 h-4 w-4" />
                              Pausar anúncio
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateAnuncioStatus(anuncio.id, "vendido")}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como vendido
                            </DropdownMenuItem>
                          </>
                        )}
                        {anuncio.status === "pausado" && (
                          <>
                            {canReactivate(anuncio.created_at) ? (
                              <DropdownMenuItem onClick={() => updateAnuncioStatus(anuncio.id, "ativo")}>
                                <Play className="mr-2 h-4 w-4" />
                                Reativar anúncio
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled>
                                <Clock className="mr-2 h-4 w-4" />
                                Reativação expirada (30 dias)
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={`/editar-anuncio?id=${anuncio.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar anúncio
                          </Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir anúncio
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita e você perderá todos os dados do anúncio permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteAnuncio(anuncio.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir permanentemente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
                        <div className="text-sm font-medium">{anuncio.views || 0}</div>
                        <div className="text-xs text-muted-foreground">Visualizações</div>
                      </div>
                      <div className="text-center">
                        <MessageCircle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-sm font-medium">0</div>
                        <div className="text-xs text-muted-foreground">Contatos</div>
                      </div>
                      <div className="text-center">
                        <Heart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-sm font-medium">0</div>
                        <div className="text-xs text-muted-foreground">Favoritos</div>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Criado em {formatDate(anuncio.created_at)}
                      </div>
                    </div>
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
