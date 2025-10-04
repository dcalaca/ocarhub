"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Car, 
  MessageCircle, 
  Star,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import Header from "@/components/header"
import Link from "next/link"

interface UserProfile {
  id: string
  nome: string
  email: string
  telefone?: string
  tipo_usuario: string
  foto_perfil?: string
  endereco?: {
    cidade?: string
    estado?: string
    cep?: string
  }
  data_nascimento?: string
  verificado: boolean
  ativo: boolean
  created_at: string
  cnpj?: string
}

interface UserStats {
  total_veiculos: number
  veiculos_ativos: number
  total_vendas: number
  avaliacao_media: number
}

export default function UserProfilePage() {
  const params = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = params.id as string

  useEffect(() => {
    if (userId) {
      loadUserProfile()
      loadUserStats()
    }
  }, [userId])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      console.log('🔍 Carregando perfil do usuário:', userId)
      
      const { data, error } = await supabase
        .from('ocar_usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Erro ao carregar perfil:', error)
        setError('Usuário não encontrado')
        return
      }

      console.log('✅ Perfil carregado:', data)
      setProfile(data)
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error)
      setError('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async () => {
    try {
      console.log('📊 Carregando estatísticas do usuário...')
      
      // Buscar veículos do usuário
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('ocar_vehicles')
        .select('id, status')
        .eq('dono_id', userId)

      if (vehiclesError) {
        console.error('❌ Erro ao carregar veículos:', vehiclesError)
        return
      }

      const totalVeiculos = vehicles?.length || 0
      const veiculosAtivos = vehicles?.filter(v => v.status === 'ativo').length || 0

      setStats({
        total_veiculos: totalVeiculos,
        veiculos_ativos: veiculosAtivos,
        total_vendas: 0, // Implementar futuramente
        avaliacao_media: 4.5 // Mock por enquanto
      })

      console.log('✅ Estatísticas carregadas')
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserType = (profile: UserProfile, stats: UserStats | null) => {
    // Se tem veículos cadastrados, é vendedor/anunciante
    if (stats && stats.total_veiculos > 0) {
      return 'vendedor'
    }
    
    // Se tem CNPJ, provavelmente é empresa/vendedor
    if (profile.cnpj) {
      return 'vendedor'
    }
    
    // Caso contrário, usa o tipo do banco de dados
    return profile.tipo_usuario
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'vendedor':
        return 'Anunciante'
      case 'comprador':
        return 'Comprador'
      default:
        return userType.charAt(0).toUpperCase() + userType.slice(1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Usuário não encontrado</h1>
            <p className="text-muted-foreground mb-4">
              {error || 'O perfil solicitado não existe ou foi removido.'}
            </p>
            <Link href="/buscar">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Buscar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <div className="mb-6">
          <Link href="/mensagens">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Mensagens
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Perfil */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.foto_perfil} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile.nome)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">{profile.nome}</h1>
                  
                  <div className="flex items-center justify-center gap-2">
                    {profile.verificado ? (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <XCircle className="w-3 h-3 mr-1" />
                        Não Verificado
                      </Badge>
                    )}
                    
                    <Badge variant={getUserType(profile, stats) === 'vendedor' ? 'default' : 'secondary'}>
                      {getUserTypeLabel(getUserType(profile, stats))}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  
                  {profile.telefone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{profile.telefone}</span>
                    </div>
                  )}
                  
                  {profile.endereco?.cidade && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {profile.endereco.cidade}
                        {profile.endereco.estado && `, ${profile.endereco.estado}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      Membro desde {formatDate(profile.created_at)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Botões de Ação */}
                <div className="space-y-2">
                  <Button className="w-full" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                  
                  {profile.telefone && (
                    <Button variant="outline" className="w-full" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Ligar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas e Informações Adicionais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estatísticas */}
            {stats && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Estatísticas</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.total_veiculos}
                      </div>
                      <div className="text-sm text-muted-foreground">Veículos</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.veiculos_ativos}
                      </div>
                      <div className="text-sm text-muted-foreground">Ativos</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.total_vendas}
                      </div>
                      <div className="text-sm text-muted-foreground">Vendas</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.avaliacao_media}
                      </div>
                      <div className="text-sm text-muted-foreground">Avaliação</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Informações Adicionais</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tipo de Usuário
                    </label>
                    <p className="text-sm">{getUserTypeLabel(getUserType(profile, stats))}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status da Conta
                    </label>
                    <p className="text-sm">
                      {profile.ativo ? (
                        <span className="text-green-600">Ativa</span>
                      ) : (
                        <span className="text-red-600">Inativa</span>
                      )}
                    </p>
                  </div>
                  
                  {profile.cnpj && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        CNPJ
                      </label>
                      <p className="text-sm">{profile.cnpj}</p>
                    </div>
                  )}
                  
                  {profile.data_nascimento && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Data de Nascimento
                      </label>
                      <p className="text-sm">{formatDate(profile.data_nascimento)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
