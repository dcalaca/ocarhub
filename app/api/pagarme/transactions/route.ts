import { type NextRequest, NextResponse } from "next/server"
import { pagarmeService } from "@/lib/pagarme-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, card, customer, installments = 1, metadata = {} } = body

    // Validações
    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Valor mínimo é R$ 1,00" }, { status: 400 })
    }

    if (!card || !card.number || !card.holder_name || !card.exp_month || !card.exp_year || !card.cvv) {
      return NextResponse.json({ error: "Dados do cartão são obrigatórios" }, { status: 400 })
    }

    if (!customer || !customer.email || !customer.document) {
      return NextResponse.json({ error: "Dados do cliente são obrigatórios" }, { status: 400 })
    }

    if (installments < 1 || installments > 12) {
      return NextResponse.json({ error: "Número de parcelas deve ser entre 1 e 12" }, { status: 400 })
    }

    // Criar transação
    const transaction = await pagarmeService.createCardTransaction(amount, card, customer, installments, metadata)

    return NextResponse.json({
      success: true,
      transaction,
      message: "Transação criada com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao criar transação:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("id")

    if (transactionId) {
      const transaction = await pagarmeService.getTransaction(transactionId)
      if (!transaction) {
        return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
      }
      return NextResponse.json({ transaction })
    }

    return NextResponse.json({ error: "ID da transação é obrigatório" }, { status: 400 })
  } catch (error: any) {
    console.error("Erro ao buscar transação:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
