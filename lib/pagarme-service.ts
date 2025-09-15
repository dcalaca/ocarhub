/**
 * Serviço completo do Pagar.me para desenvolvimento
 * Em produção, substitua por: npm install pagarme-js-sdk
 */

interface PagarmeCustomer {
  name: string
  email: string
  document: string
  phone: string
  address?: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
  }
}

interface PagarmeCard {
  number: string
  holder_name: string
  exp_month: string
  exp_year: string
  cvv: string
}

class PagarmeService {
  private orders: Map<string, any> = new Map()
  private transactions: Map<string, any> = new Map()
  private customers: Map<string, any> = new Map()

  // Configurações simuladas
  private readonly config = {
    apiKey: "ak_test_simulated_pagarme_key",
    encryptionKey: "ek_test_simulated_encryption_key",
    environment: "sandbox",
    webhookUrl: "https://ocar.com.br/api/webhooks/pagarme",
  }

  /**
   * Cria ou atualiza um cliente
   */
  async createCustomer(customerData: PagarmeCustomer) {
    const customer = {
      id: `cust_${this.generateId()}`,
      ...customerData,
      document: this.formatDocument(customerData.document),
      phone: this.formatPhone(customerData.phone),
      created_at: new Date(),
    }

    this.customers.set(customer.id, customer)
    console.log("✅ Cliente Pagar.me criado:", customer)
    return customer
  }

