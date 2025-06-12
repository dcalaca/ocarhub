"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Copy, CheckCircle, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PixPaymentProps {
  onPaymentCreated?: (paymentData: any) => void
}

export function PixPayment({ onPaymentCreated }: PixPaymentProps) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<{
    qrCode: string
    qrCodeBase64: string
    pixCopyPaste: string
    paymentId: string
  } | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "approved" | "rejected" | null>(null)

  const handleCreatePayment = async () => {
    if (!amount || Number.parseFloat(amount) < 1) {
      toast({
        title: "Valor inválido",
        description: "O valor mínimo para depósito é R$ 1,00",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/payments/create-pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          description: `Depósito OcarHub - R$ ${amount}`,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPixData(result.pixData)
        setPaymentStatus("pending")
        onPaymentCreated?.(result)

        // Iniciar verificação de status
        startPaymentStatusCheck(result.pixData.paymentId)

        toast({
          title: "PIX gerado com sucesso!",
          description: "Escaneie o QR Code ou copie o código PIX para pagar",
        })
      } else {
        throw new Error(result.error || "Erro ao criar pagamento PIX")
      }
    } catch (error: any) {
      console.error("Erro ao criar PIX:", error)
      toast({
        title: "Erro ao gerar PIX",
        description: error.message || "Tente novamente em alguns instantes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const startPaymentStatusCheck = (paymentId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/check-status/${paymentId}`)
        const result = await response.json()

        if (result.status === "approved") {
          setPaymentStatus("approved")
          toast({
            title: "Pagamento aprovado! 🎉",
            description: "Seu saldo foi atualizado com sucesso",
          })
          return true // Para o loop
        } else if (result.status === "rejected") {
          setPaymentStatus("rejected")
          toast({
            title: "Pagamento rejeitado",
            description: "Tente novamente ou use outro método",
            variant: "destructive",
          })
          return true // Para o loop
        }
        return false // Continua verificando
      } catch (error) {
        console.error("Erro ao verificar status:", error)
        return false
      }
    }

    // Verifica a cada 3 segundos por até 5 minutos
    const interval = setInterval(async () => {
      const shouldStop = await checkStatus()
      if (shouldStop) {
        clearInterval(interval)
      }
    }, 3000)

    // Para após 5 minutos
    setTimeout(
      () => {
        clearInterval(interval)
      },
      5 * 60 * 1000,
    )
  }

  const copyPixCode = () => {
    if (pixData?.pixCopyPaste) {
      navigator.clipboard.writeText(pixData.pixCopyPaste)
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu app do banco para pagar",
      })
    }
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    const formattedValue = (Number.parseInt(numericValue) / 100).toFixed(2)
    return formattedValue
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setAmount(formatted)
  }

  if (pixData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {paymentStatus === "approved" ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Pagamento Aprovado!
              </>
            ) : (
              <>
                <Clock className="h-5 w-5 text-yellow-500" />
                Aguardando Pagamento
              </>
            )}
          </CardTitle>
          <CardDescription>
            {paymentStatus === "approved" ? "Seu saldo foi atualizado com sucesso" : `Valor: R$ ${amount}`}
          </CardDescription>
        </CardHeader>

        {paymentStatus !== "approved" && (
          <CardContent className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code PIX" className="w-48 h-48" />
              </div>
            </div>

            {/* Código PIX para copiar */}
            <div className="space-y-2">
              <Label>Código PIX (Copia e Cola)</Label>
              <div className="flex gap-2">
                <Input value={pixData.pixCopyPaste} readOnly className="font-mono text-xs" />
                <Button onClick={copyPixCode} size="icon" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>• Escaneie o QR Code com seu app do banco</p>
              <p>• Ou copie e cole o código PIX</p>
              <p>• O pagamento será processado automaticamente</p>
            </div>

            <Button
              onClick={() => {
                setPixData(null)
                setPaymentStatus(null)
                setAmount("")
              }}
              variant="outline"
              className="w-full"
            >
              Cancelar
            </Button>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Depósito via PIX
        </CardTitle>
        <CardDescription>Adicione saldo à sua carteira de forma rápida e segura</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor do depósito</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
            <Input
              id="amount"
              type="text"
              placeholder="0,00"
              value={amount}
              onChange={handleAmountChange}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">Valor mínimo: R$ 1,00 • Taxa: 0,99%</p>
        </div>

        <Button
          onClick={handleCreatePayment}
          disabled={loading || !amount || Number.parseFloat(amount) < 1}
          className="w-full"
        >
          {loading ? "Gerando PIX..." : "Gerar PIX"}
        </Button>
      </CardContent>
    </Card>
  )
}
