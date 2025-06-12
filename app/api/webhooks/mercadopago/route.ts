import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { MercadoPagoService } from "@/lib/payments/mercadopago"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verificar se é uma notificação de pagamento
    if (body.type === "payment") {
      const paymentId = body.data.id

      const mercadoPago = new MercadoPagoService()
      const paymentStatus = await mercadoPago.checkPaymentStatus(paymentId)

      const supabase = createClient()

      // Atualizar status da transação
      if (paymentStatus.status === "approved") {
        await supabase
          .from("transactions")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("external_payment_id", paymentId)
      } else if (paymentStatus.status === "rejected") {
        await supabase
          .from("transactions")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("external_payment_id", paymentId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro no webhook:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
