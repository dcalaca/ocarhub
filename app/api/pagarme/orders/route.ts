import { type NextRequest, NextResponse } from "next/server"
import { pagarmeService } from "@/lib/pagarme-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, customer, paymentMethod, metadata = {} } = body

    // Validações
    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Valor mínimo é R$ 1,00" }, { status: 400 })
    }

    if (amount > 1000000) {
      // R$ 10.000,00
      return NextResponse.json({ error: "Valor máximo é R$ 10.000,00" }, { status: 400 })
    }

    if (!customer || !customer.email || !customer.document) {
      return NextResponse.json({ error: "Dados do cliente são obrigatórios" }, { status: 400 })
    }

    // Validar CPF/CNPJ
    const document = customer.document.replace(/\D/g, "")
    if (document.length !== 11 && document.length !== 14) {
      return NextResponse.json({ error: "CPF ou CNPJ inválido" }, { status: 400 })
    }

    let order

    switch (paymentMethod) {
      case "pix":
        order = await pagarmeService.createPixOrder(amount, customer, metadata)
        break

      case "boleto":
        order = await pagarmeService.createBoletoOrder(amount, customer, metadata)
        break

      default:
        return NextResponse.json({ error: "Método de pagamento não suportado" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      order,
      message: `${paymentMethod.toUpperCase()} criado com sucesso`,
    })
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("id")
    const status = searchParams.get("status")
    const paymentMethod = searchParams.get("payment_method")

    if (orderId) {
      const order = await pagarmeService.getOrder(orderId)
      if (!order) {
        return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
      }
      return NextResponse.json({ order })
    }

    // Listar pedidos com filtros
    const orders = await pagarmeService.listOrders({
      status,
      payment_method: paymentMethod,
    })

    return NextResponse.json({ orders, total: orders.length })
  } catch (error: any) {
    console.error("Erro ao buscar pedidos:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
