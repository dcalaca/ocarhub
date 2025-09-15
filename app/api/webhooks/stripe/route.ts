import { NextResponse } from "next/server"
import { stripeService } from "@/lib/stripe-service"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get("stripe-signature") || ""

    // Verificar assinatura do webhook
    const isValid = stripeService.verifyWebhookSignature(body, signature)

    if (!isValid) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 })
    }

    // Processar evento
    const event = JSON.parse(body)

    console.log(`Evento recebido: ${event.type}`)

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object)
        break
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object)
        break
      // Adicione outros casos conforme necessário
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ error: error.message || "Erro ao processar webhook" }, { status: 500 })
  }
}

// Funções para lidar com eventos específicos
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log("Pagamento bem-sucedido:", paymentIntent)

  // Em produção: Atualize o saldo do usuário no banco de dados
  // const userId = paymentIntent.metadata.userId;
  // const amount = paymentIntent.amount / 100; // Converter de centavos para reais
  // await db.users.updateSaldo(userId, amount);
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log("Sessão de checkout concluída:", session)

  // Em produção: Atualize o saldo do usuário no banco de dados
  // const userId = session.metadata.userId;
  // const amount = session.amount_total / 100; // Converter de centavos para reais
  // await db.users.updateSaldo(userId, amount);
}