  /**
   * Cria um pedido PIX
   */
  async createPixOrder(amount: number, customer: PagarmeCustomer, metadata: Record<string, any> = {}) {
    const pixCode = this.generatePixCode()
    const order = {
      id: `order_${this.generateId()}`,
      amount,
      currency: "BRL",
      status: "pending",
      payment_method: "pix",
      customer: await this.createCustomer(customer),
      metadata: {
        ...metadata,
        platform: "ocar",
        payment_type: "deposit",
      },
      created_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos

      // Dados específicos do PIX
      pix: {
        qr_code: pixCode,
        qr_code_url: `https://api.pagar.me/qr_codes/${this.generateId()}.png`,
        qr_code_base64: this.generateQRCodeBase64(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        additional_information: [
          {
            name: "Depósito Ocar",
            value: `Usuário: ${customer.name}`,
          },
        ],
      },
    }

    this.orders.set(order.id, order)
    console.log("✅ Pedido PIX criado:", order)

    // Simular confirmação automática após 5 segundos (apenas para desenvolvimento)
    if (process.env.NODE_ENV === "development") {
      setTimeout(() => {
        this.simulatePixPayment(order.id)
      }, 5000)
    }

    return order
  }

  /**
   * Cria um pedido de boleto
   */
  async createBoletoOrder(amount: number, customer: PagarmeCustomer, metadata: Record<string, any> = {}) {
    const order = {
      id: `order_${this.generateId()}`,
      amount,
      currency: "BRL",
      status: "pending",
      payment_method: "boleto",
      customer: await this.createCustomer(customer),
      metadata: {
        ...metadata,
        platform: "ocar",
        payment_type: "deposit",
      },
      created_at: new Date(),
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias

      // Dados específicos do boleto
      boleto: {
        barcode: this.generateBoleto(),
        line: this.generateBoletoLine(),
        url: `https://api.pagar.me/boletos/${this.generateId()}.pdf`,
        expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        instructions: "Não receber após o vencimento. Após o vencimento, cobrar multa de 2%.",
        bank: "341", // Itaú
        bank_name: "Itaú Unibanco S.A.",
      },
    }

    this.orders.set(order.id, order)
    console.log("✅ Pedido Boleto criado:", order)
    return order
  }

  /**
   * Cria uma transação de cartão
   */
  async createCardTransaction(
    amount: number,
    card: PagarmeCard,
    customer: PagarmeCustomer,
    installments = 1,
    metadata: Record<string, any> = {},
  ) {
    // Validar cartão
    const cardValidation = this.validateCard(card)
    if (!cardValidation.valid) {
      throw new Error(cardValidation.error)
    }

    const transaction = {
      id: `trans_${this.generateId()}`,
      amount,
      installments,
      status: "processing",
      payment_method: "credit_card",
      customer: await this.createCustomer(customer),
      metadata: {
        ...metadata,
        platform: "ocar",
        payment_type: "deposit",
      },
      created_at: new Date(),

      // Dados do cartão (mascarados)
      card: {
        id: `card_${this.generateId()}`,
        last_digits: card.number.slice(-4),
        brand: this.detectCardBrand(card.number),
        holder_name: card.holder_name,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        country: "BR",
        type: "credit",
      },

      // Dados da autorização
      authorization: {
        code: this.generateId().substring(0, 6).toUpperCase(),
        nsu: this.generateId().substring(0, 8),
        tid: this.generateId().substring(0, 10),
      },
    }

    this.transactions.set(transaction.id, transaction)
    console.log("✅ Transação de cartão criada:", transaction)

    // Simular processamento
    setTimeout(() => {
      this.processCardTransaction(transaction.id)
    }, 3000)

    return transaction
  }

  /**
   * Simula o processamento de uma transação de cartão
   */
  private async processCardTransaction(transactionId: string) {
    const transaction = this.transactions.get(transactionId)
    if (!transaction) return

    // 90% de aprovação para simulação
    const isApproved = Math.random() > 0.1

    if (isApproved) {
      transaction.status = "paid"
      transaction.authorization.code = this.generateId().substring(0, 6).toUpperCase()
      console.log("✅ Transação aprovada:", transaction.id)
    } else {
      transaction.status = "refused"
      transaction.refuse_reason = "Cartão recusado pelo banco emissor"
      console.log("❌ Transação recusada:", transaction.id)
    }

    transaction.updated_at = new Date()

    // Simular webhook
    this.triggerWebhook("transaction.status_changed", transaction)
  }

  /**
   * Simula pagamento PIX
   */
  private async simulatePixPayment(orderId: string) {
    const order = this.orders.get(orderId)
    if (!order || order.status !== "pending") return

    order.status = "paid"
    order.paid_at = new Date()
    order.updated_at = new Date()

    console.log("✅ PIX confirmado:", order.id)

    // Simular webhook
    this.triggerWebhook("order.paid", order)
  }

  /**
   * Simula webhook
   */
  private triggerWebhook(event: string, data: any) {
    const webhook = {
      id: `hook_${this.generateId()}`,
      event,
      data: {
        object: data,
      },
      created_at: new Date(),
    }

    console.log("🔔 Webhook simulado:", webhook)

    // Em desenvolvimento, simular chamada HTTP
    if (process.env.NODE_ENV === "development") {
      setTimeout(() => {
        fetch("/api/webhooks/pagarme", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Hub-Signature-256": "simulated_signature",
          },
          body: JSON.stringify(webhook),
        }).catch(console.error)
      }, 1000)
    }
  }

  /**
   * Busca um pedido
   */
  async getOrder(orderId: string) {
    return this.orders.get(orderId) || null
  }

  /**
   * Busca uma transação
   */
  async getTransaction(transactionId: string) {
    return this.transactions.get(transactionId) || null
  }

  /**
   * Lista pedidos
   */
  async listOrders(filters: any = {}) {
    let orders = Array.from(this.orders.values())

    if (filters.status) {
      orders = orders.filter((o) => o.status === filters.status)
    }

    if (filters.payment_method) {
      orders = orders.filter((o) => o.payment_method === filters.payment_method)
    }

    return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  /**
   * Valida cartão de crédito
   */
  private validateCard(card: PagarmeCard) {
    // Validar número do cartão (Luhn)
    if (!this.isValidCardNumber(card.number)) {
      return { valid: false, error: "Número do cartão inválido" }
    }

    // Validar data de expiração
    const currentDate = new Date()
    const expDate = new Date(Number.parseInt(`20${card.exp_year}`), Number.parseInt(card.exp_month) - 1)

    if (expDate < currentDate) {
      return { valid: false, error: "Cartão expirado" }
    }

    // Validar CVV
    if (!card.cvv || card.cvv.length < 3 || card.cvv.length > 4) {
      return { valid: false, error: "CVV inválido" }
    }

    return { valid: true }
  }

  /**
   * Algoritmo de Luhn para validar cartão
   */
  private isValidCardNumber(cardNumber: string): boolean {
    const number = cardNumber.replace(/\s/g, "")
    let sum = 0
    let isEven = false

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(number[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  /**
   * Detecta bandeira do cartão
   */
  private detectCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, "")

    // Visa
    if (/^4/.test(number)) return "visa"

    // Mastercard
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return "mastercard"

    // Elo
    if (/^(4011|4312|4389|4514|4573|6277|6362|6363|6504|6505|6516|6550)/.test(number)) return "elo"

    // American Express
    if (/^3[47]/.test(number)) return "amex"

    // Hipercard
    if (/^(3841|6062)/.test(number)) return "hipercard"

    return "unknown"
  }

  /**
   * Formata documento (CPF/CNPJ)
   */
  private formatDocument(document: string): string {
    const numbers = document.replace(/\D/g, "")

    if (numbers.length === 11) {
      // CPF
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }

    if (numbers.length === 14) {
      // CNPJ
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }

    return numbers
  }

  /**
   * Formata telefone
   */
  private formatPhone(phone: string): string {
    const numbers = phone.replace(/\D/g, "")

    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }

    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }

    return numbers
  }

  /**
   * Gera código PIX simulado
   */
  private generatePixCode(): string {
    return `00020126580014br.gov.bcb.pix0136${this.generateId()}52040000530398654${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}5802BR5925OCAR PLATAFORMA DE VEICUL6009SAO PAULO62070503***6304${this.generateId().substring(0, 4).toUpperCase()}`
  }

  /**
   * Gera QR Code base64 simulado
   */
  private generateQRCodeBase64(): string {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }

  /**
   * Gera código de barras do boleto
   */
  private generateBoleto(): string {
    const bank = "341" // Itaú
    const currency = "9"
    const dueDate = "9999" // Dias desde 07/10/1997
    const amount = String(Math.floor(Math.random() * 100000)).padStart(10, "0")
    const ourNumber = String(Math.floor(Math.random() * 10000000)).padStart(7, "0")

    return `${bank}${currency}${this.generateId().substring(0, 1)}${dueDate}${amount}${ourNumber}${this.generateId().substring(0, 10)}`
  }

  /**
   * Gera linha digitável do boleto
   */
  private generateBoletoLine(): string {
    const barcode = this.generateBoleto()
    // Simplificado para demonstração
    return `${barcode.substring(0, 5)}.${barcode.substring(5, 10)} ${barcode.substring(10, 15)}.${barcode.substring(15, 21)} ${barcode.substring(21, 26)}.${barcode.substring(26, 32)} ${barcode.substring(32, 33)} ${barcode.substring(33)}`
  }

  /**
   * Gera ID aleatório
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * Retorna configurações
   */
  getConfig() {
    return this.config
  }
}

export const pagarmeService = new PagarmeService()
