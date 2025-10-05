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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function AdminPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("anuncios")
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // Estados para modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [editFormData, setEditFormData] = useState({
    nome: '',
    tipo: '',
    preco: '',
    descricao: '',
    duracao_dias: '',
    limite_anuncios: '',
    limite_consultas: '',
    beneficios: '',
    destaque: false,
    ativo: true
  })

  // Verificar se o usuário tem permissão de admin
  const isAdmin = user?.email === 'dcalaca@gmail.com'

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    
    if (!isAdmin) {
      router.push("/")
      return
    }
  }, [router, user, isAdmin])

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
    // Redirecionar para logout normal
    router.push("/logout")
  }

  const clearEditModal = () => {
    setEditModalOpen(false)
    setEditingPlan(null)
    setEditFormData({
      nome: '',
      tipo: '',
      preco: '',
      descricao: '',
      duracao_dias: '',
      limite_anuncios: '',
      limite_consultas: '',
      beneficios: '',
      destaque: false,
      ativo: true
    })
    console.log('🧹 Estados do modal limpos completamente')
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setEditFormData({
      nome: plan.nome,
      tipo: plan.tipo,
      preco: plan.preco.toString(),
      descricao: plan.descricao,
      duracao_dias: plan.duracao_dias?.toString() || '',
      limite_anuncios: plan.limite_anuncios?.toString() || '',
      limite_consultas: plan.limite_consultas?.toString() || '',
      beneficios: Array.isArray(plan.beneficios) ? plan.beneficios.join('\n') : plan.beneficios || '',
      destaque: plan.destaque,
      ativo: plan.ativo
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingPlan) return

    try {
      console.log('🔄 Iniciando atualização do plano:', editingPlan.id)
      
      const updatedPlan = await PlansService.updatePlan({
        id: editingPlan.id,
        nome: editFormData.nome,
        tipo: editFormData.tipo,
        preco: parseFloat(editFormData.preco),
        descricao: editFormData.descricao,
        duracao_dias: editFormData.duracao_dias ? parseInt(editFormData.duracao_dias) : undefined,
        limite_anuncios: editFormData.limite_anuncios ? parseInt(editFormData.limite_anuncios) : 0,
        limite_consultas: editFormData.limite_consultas ? parseInt(editFormData.limite_consultas) : 0,
        beneficios: editFormData.beneficios.split('\n').filter(b => b.trim()),
        destaque: editFormData.destaque,
        ativo: editFormData.ativo
      })
      
      console.log('✅ Plano atualizado:', updatedPlan)
      
      if (updatedPlan) {
        setPlans(prev => prev.map(plan => 
          plan.id === editingPlan.id ? updatedPlan : plan
        ))
        console.log('✅ Estado dos planos atualizado')
      } else {
        console.warn('⚠️ updatedPlan é null, mas continuando...')
        // Mesmo se updatedPlan for null, vamos atualizar o estado local
        setPlans(prev => prev.map(plan => 
          plan.id === editingPlan.id ? {
            ...plan,
            nome: editFormData.nome,
            tipo: editFormData.tipo,
            preco: parseFloat(editFormData.preco),
            descricao: editFormData.descricao,
            duracao_dias: editFormData.duracao_dias ? parseInt(editFormData.duracao_dias) : undefined,
            limite_anuncios: editFormData.limite_anuncios ? parseInt(editFormData.limite_anuncios) : 0,
            limite_consultas: editFormData.limite_consultas ? parseInt(editFormData.limite_consultas) : 0,
            beneficios: editFormData.beneficios.split('\n').filter(b => b.trim()),
            destaque: editFormData.destaque,
            ativo: editFormData.ativo
          } : plan
        ))
      }

      toast({
        title: "Plano atualizado",
        description: "O plano foi atualizado com sucesso",
      })

      // Limpar estados do modal usando a função dedicada
      clearEditModal()
      
    } catch (error) {
      console.error('❌ Erro ao atualizar plano:', error)
      toast({
        title: "Erro ao atualizar plano",
        description: "Não foi possível atualizar o plano.",
        variant: "destructive",
      })
      
      // Mesmo com erro, fechar o modal para não travar a interface
      clearEditModal()
    }
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
                            <DropdownMenuItem onClick={() => handleEdit(plan)}>
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
                            <DropdownMenuItem onClick={() => handleEdit(plan)}>
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

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={(open) => {
        if (!open) {
          clearEditModal()
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>
              Modifique as informações do plano {editingPlan?.nome}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Plano</Label>
                <Input
                  id="nome"
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo do Plano</Label>
                <Select value={editFormData.tipo} onValueChange={(value) => setEditFormData(prev => ({ ...prev, tipo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anuncio">Anúncio</SelectItem>
                    <SelectItem value="consulta">Consulta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={editFormData.descricao}
                onChange={(e) => setEditFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o plano..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  value={editFormData.preco}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, preco: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (dias)</Label>
                <Input
                  id="duracao"
                  type="number"
                  value={editFormData.duracao_dias}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, duracao_dias: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="limite_anuncios">Limite de Anúncios</Label>
                <Input
                  id="limite_anuncios"
                  type="number"
                  value={editFormData.limite_anuncios}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, limite_anuncios: e.target.value }))}
                  placeholder="0 = Ilimitado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limite_consultas">Limite de Consultas</Label>
                <Input
                  id="limite_consultas"
                  type="number"
                  value={editFormData.limite_consultas}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, limite_consultas: e.target.value }))}
                  placeholder="0 = Ilimitado"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="beneficios">Benefícios</Label>
              <Textarea
                id="beneficios"
                value={editFormData.beneficios}
                onChange={(e) => setEditFormData(prev => ({ ...prev, beneficios: e.target.value }))}
                placeholder="Descreva os benefícios do plano..."
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="destaque"
                  checked={editFormData.destaque}
                  onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, destaque: checked }))}
                />
                <Label htmlFor="destaque">Plano em Destaque</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={editFormData.ativo}
                  onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="ativo">Plano Ativo</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={clearEditModal}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
