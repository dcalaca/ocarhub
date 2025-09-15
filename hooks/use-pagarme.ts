"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface UsePagarmeOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function usePagarme(options: UsePagarmeOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [boletoData, setBoletoData] = useState<any>(null)
  const { user, addSaldo } = useAuth()
  const { toast } = useToast()

  const createPixPayment = async (amount: number) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/pagarme/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Converter para centavos
          customer: {
            name: user.nome,
            email: user.email,
            document: user.cpf.replace(/\D/g, ""),
            phone: user.telefone.replace(/\D/g, ""),
          },
          paymentMethod: "pix",
          metadata: {
            user_id: user.id,
            platform: "ocar",
            type: "deposit",
            amount_brl: amount,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar pagamento PIX")
      }

      setPixData(data.order)

      toast({
        title: "PIX gerado com sucesso!",
        description: "Escaneie o QR Code ou copie o código PIX para pagar",
      })

      // Simular confirmação automática em desenvolvimento
      if (process.env.NODE_ENV === "development") {
        setTimeout(async () => {
          await addSaldo(amount, "pix")
          toast({
            title: "PIX confirmado! 🎉",
            description: `${amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} foi adicionado à sua conta`,
          })
          options.onSuccess?.(data.order)
          setPixData(null)
        }, 5000)
      }

      return data.order
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido"
      toast({
        title: "Erro no PIX",
        description: message,
        variant: "destructive",
      })
      options.onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  const createBoletoPayment = async (amount: number) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/pagarme/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          customer: {
            name: user.nome,
            email: user.email,
            document: user.cpf.replace(/\D/g, ""),
            phone: user.telefone.replace(/\D/g, ""),
          },
          paymentMethod: "boleto",
          metadata: {
            user_id: user.id,
            platform: "ocar",
            type: "deposit",
            amount_brl: amount,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar boleto")
      }

      setBoletoData(data.order)

      toast({
        title: "Boleto gerado com sucesso!",
        description: "Você pode imprimir ou pagar pelo app do seu banco",
      })

      return data.order
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido"
      toast({
        title: "Erro ao gerar boleto",
        description: message,
        variant: "destructive",
      })
      options.onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  const createCardPayment = async (
    amount: number,
    cardData: {
      number: string
      holder_name: string
      exp_month: string
      exp_year: string
      cvv: string
    },
    installments = 1,
  ) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/pagarme/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          card: cardData,
          customer: {
            name: user.nome,
            email: user.email,
            document: user.cpf.replace(/\D/g, ""),
            phone: user.telefone.replace(/\D/g, ""),
          },
          installments,
          metadata: {
            user_id: user.id,
            platform: "ocar",
            type: "deposit",
            amount_brl: amount,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro no pagamento")
      }

      toast({
        title: "Processando pagamento...",
        description: "Aguarde a confirmação do seu cartão",
      })

      // Aguardar processamento (simulado)
      setTimeout(async () => {
        // Simular aprovação (90% de chance)
        if (Math.random() > 0.1) {
          await addSaldo(amount, "cartao")
          toast({
            title: "Pagamento aprovado! 🎉",
            description: `${amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} foi adicionado à sua conta`,
          })
          options.onSuccess?.(data.transaction)
        } else {
          toast({
            title: "Pagamento recusado",
            description: "Verifique os dados do cartão e tente novamente",
            variant: "destructive",
          })
          options.onError?.("Pagamento recusado pelo banco")
        }
      }, 3000)

      return data.transaction
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido"
      toast({
        title: "Erro no pagamento",
        description: message,
        variant: "destructive",
      })
      options.onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  const copyPixCode = () => {
    if (pixData?.pix?.qr_code) {
      navigator.clipboard.writeText(pixData.pix.qr_code)
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu app de pagamentos",
      })
    }
  }

  const copyBoletoLine = () => {
    if (boletoData?.boleto?.line) {
      navigator.clipboard.writeText(boletoData.boleto.line)
      toast({
        title: "Linha digitável copiada!",
        description: "Cole no seu app bancário",
      })
    }
  }

  const clearPixData = () => setPixData(null)
  const clearBoletoData = () => setBoletoData(null)

  return {
    loading,
    pixData,
    boletoData,
    createPixPayment,
    createBoletoPayment,
    createCardPayment,
    copyPixCode,
    copyBoletoLine,
    clearPixData,
    clearBoletoData,
  }
}
