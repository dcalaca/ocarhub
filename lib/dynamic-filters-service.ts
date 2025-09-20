// Serviço de filtros dinâmicos como Webmotors
// Atualiza automaticamente os filtros quando qualquer um é alterado

import { fipeService } from './fipe-service'
import { fipeDynamicData } from './fipe-dynamic-data'
import { FipeIntelligence } from './fipe-intelligence'

export interface FilterState {
  brand: string | null
  model: string | null
  year: number | null
  version: string | null
  fipeCode: string | null
}

export interface FilterOptions {
  brands: Array<{ value: string; label: string }>
  models: Array<{ value: string; label: string }>
  years: Array<{ value: string; label: string }>
  versions: Array<{ value: string; label: string }>
}

export interface FilterLoading {
  brands: boolean
  models: boolean
  years: boolean
  versions: boolean
}

export class DynamicFiltersService {
  private static instance: DynamicFiltersService
  private cache = new Map<string, any>()

  static getInstance(): DynamicFiltersService {
    if (!DynamicFiltersService.instance) {
      DynamicFiltersService.instance = new DynamicFiltersService()
    }
    return DynamicFiltersService.instance
  }

  // Obter opções de filtros baseado no estado atual
  async getFilterOptions(currentState: FilterState): Promise<{
    options: FilterOptions
    loading: FilterLoading
  }> {
    const loading: FilterLoading = {
      brands: false,
      models: false,
      years: false,
      versions: false
    }

    const options: FilterOptions = {
      brands: [],
      models: [],
      years: [],
      versions: []
    }

    try {
      // 1. Sempre carregar marcas
      loading.brands = true
      const brands = await fipeDynamicData.getBrands()
      options.brands = brands.map(brand => ({
        value: brand.name,
        label: brand.name
      }))
      loading.brands = false

      // 2. Carregar modelos se marca estiver selecionada
      if (currentState.brand) {
        loading.models = true
        const selectedBrand = brands.find(b => b.name === currentState.brand)
        if (selectedBrand) {
          const processedModels = await fipeDynamicData.getProcessedModels(selectedBrand.code)
          options.models = processedModels.map(model => ({
            value: model.name,
            label: model.name
          }))
        }
        loading.models = false
      }

      // 3. Carregar anos se modelo estiver selecionado
      if (currentState.brand && currentState.model) {
        loading.years = true
        console.log('🔍 DynamicFiltersService - Carregando anos para:', { brand: currentState.brand, model: currentState.model })
        
        const selectedBrand = brands.find(b => b.name === currentState.brand)
        if (selectedBrand) {
          console.log('🔍 DynamicFiltersService - Marca encontrada:', selectedBrand)
          
          // Buscar o código FIPE do modelo selecionado
          const processedModels = await fipeDynamicData.getProcessedModels(selectedBrand.code)
          console.log('🔍 DynamicFiltersService - Modelos processados:', processedModels)
          
          // Usar pickBestModelCode para escolher o melhor modelo
          const bestModelCode = FipeIntelligence.pickBestModelCode(processedModels, currentState.model)
          console.log('🔍 DynamicFiltersService - Melhor modelCode encontrado:', bestModelCode)
          
          const selectedModelData = processedModels.find(m => m.code === bestModelCode)
          console.log('🔍 DynamicFiltersService - Modelo selecionado encontrado:', selectedModelData)
          
          if (selectedModelData) {
            const uniqueYears = await fipeDynamicData.getUniqueYears(
              selectedBrand.code, 
              selectedModelData.code, // Usar código FIPE do modelo
              currentState.model
            )
            console.log('🔍 DynamicFiltersService - Anos únicos retornados:', uniqueYears)
            
            options.years = uniqueYears.map(year => ({
              value: year.toString(),
              label: year.toString()
            }))
            console.log('🔍 DynamicFiltersService - Opções de anos formatadas:', options.years)
          } else {
            console.warn('🔍 DynamicFiltersService - Modelo não encontrado nos modelos processados')
          }
        } else {
          console.warn('🔍 DynamicFiltersService - Marca não encontrada')
        }
        loading.years = false
      }

      // 4. Carregar versões se ano estiver selecionado
      if (currentState.brand && currentState.model && currentState.year) {
        loading.versions = true
        const selectedBrand = brands.find(b => b.name === currentState.brand)
        if (selectedBrand) {
          // Buscar o código FIPE do modelo selecionado
          const processedModels = await fipeDynamicData.getProcessedModels(selectedBrand.code)
          
          // Usar pickBestModelCode para escolher o melhor modelo
          const bestModelCode = FipeIntelligence.pickBestModelCode(processedModels, currentState.model)
          console.log('🔍 DynamicFiltersService (versions) - Melhor modelCode encontrado:', bestModelCode)
          
          const selectedModelData = processedModels.find(m => m.code === bestModelCode)
          
          if (selectedModelData) {
            const versionsByYear = await fipeDynamicData.getVersionsByYear(
              selectedBrand.code,
              selectedModelData.code, // Usar código FIPE do modelo
              currentState.model,
              currentState.year
            )
            options.versions = versionsByYear.map(version => ({
              value: version.name,
              label: version.name
            }))
          }
        }
        loading.versions = false
      }

      return { options, loading }
    } catch (error) {
      console.error('Erro ao carregar opções de filtros:', error)
      return { options, loading }
    }
  }

