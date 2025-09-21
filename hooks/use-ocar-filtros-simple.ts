import { useState, useEffect, useCallback } from 'react'

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

interface FiltrosState {
  marca: string | null
  modelo_base: string | null
  versao: string | null
  ano: number | null
}

interface UseOcarFiltrosReturn {
  filtros: FiltrosState
  data: FiltrosData | undefined
  isLoading: boolean
  error: any
  setMarca: (marca: string | null) => void
  setModeloBase: (modelo: string | null) => void
  setVersao: (versao: string | null) => void
  setAno: (ano: number | null) => void
  resetFiltros: () => void
  hasResultados: boolean
}

export function useOcarFiltrosSimple(): UseOcarFiltrosReturn {
  const [filtros, setFiltros] = useState<FiltrosState>({
    marca: null,
    modelo_base: null,
    versao: null,
    ano: null
  })

  const [data, setData] = useState<FiltrosData | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  // Função para buscar dados
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (filtros.marca) params.append('marca', filtros.marca)
      if (filtros.modelo_base) params.append('modelo_base', filtros.modelo_base)
      if (filtros.versao) params.append('versao', filtros.versao)
      if (filtros.ano) params.append('ano', filtros.ano.toString())

      const response = await fetch(`/api/ocar/filtros?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err)
      console.error('Erro ao buscar dados:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filtros])

  // Buscar dados quando os filtros mudarem
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Funções para atualizar filtros
  const setMarca = useCallback((marca: string | null) => {
    setFiltros(prev => ({
      marca,
      modelo_base: null, // Reset dependentes
      versao: null,
      ano: null
    }))
  }, [])

  const setModeloBase = useCallback((modelo: string | null) => {
    setFiltros(prev => ({
      ...prev,
      modelo_base: modelo,
      versao: null, // Reset dependentes
      ano: null
    }))
  }, [])

  const setVersao = useCallback((versao: string | null) => {
    setFiltros(prev => ({
      ...prev,
      versao,
      ano: null // Reset dependentes
    }))
  }, [])

  const setAno = useCallback((ano: number | null) => {
    setFiltros(prev => ({
      ...prev,
      ano
    }))
  }, [])

  const resetFiltros = useCallback(() => {
    setFiltros({
      marca: null,
      modelo_base: null,
      versao: null,
      ano: null
    })
  }, [])

  // Verificar se há resultados
  const hasResultados = Boolean(data?.resultados && data.resultados.length > 0)

  return {
    filtros,
    data,
    isLoading,
    error,
    setMarca,
    setModeloBase,
    setVersao,
    setAno,
    resetFiltros,
    hasResultados
  }
}
