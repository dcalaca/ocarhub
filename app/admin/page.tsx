"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Shield,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Settings,
  BarChart3,
  Users,
  Package
} from "lucide-react"
import { AdminAuth } from "@/lib/admin-auth"
import { PlansService, type Plan } from "@/lib/plans-service"
import { useToast } from "@/hooks/use-toast"

export default function AdminPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("anuncios")
  const router = useRouter()
  const { toast } = useToast()

  // Verificar autenticação
  useEffect(() => {
    if (!AdminAuth.isAuthenticated()) {
      router.push("/admin/login")
      return
    }
  }, [router])

  // Carregar planos
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true)
        const allPlans = await PlansService.getAllPlans()
        setPlans(allPlans)
      } catch (error) {
        console.error('Erro ao carregar planos:', error)
        toast({
          title: "Erro ao carregar planos",
          description: "Não foi possível carregar os planos. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [toast])

  const handleLogout = () => {
    AdminAuth.logout()
    router.push("/admin/login")
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await PlansService.togglePlanStatus(id, !currentStatus)
      
      setPlans(prev => prev.map(plan => 
        plan.id === id ? { ...plan, ativo: !currentStatus } : plan
      ))

      toast({
        title: "Status alterado",
        description: `Plano ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      })
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do plano.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja desativar o plano "${nome}"?`)) return

    try {
      await PlansService.deletePlan(id)
      
      setPlans(prev => prev.map(plan => 
        plan.id === id ? { ...plan, ativo: false } : plan
      ))

      toast({
        title: "Plano desativado",
        description: `Plano "${nome}" foi desativado com sucesso`,
      })
    } catch (error) {
      console.error('Erro ao desativar plano:', error)
      toast({
        title: "Erro ao desativar plano",
        description: "Não foi possível desativar o plano.",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const planosAnuncios = plans.filter(plan => plan.tipo === 'anuncio')
  const planosConsultas = plans.filter(plan => plan.tipo === 'consulta')

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Painel Administrativo</h1>
                <p className="text-muted-foreground">Gerenciar planos e configurações</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="anuncios" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Planos de Anúncios
            </TabsTrigger>
            <TabsTrigger value="consultas" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Planos de Consultas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anuncios" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Planos de Anúncios</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Limite Anúncios</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planosAnuncios.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.nome}</TableCell>
                      <TableCell>{formatPrice(plan.preco)}</TableCell>
                      <TableCell>{plan.duracao_dias ? `${plan.duracao_dias} dias` : 'N/A'}</TableCell>
                      <TableCell>{plan.limite_anuncios === 0 ? 'Ilimitado' : plan.limite_anuncios}</TableCell>
                      <TableCell>
                        <Badge variant={plan.ativo ? "default" : "secondary"}>
                          {plan.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(plan.id, plan.ativo)}
                            >
                              {plan.ativo ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(plan.id, plan.nome)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Desativar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="consultas" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Planos de Consultas</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Limite Consultas</TableHead>
                    <TableHead>Destaque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planosConsultas.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.nome}</TableCell>
                      <TableCell>{formatPrice(plan.preco)}</TableCell>
                      <TableCell>{plan.limite_consultas === 0 ? 'Ilimitado' : plan.limite_consultas}</TableCell>
                      <TableCell>
                        <Badge variant={plan.destaque ? "default" : "outline"}>
                          {plan.destaque ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={plan.ativo ? "default" : "secondary"}>
                          {plan.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(plan.id, plan.ativo)}
                            >
                              {plan.ativo ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(plan.id, plan.nome)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Desativar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
