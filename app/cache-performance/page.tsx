"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart3, Database, Zap, Clock, Trash2, RefreshCw, Info, TrendingUp, HardDrive } from "lucide-react"
import { VehicleAPI } from "@/lib/vehicle-api"

export default function CachePerformancePage() {
  const [cacheStats, setCacheStats] = useState<any>({ size: 0, keys: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    updateCacheStats()
  }, [])

  const updateCacheStats = () => {
    setCacheStats(VehicleAPI.getCacheStats())
  }

  const clearCache = async () => {
    setLoading(true)
    VehicleAPI.clearCache()
    setTimeout(() => {
      updateCacheStats()
      setLoading(false)
    }, 500)
  }

  const getCacheTypes = () => {
    return cacheStats.keys
      .map((key: string) => key.split("-")[0])
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
  }

  const getCacheTypeCount = (type: string) => {
    return cacheStats.keys.filter((key: string) => key.startsWith(type)).length
  }

  const formatCacheSize = () => {
    // Estimativa aproximada do tamanho em KB
    const estimatedKB = cacheStats.size * 2 // Aproximação
    if (estimatedKB < 1024) {
      return `~${estimatedKB} KB`
    }
    return `~${(estimatedKB / 1024).toFixed(1)} MB`
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Cache Performance</h1>
              <p className="text-muted-foreground">Monitoramento e controle do sistema de cache da aplicação</p>
            </div>
          </div>
        </div>

        {/* Explicação */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>O que é o Cache?</strong> O sistema de cache armazena temporariamente dados de veículos (marcas,
            modelos, versões) no seu navegador para acelerar futuras consultas. Isso reduz o tempo de carregamento e
            melhora sua experiência de navegação, especialmente em conexões mais lentas.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estatísticas Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visão Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Visão Geral do Cache
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{cacheStats.size}</div>
                    <div className="text-sm text-muted-foreground">Itens Armazenados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{getCacheTypes().length}</div>
                    <div className="text-sm text-muted-foreground">Tipos de Dados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{formatCacheSize()}</div>
                    <div className="text-sm text-muted-foreground">Tamanho Estimado</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhamento por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Dados em Cache por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getCacheTypes().map((type) => (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {type === "brands" && "Marcas de veículos"}
                          {type === "models" && "Modelos por marca"}
                          {type === "versions" && "Versões por modelo"}
                          {type === "years" && "Anos disponíveis"}
                          {type === "details" && "Detalhes técnicos"}
                          {type === "search" && "Resultados de busca"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{getCacheTypeCount(type)} itens</span>
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (getCacheTypeCount(type) / Math.max(1, cacheStats.size)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {getCacheTypes().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum dado em cache no momento</p>
                      <p className="text-sm">Use a busca de veículos para popular o cache</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Controle */}
          <div className="space-y-6">
            {/* Benefícios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Benefícios do Cache
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Carregamento Rápido</div>
                    <div className="text-sm text-muted-foreground">
                      Dados carregam instantaneamente após a primeira consulta
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Menos Espera</div>
                    <div className="text-sm text-muted-foreground">Reduz significativamente o tempo de resposta</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Economia de Dados</div>
                    <div className="text-sm text-muted-foreground">Menos requisições ao servidor</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Controles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={updateCacheStats} variant="outline" className="w-full" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Atualizar Estatísticas
                </Button>

                <Button onClick={clearCache} variant="destructive" className="w-full" disabled={loading}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Cache
                </Button>

                <div className="text-xs text-muted-foreground mt-2">
                  <strong>Nota:</strong> Limpar o cache fará com que os dados sejam recarregados na próxima consulta.
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache Ativo</span>
                    <Badge variant="default" className="bg-green-500">
                      Funcionando
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Última Atualização</span>
                    <span className="text-sm text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">TTL Padrão</span>
                    <span className="text-sm text-muted-foreground">30 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
