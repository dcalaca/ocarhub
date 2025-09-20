import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'

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

const fetcher = async (url: string): Promise<FiltrosData> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Erro ao buscar dados')
  }
  return response.json()
}

export function useOcarFiltros(): UseOcarFiltrosReturn {
  const [filtros, setFiltros] = useState<FiltrosState>({
    marca: null,
    modelo_base: null,
    versao: null,
    ano: null
  })

  // Construir URL com parâmetros
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams()
    
    if (filtros.marca) params.append('marca', filtros.marca)
    if (filtros.modelo_base) params.append('modelo_base', filtros.modelo_base)
    if (filtros.versao) params.append('versao', filtros.versao)
    if (filtros.ano) params.append('ano', filtros.ano.toString())

    return `/api/ocar/filtros?${params.toString()}`
  }, [filtros])

  const { data, error, isLoading } = useSWR<FiltrosData>(
    buildUrl(),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000 * 60 * 5 // 5 minutos
    }
  )

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
