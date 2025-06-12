// Integração com Mercado Pago (gratuito, cobra 4.99% + R$0,39 por transação)
export class MercadoPagoService {
  private accessToken: string

  constructor() {
    this.accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ""
  }

  async createPixPayment(amount: number, description: string, userEmail: string) {
    try {
      const response = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_amount: amount,
          description: description,
          payment_method_id: "pix",
          payer: {
            email: userEmail,
          },
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
        }),
      })

      const payment = await response.json()

      if (payment.status === "pending") {
        return {
          success: true,
          paymentId: payment.id,
          qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
          qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
          pixCopyPaste: payment.point_of_interaction?.transaction_data?.qr_code,
        }
      }

      throw new Error(payment.message || "Erro ao criar pagamento PIX")
    } catch (error: any) {
      console.error("Erro no Mercado Pago:", error)
      throw error
    }
  }

  async checkPaymentStatus(paymentId: string) {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      const payment = await response.json()
      return {
        status: payment.status, // pending, approved, rejected
        statusDetail: payment.status_detail,
      }
    } catch (error) {
      console.error("Erro ao verificar status do pagamento:", error)
      throw error
    }
  }
}
