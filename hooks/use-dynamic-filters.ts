// Hook para filtros dinâmicos como Webmotors
import { useState, useEffect, useCallback } from 'react'
import { dynamicFiltersService, type FilterState, type FilterOptions, type FilterLoading } from '@/lib/dynamic-filters-service'

export function useDynamicFilters(initialState: Partial<FilterState> = {}) {
  const [state, setState] = useState<FilterState>({
    brand: null,
    model: null,
    year: null,
    version: null,
    fipeCode: null,
    ...initialState
  })

  const [options, setOptions] = useState<FilterOptions>({
    brands: [],
    models: [],
    years: [],
    versions: []
  })

  const [loading, setLoading] = useState<FilterLoading>({
    brands: false,
    models: false,
    years: false,
    versions: false
  })

  const [fipePrice, setFipePrice] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  // Carregar opções iniciais
  useEffect(() => {
    loadOptions()
  }, [])

  // Atualizar preço FIPE quando seleção estiver completa
  useEffect(() => {
    if (isComplete) {
      loadFipePrice()
    }
  }, [isComplete])

  const loadOptions = async () => {
    try {
      console.log('🔍 useDynamicFilters - Carregando opções para estado:', state)
      const { options: newOptions, loading: newLoading } = await dynamicFiltersService.getFilterOptions(state)
      console.log('🔍 useDynamicFilters - Opções recebidas:', newOptions)
      console.log('🔍 useDynamicFilters - Loading recebido:', newLoading)
      setOptions(newOptions)
      setLoading(newLoading)
    } catch (error) {
      console.error('Erro ao carregar opções:', error)
    }
  }

  const loadFipePrice = async () => {
    try {
      const price = await dynamicFiltersService.getFipePrice(state)
      setFipePrice(price)
    } catch (error) {
      console.error('Erro ao carregar preço FIPE:', error)
    }
  }

  const updateFilter = useCallback(async (
    filterType: keyof FilterState,
    value: string | number | null
  ) => {
    try {
      const { newState, options: newOptions, loading: newLoading } = await dynamicFiltersService.updateFilter(
        filterType,
        value,
        state
      )

      setState(newState)
      setOptions(newOptions)
      setLoading(newLoading)
      setIsComplete(dynamicFiltersService.isSelectionComplete(newState))

      // Limpar preço FIPE se seleção não estiver completa
      if (!dynamicFiltersService.isSelectionComplete(newState)) {
        setFipePrice(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar filtro:', error)
    }
  }, [state])

  const updateBrand = useCallback((brand: string | null) => {
    updateFilter('brand', brand)
  }, [updateFilter])

  const updateModel = useCallback((model: string | null) => {
    updateFilter('model', model)
  }, [updateFilter])

  const updateYear = useCallback((year: number | null) => {
    updateFilter('year', year)
  }, [updateFilter])

  const updateVersion = useCallback((version: string | null) => {
    updateFilter('version', version)
  }, [updateFilter])

  const reset = useCallback(() => {
    const newState: FilterState = {
      brand: null,
      model: null,
      year: null,
      version: null,
      fipeCode: null
    }
    setState(newState)
    setFipePrice(null)
    setIsComplete(false)
    loadOptions()
  }, [])

  const getSelectionSummary = useCallback(() => {
    return dynamicFiltersService.getSelectionSummary(state)
  }, [state])

  const getFipeCode = useCallback(async () => {
    if (!isComplete) return null
    return await dynamicFiltersService.getFipeCode(state)
  }, [state, isComplete])

  return {
    // Estado
    state,
    options,
    loading,
    fipePrice,
    isComplete,

    // Ações
    updateBrand,
    updateModel,
    updateYear,
    updateVersion,
    reset,

    // Utilitários
    getSelectionSummary,
    getFipeCode,

    // Estado individual para facilitar uso
    selectedBrand: state.brand,
    selectedModel: state.model,
    selectedYear: state.year,
    selectedVersion: state.version
  }
}
