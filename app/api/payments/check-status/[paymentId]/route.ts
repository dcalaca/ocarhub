import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const { paymentId } = params

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    })

    const payment = await response.json()

    return NextResponse.json({
      status: payment.status, // pending, approved, rejected
      statusDetail: payment.status_detail,
    })
  } catch (error: any) {
    console.error("Erro ao verificar status do pagamento:", error)
    return NextResponse.json({ error: "Erro ao verificar status do pagamento" }, { status: 500 })
  }
}
