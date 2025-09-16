// Componente para debug do cache FIPE
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database, Trash2, RefreshCw, Info, Server } from 'lucide-react'
import { fipeDynamicData } from '@/lib/fipe-dynamic-data'
import { FipeDatabaseService } from '@/lib/fipe-database-service'

export function CacheDebug() {
  const [stats, setStats] = useState<{ totalItems: number; memoryItems: number; localStorageItems: number } | null>(null)
  const [dbStats, setDbStats] = useState<{ brands: number; models: number; years: number; prices: number } | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const loadStats = async () => {
    const cacheStats = fipeDynamicData.getCacheStats()
    setStats(cacheStats)
    
    try {
      const databaseStats = await FipeDatabaseService.getStats()
      setDbStats(databaseStats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas do banco:', error)
    }
  }

  const clearCache = () => {
    fipeDynamicData.clearCache()
    loadStats()
  }

  useEffect(() => {
    loadStats()
  }, [])

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsVisible(!isVisible)}
        size="sm"
        variant="outline"
        className="mb-2"
      >
        <Database className="w-4 h-4 mr-2" />
        Cache Debug
      </Button>

      {isVisible && (
        <Card className="w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4" />
              Cache FIPE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4" />
                    <span className="text-sm font-medium">Cache Local</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total de itens:</span>
                    <Badge variant="secondary">{stats.totalItems}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memória:</span>
                    <Badge variant="outline">{stats.memoryItems}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">LocalStorage:</span>
                    <Badge variant="outline">{stats.localStorageItems}</Badge>
                  </div>
                </div>

                {dbStats && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-4 h-4" />
                      <span className="text-sm font-medium">Banco de Dados</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Marcas:</span>
                      <Badge variant="default">{dbStats.brands}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Modelos:</span>
                      <Badge variant="default">{dbStats.models}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Anos:</span>
                      <Badge variant="default">{dbStats.years}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Preços:</span>
                      <Badge variant="default">{dbStats.prices}</Badge>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={loadStats}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Atualizar
              </Button>
              <Button
                onClick={clearCache}
                size="sm"
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Limpar
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              💡 Cache + Banco + Inteligência economizam requisições à API FIPE
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
