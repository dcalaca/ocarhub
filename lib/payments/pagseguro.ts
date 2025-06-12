// Integração com PagSeguro (gratuito, cobra 4.99% por transação PIX)
export class PagSeguroService {
  private token: string
  private email: string

  constructor() {
    this.token = process.env.PAGSEGURO_TOKEN || ""
    this.email = process.env.PAGSEGURO_EMAIL || ""
  }

  async createPixPayment(amount: number, description: string, userEmail: string) {
    try {
      const response = await fetch("https://ws.sandbox.pagseguro.uol.com.br/v2/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: this.email,
          token: this.token,
          currency: "BRL",
          itemId1: "1",
          itemDescription1: description,
          itemAmount1: amount.toFixed(2),
          itemQuantity1: "1",
          senderEmail: userEmail,
          paymentMethod: "pix",
        }),
      })

      const result = await response.text()
      // PagSeguro retorna XML, você precisaria parsear

      return {
        success: true,
        checkoutCode: result, // Código do checkout
      }
    } catch (error: any) {
      console.error("Erro no PagSeguro:", error)
      throw error
    }
  }
}
