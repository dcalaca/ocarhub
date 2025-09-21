// Componente para mostrar status da sincronização FIPE

import React from 'react'
import { useFipeSync } from '../hooks/use-fipe-sync'

interface FipeSyncStatusProps {
  showDetails?: boolean
  className?: string
}

export function FipeSyncStatus({ showDetails = false, className = '' }: FipeSyncStatusProps) {
  const { isSyncing, lastSync, stats, errors, forceSync, incrementalSync } = useFipeSync()

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className={`fipe-sync-status ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
        <span className="text-sm text-gray-600">
          {isSyncing ? 'Sincronizando FIPE...' : 'FIPE Sincronizado'}
        </span>
        {lastSync && (
          <span className="text-xs text-gray-500">
            ({formatDate(lastSync)})
          </span>
        )}
      </div>

      {showDetails && (
        <div className="mt-2 text-xs text-gray-500">
          <div>Marcas: {stats.brands} | Modelos: {stats.models} | Anos: {stats.years}</div>
          {errors.length > 0 && (
            <div className="text-red-500 mt-1">
              Erros: {errors.length}
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <button
          onClick={incrementalSync}
          disabled={isSyncing}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Sincronizar
        </button>
        <button
          onClick={forceSync}
          disabled={isSyncing}
          className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Forçar Sync
        </button>
      </div>
    </div>
  )
}
