// Hook otimizado para carregar veículos com paginação e cache
import { useState, useEffect, useCallback } from 'react'
import { VehiclesService } from '@/lib/vehicles-service'
import type { Vehicle } from '@/types'

interface UseVehiclesOptions {
  filters?: {
    marca?: string
    modelo?: string
    ano?: number
    precoMin?: number
    precoMax?: number
    cidade?: string
    combustivel?: string
    cambio?: string
    status?: string
  }
  limit?: number
  autoLoad?: boolean
}

interface UseVehiclesReturn {
  vehicles: Vehicle[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  total: number
}

export function useVehiclesOptimized(options: UseVehiclesOptions = {}): UseVehiclesReturn {
  const {
    filters = {},
    limit = 20,
    autoLoad = true
  } = options

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)

  const loadVehicles = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const currentOffset = reset ? 0 : offset
      const newVehicles = await VehiclesService.getVehicles({
        ...filters,
        limit,
        offset: currentOffset
      })

      if (reset) {
        setVehicles(newVehicles)
        setOffset(limit)
      } else {
        setVehicles(prev => [...prev, ...newVehicles])
        setOffset(prev => prev + limit)
      }

      // Verificar se há mais dados
      setHasMore(newVehicles.length === limit)
      
      // Estimar total (aproximado)
      if (reset) {
        setTotal(newVehicles.length)
      } else {
        setTotal(prev => prev + newVehicles.length)
      }

    } catch (err) {
      setError('Erro ao carregar veículos')
      console.error('Erro ao carregar veículos:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, limit, offset])

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await loadVehicles(false)
    }
  }, [loading, hasMore, loadVehicles])

  const refresh = useCallback(async () => {
    setOffset(0)
    setHasMore(true)
    await loadVehicles(true)
  }, [loadVehicles])

  // Carregar dados iniciais
  useEffect(() => {
    if (autoLoad) {
      refresh()
    }
  }, [autoLoad, refresh])

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (autoLoad) {
      refresh()
    }
  }, [JSON.stringify(filters), refresh])

  return {
    vehicles,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    total
  }
}
