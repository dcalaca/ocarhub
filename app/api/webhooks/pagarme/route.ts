import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get("x-hub-signature-256")

    // Em produção, verificar assinatura do webhook
    // const isValid = pagarmeService.verifyWebhookSignature(body, signature)
    // if (!isValid) {
    //   return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
    // }

    console.log("🔔 Webhook Pagar.me recebido:", body)

    const { event, data } = body

    switch (event) {
      case "order.paid":
        await handleOrderPaid(data.object)
        break

      case "order.payment_failed":
        await handleOrderFailed(data.object)
        break

      case "transaction.status_changed":
        await handleTransactionStatusChanged(data.object)
        break

      case "order.canceled":
        await handleOrderCanceled(data.object)
        break

      default:
        console.log("Evento não tratado:", event)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Erro no webhook Pagar.me:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}

async function handleOrderPaid(order: any) {
  console.log("✅ Pedido pago via Pagar.me:", order.id)

  try {
    // Aqui você atualizaria o saldo do usuário no banco de dados
    const userId = order.metadata?.user_id
    const amount = order.amount / 100 // Converter de centavos para reais

    if (userId && amount) {
      // await updateUserBalance(userId, amount)
      console.log(`💰 Saldo atualizado: Usuário ${userId} + R$ ${amount}`)

      // Registrar transação
      // await createTransaction({
      //   userId,
      //   type: 'deposit',
      //   amount,
      //   method: order.payment_method,
      //   status: 'approved',
      //   externalId: order.id,
      //   description: `Depósito via ${order.payment_method.toUpperCase()}`
      // })

      // Enviar notificação para o usuário
      // await sendNotification(userId, {
      //   title: 'Depósito confirmado!',
      //   message: `R$ ${amount.toFixed(2)} foi adicionado à sua conta`,
      //   type: 'payment_success'
      // })
    }
  } catch (error) {
    console.error("Erro ao processar pagamento confirmado:", error)
  }
}

async function handleOrderFailed(order: any) {
  console.log("❌ Pagamento falhou via Pagar.me:", order.id)

  try {
    const userId = order.metadata?.user_id

    if (userId) {
      // Registrar falha
      // await createTransaction({
      //   userId,
      //   type: 'deposit',
      //   amount: order.amount / 100,
      //   method: order.payment_method,
      //   status: 'failed',
      //   externalId: order.id,
      //   description: `Falha no depósito via ${order.payment_method.toUpperCase()}`
      // })
      // Notificar usuário sobre falha
      // await sendNotification(userId, {
      //   title: 'Pagamento não processado',
      //   message: 'Houve um problema com seu pagamento. Tente novamente.',
      //   type: 'payment_failed'
      // })
    }
  } catch (error) {
    console.error("Erro ao processar falha de pagamento:", error)
  }
}

async function handleTransactionStatusChanged(transaction: any) {
  console.log("🔄 Status da transação alterado:", transaction.id, "->", transaction.status)

  try {
    const userId = transaction.metadata?.user_id

    if (transaction.status === "paid" && userId) {
      const amount = transaction.amount / 100

      // Atualizar saldo
      // await updateUserBalance(userId, amount)

      // Registrar transação
      // await createTransaction({
      //   userId,
      //   type: 'deposit',
      //   amount,
      //   method: 'credit_card',
      //   status: 'approved',
      //   externalId: transaction.id,
      //   description: `Depósito via cartão ${transaction.card.brand} ****${transaction.card.last_digits}`
      // })

      console.log(`💳 Cartão aprovado: Usuário ${userId} + R$ ${amount}`)
    } else if (transaction.status === "refused" && userId) {
      // Registrar recusa
      // await createTransaction({
      //   userId,
      //   type: 'deposit',
      //   amount: transaction.amount / 100,
      //   method: 'credit_card',
      //   status: 'failed',
      //   externalId: transaction.id,
      //   description: `Cartão recusado: ${transaction.refuse_reason || 'Motivo não informado'}`
      // })

      console.log(`💳 Cartão recusado: ${transaction.refuse_reason}`)
    }
  } catch (error) {
    console.error("Erro ao processar mudança de status:", error)
  }
}

async function handleOrderCanceled(order: any) {
  console.log("🚫 Pedido cancelado:", order.id)

  try {
    const userId = order.metadata?.user_id

    if (userId) {
      // Registrar cancelamento
      // await createTransaction({
      //   userId,
      //   type: 'deposit',
      //   amount: order.amount / 100,
      //   method: order.payment_method,
      //   status: 'canceled',
      //   externalId: order.id,
      //   description: `Pagamento cancelado via ${order.payment_method.toUpperCase()}`
      // })
    }
  } catch (error) {
    console.error("Erro ao processar cancelamento:", error)
  }
}
