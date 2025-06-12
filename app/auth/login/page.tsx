"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Email e senha são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast({
          title: "Login",
          description: "Login realizado com sucesso! Redirecionando...",
        })

        // Redirecionamento direto com window.location
        setTimeout(() => {
          window.location.href = "/dashboard" // Alterado de "/dashboard" para "/"
        }, 1000)
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Falha ao fazer login",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      {/* Logo apenas para mobile - ACIMA do card */}
      <div className="md:hidden mb-6 flex flex-col items-center">
        <div className="relative w-20 h-20">
          <Image src="/logo-ocar-final.png" alt="OcarHub Logo" fill className="object-contain" priority />
        </div>
        <h1 className="text-2xl font-bold text-white mt-4">
          <span className="text-blue-500">Ocar</span>
          <span className="text-white">Hub</span>
        </h1>
        <p className="text-gray-400 text-sm">Consulta veicular completa</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center md:block hidden">Login no OcarHub</CardTitle>
          <CardTitle className="text-xl font-bold text-center md:hidden">Entrar</CardTitle>
          <CardDescription className="text-center">Acesse sua conta para consultar veículos.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
            <p className="text-sm text-center">
              Não tem uma conta?{" "}
              <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
