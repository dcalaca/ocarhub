export interface FinanceUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  birth_date?: string
  document_number?: string
  address?: Record<string, any>
  preferences?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface FinanceCalculation {
  id: string
  user_id: string
  type:
    | "juros_compostos"
    | "conversor_moedas"
    | "financiamento"
    | "aposentadoria"
    | "inflacao"
    | "orcamento"
    | "valor_presente_futuro"
    | "investimentos"
  title: string
  inputs: Record<string, any>
  results: Record<string, any>
  tags?: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface FinanceUserPreferences {
  id: string
  user_id: string
  notifications_enabled: boolean
  email_notifications: boolean
  preferred_currency: string
  theme: "light" | "dark"
  language: string
  timezone: string
  dashboard_layout: Record<string, any>
  created_at: string
  updated_at: string
}

export interface FinanceAlert {
  id: string
  user_id: string
  name: string
  type: "currency_rate" | "stock_price" | "interest_rate" | "inflation" | "custom"
  conditions: Record<string, any>
  notification_type: "email" | "push" | "both"
  frequency: "realtime" | "hourly" | "daily" | "weekly"
  is_active: boolean
  last_triggered?: string
  created_at: string
  updated_at: string
}

export interface CurrencyRate {
  id: string
  from_currency: string
  to_currency: string
  rate: number
  source: string
  created_at: string
}

export interface CalculationTemplate {
  id: string
  user_id?: string
  name: string
  description?: string
  type: string
  template_data: Record<string, any>
  is_public: boolean
  usage_count: number
  created_at: string
  updated_at: string
}
