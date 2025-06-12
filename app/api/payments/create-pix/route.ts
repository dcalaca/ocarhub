import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, description } = await request.json()

    // Verificar autenticação
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Validar dados
    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 })
    }

    // Criar pagamento no Mercado Pago
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: description || `Depósito OcarHub - R$ ${amount.toFixed(2)}`,
        payment_method_id: "pix",
        payer: {
          email: user.email,
        },
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      }),
    })

    const payment = await response.json()

    if (payment.status === "pending") {
      // Salvar transação no banco
      const { data: transaction, error: dbError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "deposit",
          amount: amount,
          status: "pending",
          payment_method: "pix",
          external_payment_id: payment.id.toString(),
          description: description || `Depósito via PIX - R$ ${amount.toFixed(2)}`,
        })
        .select()
        .single()

      if (dbError) {
        console.error("Erro ao salvar transação:", dbError)
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        transaction,
        pixData: {
          paymentId: payment.id,
          qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
          qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
          pixCopyPaste: payment.point_of_interaction?.transaction_data?.qr_code,
        },
      })
    }

    throw new Error(payment.message || "Erro ao criar pagamento PIX")
  } catch (error: any) {
    console.error("Erro na API create-pix:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
