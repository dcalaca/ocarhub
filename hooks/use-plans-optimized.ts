// Hook otimizado para carregar planos com cache
import { useState, useEffect, useCallback } from 'react'
import { PlansService } from '@/lib/plans-service'
import type { Plan } from '@/types'

interface UsePlansOptions {
  type?: 'anuncio' | 'consulta'
  autoLoad?: boolean
}

interface UsePlansReturn {
  plans: Plan[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function usePlansOptimized(options: UsePlansOptions = {}): UsePlansReturn {
  const { type, autoLoad = true } = options

  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let plansData: Plan[]
      
      if (type) {
        plansData = await PlansService.getPlansByType(type)
      } else {
        plansData = await PlansService.getActivePlans()
      }

      setPlans(plansData)
    } catch (err) {
      setError('Erro ao carregar planos')
      console.error('Erro ao carregar planos:', err)
    } finally {
      setLoading(false)
    }
  }, [type])

  const refresh = useCallback(async () => {
    await loadPlans()
  }, [loadPlans])

  // Carregar dados iniciais
  useEffect(() => {
    if (autoLoad) {
      loadPlans()
    }
  }, [autoLoad, loadPlans])

  return {
    plans,
    loading,
    error,
    refresh
  }
}
