import { NextResponse } from "next/server"
import { stripeService } from "@/lib/stripe-service"

export async function POST(request: Request) {
  try {
    const { amount, metadata = {} } = await request.json()

    // Validação básica
    if (!amount || amount < 1000) {
      // Mínimo de R$ 10,00 (1000 centavos)
      return NextResponse.json({ error: "Valor mínimo para depósito é R$ 10,00" }, { status: 400 })
    }

    // Criar intenção de pagamento
    const paymentIntent = await stripeService.createPaymentIntent(amount, "brl", metadata)

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: any) {
    console.error("Erro ao criar pagamento:", error)
    return NextResponse.json({ error: error.message || "Erro ao processar pagamento" }, { status: 500 })
  }
}
