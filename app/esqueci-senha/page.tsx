"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useFinanceAuth } from "@/hooks/use-finance-auth"
import { toast } from "sonner"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword } = useFinanceAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await resetPassword(email)

      if (error) {
        toast.error("Erro ao enviar e-mail: " + error.message)
      } else {
        setEmailSent(true)
        toast.success("E-mail de recuperação enviado!")
      }
    } catch (error) {
      toast.error("Erro inesperado ao enviar e-mail")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="FinanceHub" width={180} height={40} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Recuperar Senha</h1>
          <p className="text-slate-600">Digite seu e-mail para receber as instruções</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Esqueci minha senha</CardTitle>
            <CardDescription>
              {emailSent
                ? "Verifique sua caixa de entrada e siga as instruções"
                : "Digite seu e-mail cadastrado para receber o link de recuperação"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-slate-600">
                  Enviamos um e-mail para <strong>{email}</strong> com as instruções para redefinir sua senha.
                </p>
                <p className="text-sm text-slate-500">
                  Não recebeu o e-mail? Verifique sua caixa de spam ou tente novamente.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => setEmailSent(false)} variant="outline" className="w-full bg-transparent">
                    Tentar outro e-mail
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao login
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar ao login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
