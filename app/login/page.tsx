"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Atualizar as importações
import { useFinanceAuth } from "@/hooks/use-finance-auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Dentro do componente, após const [formData, setFormData] = useState({...})
  const { signIn, user, loading } = useFinanceAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  // Atualizar a função handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await signIn(formData.email, formData.password)

      if (error) {
        toast.error("Erro ao fazer login: " + error.message)
      } else {
        toast.success("Login realizado com sucesso!")
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("Erro inesperado ao fazer login")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="FinanceHub" width={180} height={40} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h1>
          <p className="text-slate-600">Entre em sua conta para continuar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Digite suas credenciais para acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href="/esqueci-senha" className="text-sm text-blue-600 hover:text-blue-800">
                  Esqueci minha senha
                </Link>
              </div>

              {/* Atualizar o botão de submit */}
              <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Não tem uma conta?{" "}
                  <Link href="/registro" className="text-blue-600 hover:text-blue-800 font-medium">
                    Cadastre-se gratuitamente
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
