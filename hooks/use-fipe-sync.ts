// Hook para gerenciar sincronização da FIPE
// Inicializa sincronização automática e monitora status

import { useEffect, useState } from 'react'
import { fipeSyncService } from '../lib/fipe-sync-service'

export interface SyncStatus {
  isSyncing: boolean
  lastSync: Date | null
  stats: {
    brands: number
    models: number
    years: number
    versions: number
  }
  errors: string[]
}

export function useFipeSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSync: null,
    stats: { brands: 0, models: 0, years: 0, versions: 0 },
    errors: []
  })

  // Inicializar sincronização automática
  useEffect(() => {
    const initializeSync = async () => {
      try {
        setSyncStatus(prev => ({ ...prev, isSyncing: true }))
        
        // Executar sincronização automática
        await fipeSyncService.autoSync()
        
        // Obter estatísticas atualizadas
        const stats = await fipeSyncService.getLocalStats()
        
        setSyncStatus({
          isSyncing: false,
          lastSync: new Date(),
          stats,
          errors: []
        })
        
        console.log('✅ Sincronização automática concluída')
      } catch (error) {
        console.error('❌ Erro na sincronização automática:', error)
        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          errors: [error.toString()]
        }))
      }
    }

    initializeSync()
  }, [])

  // Função para forçar sincronização manual
  const forceSync = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, errors: [] }))
      
      const stats = await fipeSyncService.fullSync()
      
      setSyncStatus({
        isSyncing: false,
        lastSync: new Date(),
        stats: {
          brands: stats.brands,
          models: stats.models,
          years: stats.years,
          versions: stats.versions
        },
        errors: stats.errors
      })
      
      return stats
    } catch (error) {
      const errorMsg = error.toString()
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        errors: [...prev.errors, errorMsg]
      }))
      throw error
    }
  }

  // Função para sincronização incremental
  const incrementalSync = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, errors: [] }))
      
      const stats = await fipeSyncService.incrementalSync()
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        stats: {
          brands: prev.stats.brands + stats.brands,
          models: prev.stats.models + stats.models,
          years: prev.stats.years + stats.years,
          versions: prev.stats.versions + stats.versions
        },
        errors: stats.errors
      }))
      
      return stats
    } catch (error) {
      const errorMsg = error.toString()
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        errors: [...prev.errors, errorMsg]
      }))
      throw error
    }
  }

  return {
    ...syncStatus,
    forceSync,
    incrementalSync
  }
}
