"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Phone, Shield } from "lucide-react"

interface PhoneVerificationProps {
  phone: string
  onVerified: () => void
  onSkip?: () => void
}

export function PhoneVerification({ phone, onVerified, onSkip }: PhoneVerificationProps) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { toast } = useToast()

  const sendVerificationCode = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/verify/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (data.success) {
        setCodeSent(true)
        setCountdown(60) // 60 segundos para reenvio

        // Countdown timer
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        toast({
          title: "Código enviado",
          description: `Código de verificação enviado para ${phone}`,
        })
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao enviar código",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar código de verificação",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const verifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "Erro",
        description: "Digite o código de 6 dígitos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/verify/check-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, code }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Telefone verificado",
          description: "Seu telefone foi verificado com sucesso!",
        })
        onVerified()
      } else {
        toast({
          title: "Código inválido",
          description: data.error || "O código digitado está incorreto",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar código",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>Verificar Telefone</CardTitle>
        <CardDescription>
          {!codeSent ? `Enviaremos um código de verificação para ${phone}` : `Digite o código enviado para ${phone}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!codeSent ? (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>Número: {phone}</span>
            </div>
            <Button onClick={sendVerificationCode} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Código"
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificação</Label>
              <Input
                id="code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                disabled={loading}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={verifyCode} disabled={loading || code.length !== 6} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar"
                )}
              </Button>
              <Button variant="outline" onClick={sendVerificationCode} disabled={loading || countdown > 0}>
                {countdown > 0 ? `${countdown}s` : "Reenviar"}
              </Button>
            </div>
          </>
        )}

        {onSkip && (
          <Button variant="ghost" onClick={onSkip} className="w-full">
            Pular verificação
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
