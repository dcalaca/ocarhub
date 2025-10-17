"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Car, 
  MessageCircle, 
  Heart, 
  Eye, 
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  FileText,
  Star,
  TrendingUp
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { VehiclesService } from "@/lib/vehicles-service"
import { MessagesService } from "@/lib/messages-service"
import { supabase } from "@/lib/supabase"

export default function PerfilPage() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalMessages: 0
  })
  const [userVehicles, setUserVehicles] = useState([])
  const [userConversations, setUserConversations] = useState([])
  
  // Estados do formulário de edição
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    endereco_cep: '',
    endereco_logradouro: '',
    endereco_numero: '',
    endereco_complemento: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_estado: '',
    bio: ''
  })

  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      console.log('🔍 Carregando dados do perfil...')
      console.log('👤 Dados do usuário:', {
        id: user.id,
        nome: user.nome,
        endereco_cep: user.endereco_cep,
        endereco_logradouro: user.endereco_logradouro,
        endereco_numero: user.endereco_numero,
        endereco_cidade: user.endereco_cidade,
        endereco_estado: user.endereco_estado,
        telefone: user.telefone,
        bio: user.bio
      })
      
      // Carregar veículos do usuário
      const vehicles = await VehiclesService.getUserVehicles(user.id)
      setUserVehicles(vehicles)
      
      // Carregar conversas do usuário
      const conversations = await MessagesService.getUserChats(user.id)
      setUserConversations(conversations)
      
      // Calcular estatísticas
      const totalViews = vehicles.reduce((sum, vehicle) => sum + (vehicle.views || 0), 0)
      const totalLikes = vehicles.reduce((sum, vehicle) => sum + (vehicle.likes || 0), 0)
      
      setStats({
        totalVehicles: vehicles.length,
        totalViews,
        totalLikes,
        totalMessages: conversations.length
      })
      
      // Preencher formulário com dados do usuário
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        endereco: user.endereco || '',
        endereco_cep: user.endereco_cep || '',
        endereco_logradouro: user.endereco_logradouro || '',
        endereco_numero: user.endereco_numero || '',
        endereco_complemento: user.endereco_complemento || '',
        endereco_bairro: user.endereco_bairro || '',
        endereco_cidade: user.endereco_cidade || '',
        endereco_estado: user.endereco_estado || '',
        bio: user.bio || ''
      })
      
      console.log('✅ Dados do perfil carregados')
    } catch (error) {
      console.error('❌ Erro ao carregar dados do perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    // Restaurar dados originais
    setFormData({
      nome: user?.nome || '',
      email: user?.email || '',
      telefone: user?.telefone || '',
      endereco: user?.endereco || '',
      endereco_cep: user?.endereco_cep || '',
      endereco_logradouro: user?.endereco_logradouro || '',
      endereco_numero: user?.endereco_numero || '',
      endereco_complemento: user?.endereco_complemento || '',
      endereco_bairro: user?.endereco_bairro || '',
      endereco_cidade: user?.endereco_cidade || '',
      endereco_estado: user?.endereco_estado || '',
      bio: user?.bio || ''
    })
  }

  const handleSave = async () => {
    if (!user) return
    
    try {
      console.log('💾 Salvando alterações do perfil...')
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('ocar_usuarios')
        .update({
          telefone: formData.telefone,
          endereco: formData.endereco,
          endereco_cep: formData.endereco_cep,
          endereco_logradouro: formData.endereco_logradouro,
          endereco_numero: formData.endereco_numero,
          endereco_complemento: formData.endereco_complemento,
          endereco_bairro: formData.endereco_bairro,
          endereco_cidade: formData.endereco_cidade,
          endereco_estado: formData.endereco_estado,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) {
        throw error
      }
      
      // Atualizar o contexto local
      const updatedUser = {
        ...user,
        telefone: formData.telefone,
        endereco: formData.endereco,
        endereco_cep: formData.endereco_cep,
        endereco_logradouro: formData.endereco_logradouro,
        endereco_numero: formData.endereco_numero,
        endereco_complemento: formData.endereco_complemento,
        endereco_bairro: formData.endereco_bairro,
        endereco_cidade: formData.endereco_cidade,
        endereco_estado: formData.endereco_estado,
        bio: formData.bio
      }
      
      updateUser(updatedUser)
      setEditing(false)
      console.log('✅ Perfil atualizado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error)
      alert('Erro ao salvar alterações. Tente novamente.')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 content-with-header">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-100">Carregando perfil...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 content-with-header">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
            <p className="text-purple-100">Você precisa estar logado para acessar esta página.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 content-with-header">
        {/* Header do Perfil */}
        <div className="bg-card backdrop-blur-sm rounded-xl p-6 mb-8 border shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white/20">
                <AvatarImage src={user.avatar_url || '/placeholder-user.jpg'} alt={user.nome} />
                <AvatarFallback className="text-2xl font-bold bg-purple-600 text-white">
                  {user.nome?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-purple-600 hover:bg-purple-700"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">{user.nome || 'Usuário'}</h1>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-400/30">
                      <Shield className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-100 border-purple-400/30">
                      <Star className="w-3 h-3 mr-1" />
                      Membro Premium
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white">
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleEdit} className="bg-purple-600 hover:bg-purple-700">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card backdrop-blur-sm border shadow-lg hover:opacity-80 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Car className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalVehicles}</div>
              <div className="text-sm text-slate-300">Veículos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card backdrop-blur-sm border shadow-lg hover:opacity-80 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Eye className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
              <div className="text-sm text-slate-300">Visualizações</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card backdrop-blur-sm border shadow-lg hover:opacity-80 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalLikes}</div>
              <div className="text-sm text-slate-300">Curtidas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card backdrop-blur-sm border shadow-lg hover:opacity-80 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalMessages}</div>
              <div className="text-sm text-slate-300">Conversas</div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border shadow-lg">
            <TabsTrigger 
              value="info" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 hover:text-white"
            >
              Informações
            </TabsTrigger>
            <TabsTrigger 
              value="vehicles" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 hover:text-white"
            >
              Meus Veículos
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 hover:text-white"
            >
              Conversas
            </TabsTrigger>
          </TabsList>

          {/* Aba de Informações */}
          <TabsContent value="info">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card backdrop-blur-sm border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-200 font-medium">Nome Completo</Label>
                    <div className="rounded-md px-3 py-2 text-gray-800 flex items-center gap-2" style={{backgroundColor: '#d3d3d3', border: '1px solid #a0a0a0'}}>
                      <User className="w-4 h-4" />
                      {user.nome || 'Não informado'}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Nome não pode ser alterado após verificação</p>
                  </div>
                  
                  <div>
                    <Label className="text-slate-200 font-medium">CPF</Label>
                    <div className="rounded-md px-3 py-2 text-gray-800 flex items-center gap-2" style={{backgroundColor: '#d3d3d3', border: '1px solid #a0a0a0'}}>
                      <FileText className="w-4 h-4" />
                      {user.cpf || 'Não informado'}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">CPF não pode ser alterado após verificação</p>
                  </div>
                  
                  <div>
                    <Label className="text-slate-200 font-medium">Email</Label>
                    <div className="rounded-md px-3 py-2 text-gray-800 flex items-center gap-2" style={{backgroundColor: '#d3d3d3', border: '1px solid #a0a0a0'}}>
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Email não pode ser alterado após verificação</p>
                  </div>
                  
                  <div>
                    <Label className="text-slate-200 font-medium">Telefone</Label>
                    {editing ? (
                      <Input
                        value={formData.telefone}
                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                        className="border text-white bg-card"
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <div className="border rounded-md px-3 py-2 text-white flex items-center gap-2 bg-card">
                        <Phone className="w-4 h-4" />
                        {user.telefone || 'Não informado'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-slate-200 font-medium">Endereço</Label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-slate-300 text-sm">CEP</Label>
                          {editing ? (
                            <Input
                              value={formData.endereco_cep || ''}
                              onChange={(e) => handleInputChange('endereco_cep', e.target.value)}
                              className="border text-white bg-card"
                              placeholder="CEP"
                            />
                          ) : (
                            <div className="border rounded-md px-3 py-2 text-white flex items-center gap-2 bg-card">
                              <MapPin className="w-4 h-4" />
                              {user.endereco_cep || 'Não informado'}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-slate-300 text-sm">Estado (UF)</Label>
                          {editing ? (
                            <Input
                              value={formData.endereco_estado || ''}
                              onChange={(e) => handleInputChange('endereco_estado', e.target.value)}
                              className="border text-white bg-card"
                              placeholder="Estado (UF)"
                              maxLength={2}
                            />
                          ) : (
                            <div className="border rounded-md px-3 py-2 text-white flex items-center gap-2 bg-card">
                              <MapPin className="w-4 h-4" />
                              {user.endereco_estado || 'Não informado'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-slate-300 text-sm">Rua/Avenida</Label>
                        {editing ? (
                          <Input
                            value={formData.endereco_logradouro || ''}
                            onChange={(e) => handleInputChange('endereco_logradouro', e.target.value)}
                            className="border text-white bg-card"
                            placeholder="Rua/Avenida"
                          />
                        ) : (
                          <div className="border rounded-md px-3 py-2 text-white flex items-center gap-2 bg-card">
                            <MapPin className="w-4 h-4" />
                            {user.endereco_logradouro || 'Não informado'}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-slate-300 text-sm">Número</Label>
                          {editing ? (
                            <Input
                              value={formData.endereco_numero || ''}
                              onChange={(e) => handleInputChange('endereco_numero', e.target.value)}
                              className="border text-white bg-card"
                              placeholder="Número"
                            />
                          ) : (
                            <div className="border rounded-md px-3 py-2 text-white flex items-center gap-2 bg-card">
                              <MapPin className="w-4 h-4" />
                              {user.endereco_numero || 'Não informado'}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-slate-300 text-sm">Complemento</Label>
                          {editing ? (
                            <Input
                              value={formData.endereco_complemento || ''}
                              onChange={(e) => handleInputChange('endereco_complemento', e.target.value)}
                              className="border text-white bg-card"
                              placeholder="Complemento"
                            />
                          ) : (
                            <div className="border rounded-md px-3 py-2 text-white flex items-center gap-2 bg-card">
                              <MapPin className="w-4 h-4" />
                              {user.endereco_complemento || 'Não informado'}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-slate-300 text-sm">Bairro</Label>
                          {editing ? (
                            <Input
                              value={formData.endereco_bairro || ''}
                              onChange={(e) => handleInputChange('endereco_bairro', e.target.value)}
                              className="border text-white bg-card"
                              placeholder="Bairro"
                            />
                          ) : (
                            <div className="border rounded-md px-3 py-2 text-white flex items-center gap-2 bg-card">
                              <MapPin className="w-4 h-4" />
                              {user.endereco_bairro || 'Não informado'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-slate-300 text-sm">Cidade</Label>
                        {editing ? (
                          <Input
                            value={formData.endereco_cidade || ''}
                            onChange={(e) => handleInputChange('endereco_cidade', e.target.value)}
                            className="border text-white bg-card"
                            placeholder="Cidade"
                          />
                        ) : (
                          <div className="border rounded-md px-3 py-2 text-white flex items-center gap-2 bg-card">
                            <MapPin className="w-4 h-4" />
                            {user.endereco_cidade || 'Não informado'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-slate-200 font-medium">Membro desde</Label>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card backdrop-blur-sm border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Sobre Mim
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="border text-white placeholder-gray-300 bg-card"
                      placeholder="Conte um pouco sobre você..."
                      rows={4}
                    />
                  ) : (
                    <div className="border rounded-md px-3 py-2 text-white min-h-[100px] bg-card">
                      {typeof user.bio === 'string' ? user.bio : 'Nenhuma biografia adicionada ainda.'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba de Veículos */}
          <TabsContent value="vehicles">
            <Card className="bg-card backdrop-blur-sm border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Meus Veículos ({userVehicles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userVehicles.length > 0 ? (
                  <div className="grid gap-4">
                    {userVehicles.map((vehicle) => (
                      <div key={vehicle.id} className="bg-card/50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-semibold">
                              {vehicle.marca} {vehicle.modelo}
                            </h3>
                            <p className="text-purple-200 text-sm">
                              {vehicle.ano} • {vehicle.cidade}
                            </p>
                            <p className="text-green-400 font-bold">
                              R$ {vehicle.preco.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-4 text-sm text-purple-200">
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {vehicle.views || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {vehicle.likes || 0}
                              </span>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`mt-2 ${
                                vehicle.status === 'ativo' 
                                  ? 'bg-green-500/20 text-green-100' 
                                  : 'bg-red-500/20 text-red-100'
                              }`}
                            >
                              {vehicle.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-semibold mb-2">Nenhum veículo anunciado</h3>
                    <p className="text-purple-200 mb-4">Comece anunciando seu primeiro veículo!</p>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Anunciar Veículo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Conversas */}
          <TabsContent value="messages">
            <Card className="bg-card backdrop-blur-sm border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Minhas Conversas ({userConversations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userConversations.length > 0 ? (
                  <div className="space-y-4">
                    {userConversations.map((conversation) => (
                      <div key={conversation.id} className="bg-card/50 rounded-lg p-4 border">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={conversation.other_user?.avatar_url} />
                            <AvatarFallback className="bg-purple-600 text-white">
                              {conversation.other_user?.nome?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">
                              {conversation.other_user?.nome || 'Usuário'}
                            </h4>
                            <p className="text-purple-200 text-sm">
                              Sobre: {conversation.vehicle?.marca} {conversation.vehicle?.modelo}
                            </p>
                            <p className="text-purple-300 text-xs">
                              {conversation.last_message?.content}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-purple-300">
                              {new Date(conversation.updated_at).toLocaleDateString('pt-BR')}
                            </div>
                            {conversation.unread_count > 0 && (
                              <Badge className="bg-red-500 text-white mt-1">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-semibold mb-2">Nenhuma conversa</h3>
                    <p className="text-purple-200">Suas conversas aparecerão aqui quando alguém entrar em contato sobre seus veículos.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
