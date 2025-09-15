import { NextResponse } from "next/server"
import { stripeService } from "@/lib/stripe-service"

export async function POST(request: Request) {
  try {
    const { amount, successUrl, cancelUrl, metadata = {} } = await request.json()

    // Validação básica
    if (!amount || amount < 1000) {
      // Mínimo de R$ 10,00 (1000 centavos)
      return NextResponse.json({ error: "Valor mínimo para depósito é R$ 10,00" }, { status: 400 })
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json({ error: "URLs de sucesso e cancelamento são obrigatórias" }, { status: 400 })
    }

    // Criar sessão de checkout
    const session = await stripeService.createCheckoutSession(amount, "brl", successUrl, cancelUrl, metadata)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error("Erro ao criar sessão de checkout:", error)
    return NextResponse.json({ error: error.message || "Erro ao processar checkout" }, { status: 500 })
  }
}