  // Atualizar estado do filtro e recalcular opções
  async updateFilter(
    filterType: keyof FilterState,
    value: string | number | null,
    currentState: FilterState
  ): Promise<{
    newState: FilterState
    options: FilterOptions
    loading: FilterLoading
  }> {
    const newState: FilterState = { ...currentState }

    // Atualizar o filtro selecionado
    if (filterType === 'year') {
      newState.year = value as number | null
    } else {
      newState[filterType] = value as string | null
    }

    // Limpar filtros dependentes
    switch (filterType) {
      case 'brand':
        newState.model = null
        newState.year = null
        newState.version = null
        newState.fipeCode = null
        break
      case 'model':
        newState.year = null
        newState.version = null
        newState.fipeCode = null
        break
      case 'year':
        newState.version = null
        newState.fipeCode = null
        break
      case 'version':
        newState.fipeCode = null
        break
    }

    // Obter novas opções baseadas no novo estado
    const { options, loading } = await this.getFilterOptions(newState)

    return {
      newState,
      options,
      loading
    }
  }

  // Buscar código FIPE baseado na seleção atual
  async getFipeCode(state: FilterState): Promise<string | null> {
    if (!state.brand || !state.model || !state.year || !state.version) {
      return null
    }

    try {
      const result = await fipeService.searchVehicle(
        state.brand,
        state.model,
        state.year
      )
      return result?.fipeCode || null
    } catch (error) {
      console.error('Erro ao buscar código FIPE:', error)
      return null
    }
  }

  // Obter preço FIPE baseado na seleção atual
  async getFipePrice(state: FilterState): Promise<number | null> {
    if (!state.brand || !state.model || !state.year) {
      return null
    }

    try {
      const result = await fipeService.searchVehicle(
        state.brand,
        state.model,
        state.year
      )
      return result?.price || null
    } catch (error) {
      console.error('Erro ao buscar preço FIPE:', error)
      return null
    }
  }

  // Validar se a seleção atual está completa
  isSelectionComplete(state: FilterState): boolean {
    return !!(state.brand && state.model && state.year && state.version)
  }

  // Obter resumo da seleção atual
  getSelectionSummary(state: FilterState): string {
    const parts = []
    if (state.brand) parts.push(state.brand)
    if (state.model) parts.push(state.model)
    if (state.year) parts.push(state.year.toString())
    if (state.version) parts.push(state.version)
    
    return parts.join(' ')
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear()
  }

  // Obter estatísticas do cache
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Instância singleton
export const dynamicFiltersService = DynamicFiltersService.getInstance()
