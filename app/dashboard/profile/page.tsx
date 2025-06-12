"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Loader2, User, Lock, ArrowLeft, Car } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          toast({
            title: "Erro",
            description: "Sessão expirada ou usuário não encontrado. Faça login novamente.",
            variant: "destructive",
          })
          router.push("/auth/login")
          return
        }

        setEmail(user.email || "")
        setFullName(user.user_metadata?.full_name || "")
      } catch (e: any) {
        toast({
          title: "Erro",
          description: e.message || "Não foi possível carregar os dados do perfil.",
          variant: "destructive",
        })
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [toast, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      })

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso!",
        description: "Dados do perfil atualizados com sucesso.",
      })
    } catch (e: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: e.message || "Não foi possível atualizar os dados do perfil.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso!",
        description: "Senha atualizada com sucesso. Você será desconectado para fazer login com a nova senha.",
      })
      // Força o logout para que o usuário faça login com a nova senha
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push("/auth/login")
      }, 2000)
    } catch (e: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: e.message || "Não foi possível atualizar a senha.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando dados do perfil...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
      </div>

      {/* Card para informações do perfil */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Informações do Perfil
          </CardTitle>
          <CardDescription>Atualize seu nome completo e visualize seu email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="bg-muted/50" />
              <p className="text-sm text-muted-foreground">Seu email não pode ser alterado aqui.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isUpdatingProfile}
              />
            </div>
            <Button type="submit" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Card para alterar senha */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Alterar Senha
          </CardTitle>
          <CardDescription>Mantenha sua conta segura com uma nova senha.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                disabled={isUpdatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isUpdatingPassword}
              />
            </div>
            <Button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...
                </>
              ) : (
                "Atualizar Senha"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Card para Cadastro de Veículo */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" /> Meus Veículos
          </CardTitle>
          <CardDescription>
            Cadastre e gerencie seus veículos para acesso rápido a documentos e débitos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/my-vehicles">Cadastre seu veículo</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
