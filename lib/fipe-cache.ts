// Sistema de cache inteligente para dados da FIPE
// Armazena dados localmente para economia de requisições

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class FipeCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly defaultTTL = 24 * 60 * 60 * 1000 // 24 horas
  private readonly brandsTTL = 7 * 24 * 60 * 60 * 1000 // 7 dias (marcas mudam raramente)
  private readonly modelsTTL = 3 * 24 * 60 * 60 * 1000 // 3 dias (modelos mudam ocasionalmente)
  private readonly yearsTTL = 24 * 60 * 60 * 1000 // 1 dia (anos mudam mensalmente)

  // Salvar no cache
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    })

    // Salvar no localStorage também (apenas no navegador)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`fipe_cache_${key}`, JSON.stringify({
          data,
          timestamp: now,
          expiresAt
        }))
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error)
      }
    }
  }

  // Obter do cache
  get<T>(key: string): T | null {
    // Primeiro, tentar do cache em memória
    const cached = this.cache.get(key)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data
    }

    // Se não estiver em memória ou expirado, tentar localStorage (apenas no navegador)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`fipe_cache_${key}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Date.now() < parsed.expiresAt) {
            // Restaurar no cache em memória
            this.cache.set(key, parsed)
            return parsed.data
          } else {
            // Remover do localStorage se expirado
            localStorage.removeItem(`fipe_cache_${key}`)
          }
        }
      } catch (error) {
        console.warn('Erro ao ler do localStorage:', error)
      }
    }

    return null
  }

  // Verificar se existe no cache
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Remover do cache
  delete(key: string): void {
    this.cache.delete(key)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`fipe_cache_${key}`)
      } catch (error) {
        console.warn('Erro ao remover do localStorage:', error)
      }
    }
  }

  // Limpar cache expirado
  cleanExpired(): void {
    const now = Date.now()
    
    // Limpar cache em memória
    for (const [key, item] of this.cache.entries()) {
      if (now >= item.expiresAt) {
        this.cache.delete(key)
      }
    }

    // Limpar localStorage (apenas no navegador)
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        for (const key of keys) {
          if (key.startsWith('fipe_cache_')) {
            const stored = localStorage.getItem(key)
            if (stored) {
              const parsed = JSON.parse(stored)
              if (now >= parsed.expiresAt) {
                localStorage.removeItem(key)
              }
            }
          }
        }
      } catch (error) {
        console.warn('Erro ao limpar localStorage:', error)
      }
    }
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear()
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        for (const key of keys) {
          if (key.startsWith('fipe_cache_')) {
            localStorage.removeItem(key)
          }
        }
      } catch (error) {
        console.warn('Erro ao limpar localStorage:', error)
      }
    }
  }

  // Obter estatísticas do cache
  getStats(): { totalItems: number; memoryItems: number; localStorageItems: number } {
    const memoryItems = this.cache.size
    let localStorageItems = 0
    
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        localStorageItems = keys.filter(key => key.startsWith('fipe_cache_')).length
      } catch (error) {
        console.warn('Erro ao contar itens do localStorage:', error)
      }
    }

    return {
      totalItems: memoryItems + localStorageItems,
      memoryItems,
      localStorageItems
    }
  }

  // TTL específicos para diferentes tipos de dados
  getTTL(type: 'brands' | 'models' | 'years' | 'default'): number {
    switch (type) {
      case 'brands': return this.brandsTTL
      case 'models': return this.modelsTTL
      case 'years': return this.yearsTTL
      default: return this.defaultTTL
    }
  }
}

// Instância singleton
export const fipeCache = new FipeCache()

// Limpar cache expirado na inicialização (apenas no navegador)
if (typeof window !== 'undefined') {
  fipeCache.cleanExpired()
  
  // Limpar cache expirado a cada hora
  setInterval(() => {
    fipeCache.cleanExpired()
  }, 60 * 60 * 1000)
}
