export interface StripeConfig {
  publicKey: string
  secretKey: string
  webhookSecret: string
  isLive: boolean
}

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: PaymentStatus
  createdAt: Date
  metadata: Record<string, string>
}

export type PaymentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "requires_capture"
  | "canceled"
  | "succeeded"

export interface PaymentMethod {
  id: string
  type: "card" | "pix" | "boleto"
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  pix?: {
    expiresAt: Date
    qrCode: string
    qrCodeUrl: string
  }
  boleto?: {
    pdf: string
    expiresAt: Date
    barcode: string
  }
}

export interface CheckoutSession {
  id: string
  url: string
  status: "open" | "complete" | "expired"
  amountTotal: number
  currency: string
  paymentStatus: PaymentStatus
  createdAt: Date
  expiresAt: Date
  metadata: Record<string, string>
}

export interface StripeEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

export interface StripeCustomer {
  id: string
  email: string
  name: string
  metadata: Record<string, string>
}
