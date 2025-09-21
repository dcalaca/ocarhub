"use client"

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Filter, Search, RotateCcw } from 'lucide-react'

interface FiltrosData {
  marcas: string[]
  modelos: string[]
  versoes: string[]
  anos: number[]
  resultados: Array<{
    marca: string
    modelo_base: string
    versao: string
    ano: number
    codigo_fipe: string
    referencia_mes: string
    preco: number
  }>
}

export function OcarFiltrosSimple() {
  const [filtros, setFiltros] = useState({
    marca: '',
    modelo_base: '',
    versao: '',
    ano: ''
  })
  
  const [data, setData] = useState<FiltrosData | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams()
        if (filtros.marca) params.append('marca', filtros.marca)
        if (filtros.modelo_base) params.append('modelo_base', filtros.modelo_base)
        if (filtros.versao) params.append('versao', filtros.versao)
        if (filtros.ano) params.append('ano', filtros.ano)

        const response = await fetch(`/api/ocar/filtros?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        console.error('Erro ao buscar dados:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filtros])

  const handleMarcaChange = (value: string) => {
    setFiltros(prev => ({
      marca: value === 'all' ? '' : value,
      modelo_base: '',
      versao: '',
      ano: ''
    }))
  }

  const handleModeloChange = (value: string) => {
    setFiltros(prev => ({
      ...prev,
      modelo_base: value === 'all' ? '' : value,
      versao: '',
      ano: ''
    }))
  }

  const handleVersaoChange = (value: string) => {
    setFiltros(prev => ({
      ...prev,
      versao: value === 'all' ? '' : value,
      ano: ''
    }))
  }

  const handleAnoChange = (value: string) => {
    setFiltros(prev => ({
      ...prev,
      ano: value === 'all' ? '' : value
    }))
  }

  const resetFiltros = () => {
    setFiltros({
      marca: '',
      modelo_base: '',
      versao: '',
      ano: ''
    })
  }

  const hasResultados = Boolean(data?.resultados && data.resultados.length > 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Busca
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Marca */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Marca</label>
            <Select value={filtros.marca || 'all'} onValueChange={handleMarcaChange} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as marcas</SelectItem>
                {data?.marcas?.map((marca) => (
                  <SelectItem key={marca} value={marca}>
                    {marca}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modelo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Modelo</label>
            <Select 
              value={filtros.modelo_base || 'all'} 
              onValueChange={handleModeloChange} 
              disabled={isLoading || !filtros.marca}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os modelos</SelectItem>
                {data?.modelos?.map((modelo) => (
                  <SelectItem key={modelo} value={modelo}>
                    {modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Versão */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Versão</label>
            <Select 
              value={filtros.versao || 'all'} 
              onValueChange={handleVersaoChange} 
              disabled={isLoading || !filtros.modelo_base}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a versão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as versões</SelectItem>
                {data?.versoes?.map((versao) => (
                  <SelectItem key={versao} value={versao}>
                    {versao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ano */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ano</label>
            <Select 
              value={filtros.ano || 'all'} 
              onValueChange={handleAnoChange} 
              disabled={isLoading || !filtros.versao}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                {data?.anos?.map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={() => {}} 
            disabled={isLoading}
            className="flex-1"
          >
            <Search className="h-4 w-4 mr-2" />
            Ver Resultados ({data?.resultados?.length || 0})
          </Button>
          <Button 
            variant="outline" 
            onClick={resetFiltros}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>

        {/* Status */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground">Carregando...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <div className="text-sm text-destructive">Erro: {error}</div>
          </div>
        )}

        {/* Resultados */}
        {hasResultados && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Resultados ({data?.resultados?.length})</h3>
            <div className="grid gap-4">
              {data?.resultados?.slice(0, 5).map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="font-medium">{item.marca} {item.modelo_base}</div>
                  <div className="text-sm text-muted-foreground">{item.versao}</div>
                  <div className="text-sm">Ano: {item.ano} | Preço: R$ {item.preco.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
