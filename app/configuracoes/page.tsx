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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
    alertas_multas: true,
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

  // Carregar configurações do usuário
  useEffect(() => {
    if (user) {
      setConfiguracoes({
        notificacoes_email: user.promocoes_email ?? true,
        notificacoes_push: true,
        notificacoes_sms: false,
        alertas_multas: user.alertas_multas ?? false,
        promocoes_email: user.promocoes_email ?? true,
        perfil_publico: true,
        mostrar_telefone: true,
        mostrar_endereco: false,
        autenticacao_2f: false,
        sessao_lembrar: true,
        logout_automatico: false,
      })
    }
  }, [user])

  const handleConfigChange = (key: string, value: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      await updateUser({
        promocoes_email: configuracoes.promocoes_email,
        alertas_multas: configuracoes.alertas_multas,
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
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger 
              value="notificacoes" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80 hover:text-white"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notificações
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
                
                <Separator className="bg-white/20" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-200 font-medium">Alertas de Multas</Label>
                    <p className="text-sm text-slate-400">Receba alertas sobre multas e infrações de trânsito</p>
                  </div>
                  <Switch
                    checked={configuracoes.alertas_multas}
                    onCheckedChange={(checked) => handleConfigChange('alertas_multas', checked)}
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
