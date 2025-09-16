// Sistema de autenticação de administrador
// Senha do administrador (em produção, usar variável de ambiente)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ocar2024admin"

export interface AdminSession {
  isAuthenticated: boolean
  loginTime: number
  expiresAt: number
}

// Chave para armazenar no localStorage
const ADMIN_SESSION_KEY = 'ocar_admin_session'

// Duração da sessão (24 horas)
const SESSION_DURATION = 24 * 60 * 60 * 1000

export class AdminAuth {
  // Verificar se está autenticado
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const session = localStorage.getItem(ADMIN_SESSION_KEY)
      if (!session) return false

      const adminSession: AdminSession = JSON.parse(session)
      
      // Verificar se a sessão não expirou
      if (Date.now() > adminSession.expiresAt) {
        this.logout()
        return false
      }

      return adminSession.isAuthenticated
    } catch (error) {
      console.error('Erro ao verificar autenticação admin:', error)
      return false
    }
  }

  // Fazer login
  static login(password: string): boolean {
    if (password === ADMIN_PASSWORD) {
      const session: AdminSession = {
        isAuthenticated: true,
        loginTime: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION
      }

      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
      return true
    }
    return false
  }

  // Fazer logout
  static logout(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(ADMIN_SESSION_KEY)
  }

  // Obter informações da sessão
  static getSession(): AdminSession | null {
    if (typeof window === 'undefined') return null

    try {
      const session = localStorage.getItem(ADMIN_SESSION_KEY)
      if (!session) return null

      return JSON.parse(session)
    } catch (error) {
      console.error('Erro ao obter sessão admin:', error)
      return null
    }
  }

  // Verificar se a sessão está próxima do vencimento (últimas 2 horas)
  static isSessionExpiringSoon(): boolean {
    const session = this.getSession()
    if (!session) return false

    const twoHoursFromNow = Date.now() + (2 * 60 * 60 * 1000)
    return session.expiresAt < twoHoursFromNow
  }

  // Renovar sessão
  static renewSession(): boolean {
    if (!this.isAuthenticated()) return false

    const session = this.getSession()
    if (!session) return false

    session.expiresAt = Date.now() + SESSION_DURATION
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
    return true
  }
}
