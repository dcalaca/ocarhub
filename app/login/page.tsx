"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Mail, Eye, EyeOff, Loader2, LogIn, AlertCircle, Chrome } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [manterConectado, setManterConectado] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔵 Formulário submetido!', { email, senha })

    if (!email || !senha) {
      setError("Preencha todos os campos")
      return
    }

    setLoading(true)
    setError("")
    console.log('🟡 Iniciando login...')

    try {
      await login(email, senha)
      console.log('✅ Login bem-sucedido!')

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta à Ocar!",
      })

      router.push("/")
    } catch (error) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    console.log('🔵 Google login clicado (não implementado)')
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Login com Google será implementado em breve.",
      variant: "destructive",
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="relative w-12 h-12">
              <img src="/logo-ocar.jpeg" alt="Ocar Logo" className="w-full h-full object-contain rounded-full" onError={(e) => { e.currentTarget.src = '/logo-ocar.png'; }} />
            </div>
            <span className="text-3xl font-bold text-white">Ocar</span>
          </Link>
        </div>

        <Card className="backdrop-blur-sm border-white/20 bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Entrar na sua conta</CardTitle>
            <CardDescription>Digite suas credenciais para acessar a plataforma</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Erro */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Checkbox e Esqueci senha */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="manterConectado"
                    checked={manterConectado}
                    onChange={(e) => setManterConectado(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Deseja manter conectado</span>
                </div>

                <Link href="#" className="text-sm text-purple-600 hover:underline">
                  Esqueci minha senha
                </Link>
              </div>

              {/* Botão Entrar */}
              <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Link cadastre-se - VISÍVEL */}
            <div
              style={{
                textAlign: "center",
                padding: "8px 0",
                backgroundColor: "#f3f4f6",
                borderRadius: "4px",
                margin: "8px 0",
              }}
            >
              <a
                href="/cadastro"
                style={{ color: "#7c3aed", textDecoration: "underline", fontSize: "14px", fontWeight: "500" }}
              >
                cadastre-se
              </a>
            </div>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Google */}
            <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full">
              <Chrome className="w-4 h-4 mr-2" />
              Entrar com Google
            </Button>

            {/* Link para cadastro */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link href="/cadastro" className="text-purple-600 hover:underline font-medium">
                Criar conta
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
