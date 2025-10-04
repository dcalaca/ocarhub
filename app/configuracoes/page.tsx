"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import {
  Settings,
  User,
  Bell,
  Shield,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Mail,
  Lock,
  Heart,
  Plus,
  Trash2,
  Car,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SmartFilterInput } from "@/components/smart-filter-input"
import { supabase } from "@/lib/supabase"

interface WishlistItem {
  id: string
  marca: string
  modelo?: string
  versao?: string
  anoMin?: number
  anoMax?: number
  precoMin?: number
  precoMax?: number
  ativo: boolean
  created_at: string
}

export default function ConfiguracoesPage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Estados para configurações
  const [configuracoes, setConfiguracoes] = useState({
    // Notificações
    notificacoes_email: true,
    notificacoes_push: true,
    notificacoes_sms: false,
    promocoes_email: true,
    
    // Privacidade
    perfil_publico: true,
    mostrar_telefone: true,
    mostrar_endereco: false,
    
    // Segurança
    autenticacao_2f: false,
    sessao_lembrar: true,
    logout_automatico: false,
  })

  // Estados para lista de desejos
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [marcas, setMarcas] = useState<Array<{id: string, name: string}>>([])
  const [modelos, setModelos] = useState<Array<{id: string, name: string}>>([])
  const [versoes, setVersoes] = useState<Array<{id: string, name: string}>>([])
  const [anos, setAnos] = useState<Array<{id: string, name: string}>>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWishlistItem, setNewWishlistItem] = useState({
    marca: '',
    modelo: '',
    versao: '',
    anoMin: '',
    anoMax: '',
    precoMin: '',
    precoMax: '',
  })

  // Carregar configurações do usuário
  useEffect(() => {
    if (user) {
      setConfiguracoes({
        notificacoes_email: user.promocoes_email ?? true,
        notificacoes_push: true,
        notificacoes_sms: false,
        promocoes_email: user.promocoes_email ?? true,
        perfil_publico: true,
        mostrar_telefone: true,
        mostrar_endereco: false,
        autenticacao_2f: false,
        sessao_lembrar: true,
        logout_automatico: false,
      })
      loadWishlist()
      loadMarcas()
    }
  }, [user])

  const handleConfigChange = (key: string, value: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Funções para lista de desejos
  const loadWishlist = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('ocar_wishlist_veiculos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWishlist(data || [])
    } catch (error) {
      console.error('Erro ao carregar lista de desejos:', error)
    }
  }

  const loadMarcas = async () => {
    try {
      const response = await fetch('/api/fipe/marcas')
      const data = await response.json()
      setMarcas(data.map((marca: any) => ({ id: marca.id, name: marca.name })))
    } catch (error) {
      console.error('Erro ao carregar marcas:', error)
    }
  }

  const loadModelos = async (marca: string) => {
    if (!marca) return
    
    try {
      const response = await fetch(`/api/fipe/modelos?marca=${marca}`)
      const data = await response.json()
      setModelos(data.map((modelo: any) => ({ id: modelo.id, name: modelo.name })))
    } catch (error) {
      console.error('Erro ao carregar modelos:', error)
    }
  }

  const loadVersoes = async (marca: string, modelo: string) => {
    if (!marca || !modelo) return
    
    try {
      const response = await fetch(`/api/fipe/versoes?marca=${marca}&modelo=${modelo}`)
      const data = await response.json()
      setVersoes(data.map((versao: any) => ({ id: versao.id, name: versao.name })))
    } catch (error) {
      console.error('Erro ao carregar versões:', error)
    }
  }

  const handleAddWishlist = async () => {
    if (!user || !newWishlistItem.marca) return

    try {
      const { data, error } = await supabase
        .from('ocar_wishlist_veiculos')
        .insert({
          user_id: user.id,
          marca: newWishlistItem.marca,
          modelo: newWishlistItem.modelo || null,
          versao: newWishlistItem.versao || null,
          ano_min: newWishlistItem.anoMin ? parseInt(newWishlistItem.anoMin) : null,
          ano_max: newWishlistItem.anoMax ? parseInt(newWishlistItem.anoMax) : null,
          preco_min: newWishlistItem.precoMin ? parseFloat(newWishlistItem.precoMin) : null,
          preco_max: newWishlistItem.precoMax ? parseFloat(newWishlistItem.precoMax) : null,
          ativo: true
        })
        .select()

      if (error) throw error

      setWishlist(prev => [data[0], ...prev])
      setNewWishlistItem({
        marca: '',
        modelo: '',
        versao: '',
        anoMin: '',
        anoMax: '',
        precoMin: '',
        precoMax: '',
      })
      setShowAddForm(false)

      toast({
        title: "Item adicionado",
        description: "Veículo adicionado à sua lista de desejos com sucesso!",
      })
    } catch (error) {
      console.error('Erro ao adicionar à lista de desejos:', error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar à lista de desejos.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveWishlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ocar_wishlist_veiculos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setWishlist(prev => prev.filter(item => item.id !== id))

      toast({
        title: "Item removido",
        description: "Veículo removido da sua lista de desejos.",
      })
    } catch (error) {
      console.error('Erro ao remover da lista de desejos:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover da lista de desejos.",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      await updateUser({
        promocoes_email: configuracoes.promocoes_email,
      })

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-white" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Acesso Negado</h2>
              <p className="text-slate-300">Você precisa estar logado para acessar as configurações.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Configurações</h1>
              <p className="text-slate-300">Personalize sua experiência no OcarHub</p>
            </div>
          </div>
        </div>

        {/* Tabs de Configurações */}
        <Tabs defaultValue="notificacoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger 
              value="notificacoes" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80 hover:text-white"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger 
              value="wishlist" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80 hover:text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              Lista de Desejos
            </TabsTrigger>
            <TabsTrigger 
              value="privacidade" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80 hover:text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Privacidade
            </TabsTrigger>
            <TabsTrigger 
              value="seguranca" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80 hover:text-white"
            >
              <Lock className="w-4 h-4 mr-2" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Notificações */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações por Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-200 font-medium">Promoções e Ofertas</Label>
                    <p className="text-sm text-slate-400">Receba notificações sobre promoções e ofertas especiais</p>
                  </div>
                  <Switch
                    checked={configuracoes.promocoes_email}
                    onCheckedChange={(checked) => handleConfigChange('promocoes_email', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Notificações Push
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-200 font-medium">Notificações Push</Label>
                    <p className="text-sm text-slate-400">Receba notificações no seu dispositivo</p>
                  </div>
                  <Switch
                    checked={configuracoes.notificacoes_push}
                    onCheckedChange={(checked) => handleConfigChange('notificacoes_push', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lista de Desejos */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Heart className="w-5 h-5" />
                    Lista de Desejos
                  </CardTitle>
                  <Button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Veículo
                  </Button>
                </div>
                <p className="text-slate-300">
                  Configure alertas para veículos específicos. Quando um anúncio compatível for cadastrado, você receberá um email imediatamente.
                </p>
              </CardHeader>
              <CardContent>
                {showAddForm && (
                  <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-lg font-semibold text-white">Adicionar à Lista de Desejos</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-200">Marca *</Label>
                        <SmartFilterInput
                          options={marcas}
                          value={newWishlistItem.marca}
                          onChange={(value) => {
                            setNewWishlistItem(prev => ({ ...prev, marca: value }))
                            loadModelos(value)
                          }}
                          placeholder="Digite ou selecione a marca"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-slate-200">Modelo</Label>
                        <SmartFilterInput
                          options={modelos}
                          value={newWishlistItem.modelo}
                          onChange={(value) => {
                            setNewWishlistItem(prev => ({ ...prev, modelo: value }))
                            loadVersoes(newWishlistItem.marca, value)
                          }}
                          placeholder="Digite ou selecione o modelo (opcional)"
                          disabled={!newWishlistItem.marca}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-slate-200">Versão</Label>
                        <SmartFilterInput
                          options={versoes}
                          value={newWishlistItem.versao}
                          onChange={(value) => setNewWishlistItem(prev => ({ ...prev, versao: value }))}
                          placeholder="Digite ou selecione a versão (opcional)"
                          disabled={!newWishlistItem.modelo}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-slate-200">Ano Mínimo</Label>
                        <Input
                          type="number"
                          value={newWishlistItem.anoMin}
                          onChange={(e) => setNewWishlistItem(prev => ({ ...prev, anoMin: e.target.value }))}
                          placeholder="Ex: 2020"
                          className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-slate-200">Ano Máximo</Label>
                        <Input
                          type="number"
                          value={newWishlistItem.anoMax}
                          onChange={(e) => setNewWishlistItem(prev => ({ ...prev, anoMax: e.target.value }))}
                          placeholder="Ex: 2024"
                          className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-slate-200">Preço Mínimo (R$)</Label>
                        <Input
                          type="number"
                          value={newWishlistItem.precoMin}
                          onChange={(e) => setNewWishlistItem(prev => ({ ...prev, precoMin: e.target.value }))}
                          placeholder="Ex: 50000"
                          className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-slate-200">Preço Máximo (R$)</Label>
                        <Input
                          type="number"
                          value={newWishlistItem.precoMax}
                          onChange={(e) => setNewWishlistItem(prev => ({ ...prev, precoMax: e.target.value }))}
                          placeholder="Ex: 100000"
                          className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddWishlist}
                        disabled={!newWishlistItem.marca}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Adicionar à Lista
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddForm(false)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {wishlist.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-300">Nenhum veículo na sua lista de desejos</p>
                      <p className="text-sm text-slate-400">Adicione veículos para receber alertas por email</p>
                    </div>
                  ) : (
                    wishlist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                          <Car className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-white font-medium">
                              {item.marca}
                              {item.modelo && ` ${item.modelo}`}
                              {item.versao && ` ${item.versao}`}
                            </p>
                            <div className="flex gap-4 text-sm text-slate-400">
                              {item.anoMin && item.anoMax && (
                                <span>{item.anoMin} - {item.anoMax}</span>
                              )}
                              {item.anoMin && !item.anoMax && (
                                <span>A partir de {item.anoMin}</span>
                              )}
                              {!item.anoMin && item.anoMax && (
                                <span>Até {item.anoMax}</span>
                              )}
                              {item.precoMin && item.precoMax && (
                                <span>R$ {parseFloat(item.precoMin).toLocaleString()} - R$ {parseFloat(item.precoMax).toLocaleString()}</span>
                              )}
                              {item.precoMin && !item.precoMax && (
                                <span>A partir de R$ {parseFloat(item.precoMin).toLocaleString()}</span>
                              )}
                              {!item.precoMin && item.precoMax && (
                                <span>Até R$ {parseFloat(item.precoMax).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveWishlist(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacidade */}
          <TabsContent value="privacidade" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Visibilidade do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-200 font-medium">Perfil Público</Label>
                    <p className="text-sm text-slate-400">Permitir que outros usuários vejam seu perfil</p>
                  </div>
                  <Switch
                    checked={configuracoes.perfil_publico}
                    onCheckedChange={(checked) => handleConfigChange('perfil_publico', checked)}
                  />
                </div>
                
                <Separator className="bg-white/20" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-200 font-medium">Mostrar Telefone</Label>
                    <p className="text-sm text-slate-400">Exibir seu telefone em anúncios e perfil</p>
                  </div>
                  <Switch
                    checked={configuracoes.mostrar_telefone}
                    onCheckedChange={(checked) => handleConfigChange('mostrar_telefone', checked)}
                  />
                </div>
                
                <Separator className="bg-white/20" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-200 font-medium">Mostrar Endereço</Label>
                    <p className="text-sm text-slate-400">Exibir seu endereço em anúncios e perfil</p>
                  </div>
                  <Switch
                    checked={configuracoes.mostrar_endereco}
                    onCheckedChange={(checked) => handleConfigChange('mostrar_endereco', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Autenticação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-200 font-medium">Autenticação de 2 Fatores</Label>
                    <p className="text-sm text-slate-400">Adicione uma camada extra de segurança à sua conta</p>
                  </div>
                  <Switch
                    checked={configuracoes.autenticacao_2f}
                    onCheckedChange={(checked) => handleConfigChange('autenticacao_2f', checked)}
                  />
                </div>
                
                <Separator className="bg-white/20" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-200 font-medium">Lembrar Sessão</Label>
                    <p className="text-sm text-slate-400">Manter-se logado entre as sessões</p>
                  </div>
                  <Switch
                    checked={configuracoes.sessao_lembrar}
                    onCheckedChange={(checked) => handleConfigChange('sessao_lembrar', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                Para alterar sua senha, acesse a página de perfil e clique em "Alterar Senha".
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Botão Salvar */}
        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
