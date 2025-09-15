"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface UseStripeOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useStripe(options: UseStripeOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const { user, addSaldo } = useAuth()
  const { toast } = useToast()

  // Função para criar uma intenção de pagamento
  const createPayment = async (amount: number, method: "pix" | "card" | "boleto" = "pix") => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para adicionar saldo",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Converter para centavos
      const amountInCents = Math.round(amount * 100)

      // Chamar a API para criar uma intenção de pagamento
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInCents,
          metadata: {
            userId: user.id,
            userEmail: user.email,
            paymentMethod: method,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar pagamento")
      }

      setClientSecret(data.clientSecret)

      // Em ambiente de desenvolvimento, simular pagamento bem-sucedido
      if (process.env.NODE_ENV === "development") {
        console.log("Simulando pagamento bem-sucedido...")
        await simulatePaymentSuccess(amount, method)
      }

      return data
    } catch (err: any) {
      setError(err)
      options.onError?.(err)
      toast({
        title: "Erro no pagamento",
        description: err.message || "Não foi possível processar o pagamento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para criar uma sessão de checkout
  const createCheckoutSession = async (amount: number) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para adicionar saldo",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Converter para centavos
      const amountInCents = Math.round(amount * 100)

      // URL base da aplicação
      const baseUrl = window.location.origin

      // Chamar a API para criar uma sessão de checkout
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInCents,
          successUrl: `${baseUrl}/conta?payment=success&amount=${amount}`,
          cancelUrl: `${baseUrl}/conta?payment=canceled`,
          metadata: {
            userId: user.id,
            userEmail: user.email,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar checkout")
      }

      setCheckoutUrl(data.url)

      // Em ambiente de desenvolvimento, simular checkout bem-sucedido
      if (process.env.NODE_ENV === "development") {
        console.log("Simulando checkout bem-sucedido...")
        await simulateCheckoutSuccess(amount)
      } else {
        // Em produção, redirecionar para a URL do checkout
        window.location.href = data.url
      }

      return data
    } catch (err: any) {
      setError(err)
      options.onError?.(err)
      toast({
        title: "Erro no checkout",
        description: err.message || "Não foi possível processar o checkout",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para simular pagamento bem-sucedido (apenas para desenvolvimento)
  const simulatePaymentSuccess = async (amount: number, method: string) => {
    // Simular delay de processamento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Adicionar saldo ao usuário
    await addSaldo(amount, method as any)

    toast({
      title: "Pagamento simulado com sucesso!",
      description: `${amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} adicionado à sua conta`,
    })

    options.onSuccess?.({ amount, method })
  }

  // Função para simular checkout bem-sucedido (apenas para desenvolvimento)
  const simulateCheckoutSuccess = async (amount: number) => {
    // Simular delay de processamento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Adicionar saldo ao usuário
    await addSaldo(amount, "pix")

    toast({
      title: "Checkout simulado com sucesso!",
      description: `${amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} adicionado à sua conta`,
    })

    options.onSuccess?.({ amount })
  }

  return {
    loading,
    error,
    clientSecret,
    checkoutUrl,
    createPayment,
    createCheckoutSession,
  }
}
