"use server"

import { createClient } from "@/lib/supabase/server"

export type Transaction = {
  id: string
  user_id: string
  type: "deposit" | "purchase" | "refund" | "withdrawal"
  amount: number
  description: string
  status: "pending" | "completed" | "failed"
  payment_method?: "pix" | "credit_card"
  created_at: string
  external_payment_id?: string
}

export type UserWallet = {
  user_id: string
  balance: number
  updated_at: string
  totalReceived: number
  totalSpent: number
}

export async function getUserWallet(userId: string): Promise<UserWallet> {
  try {
    const supabase = await createClient()

    // Verificar se o cliente foi criado corretamente
    if (!supabase) {
      console.error("Falha ao criar cliente Supabase")
      return createEmptyWallet(userId)
    }

    // Buscar carteira do usuário com timeout
    const { data: wallet, error } = (await Promise.race([
      supabase.from("user_wallets").select("*").eq("user_id", userId).single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout na consulta")), 10000)),
    ])) as any

    if (error) {
      console.error("Erro ao buscar carteira:", error)

      // Se não existir carteira, criar uma
      if (error.code === "PGRST116") {
        try {
          const { data: newWallet, error: insertError } = await supabase
            .from("user_wallets")
            .insert({
              user_id: userId,
              balance: 0,
              total_received: 0,
              total_spent: 0,
            })
            .select()
            .single()

          if (insertError) {
            console.error("Erro ao criar carteira:", insertError)
            return createEmptyWallet(userId)
          }

          return {
            user_id: newWallet.user_id,
            balance: Number(newWallet.balance) || 0,
            updated_at: newWallet.updated_at,
            totalReceived: Number(newWallet.total_received) || 0,
            totalSpent: Number(newWallet.total_spent) || 0,
          }
        } catch (createError) {
          console.error("Erro ao criar nova carteira:", createError)
          return createEmptyWallet(userId)
        }
      }

      return createEmptyWallet(userId)
    }

    // Verificar se wallet existe e tem dados válidos
    if (!wallet) {
      return createEmptyWallet(userId)
    }

    return {
      user_id: wallet.user_id,
      balance: Number(wallet.balance) || 0,
      updated_at: wallet.updated_at || new Date().toISOString(),
      totalReceived: Number(wallet.total_received) || 0,
      totalSpent: Number(wallet.total_spent) || 0,
    }
  } catch (error: any) {
    console.error("Erro geral ao buscar carteira:", error)

    // Se for erro de JSON, pode ser rate limiting
    if (error.message?.includes("JSON") || error.message?.includes("Too Many")) {
      console.error("Possível rate limiting ou erro de API")
    }

    return createEmptyWallet(userId)
  }
}

function createEmptyWallet(userId: string): UserWallet {
  return {
    user_id: userId,
    balance: 0,
    updated_at: new Date().toISOString(),
    totalReceived: 0,
    totalSpent: 0,
  }
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    const supabase = await createClient()

    if (!supabase) {
      console.error("Falha ao criar cliente Supabase")
      return []
    }

    const { data: transactions, error } = (await Promise.race([
      supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout na consulta")), 10000)),
    ])) as any

    if (error) {
      console.error("Erro ao buscar transações:", error)
      return []
    }

    return (
      transactions?.map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        type: t.type,
        amount: Number(t.amount) || 0,
        description: t.description || "",
        status: t.status,
        payment_method: t.payment_method,
        created_at: t.created_at,
        external_payment_id: t.external_payment_id,
      })) || []
    )
  } catch (error: any) {
    console.error("Erro ao buscar transações:", error)
    return []
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return null
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Erro ao buscar usuário:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Erro geral ao buscar usuário:", error)
    return null
  }
}

export async function addDeposit(userId: string, amount: number, paymentMethod: "pix" | "credit_card") {
  try {
    const supabase = await createClient()

    if (!supabase) {
      throw new Error("Falha ao conectar com o banco de dados")
    }

    // Buscar dados do usuário
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error("Usuário não autenticado")

    if (paymentMethod === "pix") {
      // Por enquanto, simular o pagamento PIX
      const mockPaymentId = `pix_${Date.now()}`

      // Salvar transação pendente no banco
      const { data: transaction, error } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "deposit",
          amount: amount,
          status: "pending",
          payment_method: "pix",
          external_payment_id: mockPaymentId,
          description: `Depósito via PIX - R$ ${amount.toFixed(2)}`,
        })
        .select()
        .single()

      if (error) {
        console.error("Erro ao criar transação:", error)
        throw new Error("Falha ao criar transação")
      }

      return {
        success: true,
        transaction,
        pixData: {
          qrCode: "mock_qr_code",
          qrCodeBase64: "data:image/png;base64,mock",
          pixCopyPaste: "00020126580014BR.GOV.BCB.PIX0136mock-pix-key",
        },
      }
    }

    throw new Error("Método de pagamento não implementado ainda")
  } catch (error: any) {
    console.error("Erro ao criar depósito:", error)
    throw error
  }
}

export async function purchaseVehicleReport(
  userId: string,
  plate: string,
): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "Not implemented yet" }
}

export async function withdrawFunds(
  userId: string,
  amount: number,
  pixKey: string,
): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "Not implemented yet" }
}
