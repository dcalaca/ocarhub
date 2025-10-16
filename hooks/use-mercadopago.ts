import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

interface CreatePreferenceResponse {
  success: boolean
  preferenceId?: string
  initPoint?: string
  externalReference?: string
  error?: string
}

export function useMercadoPago() {
  const { user, refreshSaldo } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const createPaymentPreference = async (valor: number, descricao: string): Promise<CreatePreferenceResponse> => {
    if (!user) {
      return { success: false, error: 'Usuário não logado' }
    }

    if (valor < 10) {
      return { success: false, error: 'Valor mínimo é R$ 10,00' }
    }

    setLoading(true)
    
    try {
      console.log('🚀 Criando preferência de pagamento:', { valor, descricao, userId: user.id })
      
      const response = await fetch('/api/createPreference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valor,
          userId: user.id,
          descricao
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Erro ao criar preferência:', data)
        return { success: false, error: data.error || 'Erro ao criar preferência' }
      }

      console.log('✅ Preferência criada:', data)
      return data

    } catch (error) {
      console.error('❌ Erro na requisição:', error)
      return { success: false, error: 'Erro de conexão' }
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async (valor: number, descricao: string) => {
    const result = await createPaymentPreference(valor, descricao)
    
    if (!result.success) {
      toast({
        title: "Erro no pagamento",
        description: result.error || 'Erro desconhecido',
        variant: "destructive",
      })
      return false
    }

    if (result.initPoint) {
      // Redirecionar para o checkout do Mercado Pago
      window.location.href = result.initPoint
      return true
    }

    toast({
      title: "Erro no pagamento",
      description: "Link de pagamento não gerado",
      variant: "destructive",
    })
    return false
  }

  const checkPaymentStatus = async () => {
    if (!user) return

    try {
      // Recarregar saldo para verificar se houve atualização
      await refreshSaldo()
      
      toast({
        title: "Saldo atualizado",
        description: "Verificando movimentações recentes...",
      })
    } catch (error) {
      console.error('❌ Erro ao verificar status do pagamento:', error)
    }
  }

  return {
    loading,
    processPayment,
    checkPaymentStatus,
    createPaymentPreference
  }
}
