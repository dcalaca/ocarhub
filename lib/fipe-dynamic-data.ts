// Serviço para carregar dados dinâmicos da FIPE
// Substitui os dados estáticos por dados reais da API

import { fipeService } from './fipe-service'
import { fipeCache } from './fipe-cache'
import { FipeDatabaseService } from './fipe-database-service'
import { FipeIntelligence, type ProcessedModel, type ProcessedVersion, type ProcessedYear } from './fipe-intelligence'

export interface FipeBrand {
  id: string
  name: string
  code: string
}

export interface FipeModel {
  id: string
  name: string
  code: string
}

export interface FipeYear {
  id: string
  name: string
  code: string
}

class FipeDynamicData {
  // Método utilitário para remover duplicatas
  private removeDuplicates<T>(array: T[], key: keyof T): T[] {
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }

  // Obter marcas da FIPE
  async getBrands(): Promise<FipeBrand[]> {
    const cacheKey = 'brands'
    
    // Verificar cache primeiro
    const cached = fipeCache.get<FipeBrand[]>(cacheKey)
    if (cached) {
      console.log('📦 Marcas carregadas do cache')
      return cached
    }

    try {
      // Primeiro, tentar buscar do banco de dados
      console.log('🗄️ Verificando marcas no banco de dados...')
      const hasBrandsInDB = await FipeDatabaseService.hasBrands()
      
      if (hasBrandsInDB) {
        console.log('📊 Carregando marcas do banco de dados...')
        const dbBrands = await FipeDatabaseService.getBrands()
        
        const processedBrands = dbBrands.map(brand => ({
          id: brand.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          name: brand.name,
          code: brand.code
        }))

        // Remover duplicatas por nome
        const uniqueBrands = this.removeDuplicates(processedBrands, 'name')

        // Salvar no cache
        fipeCache.set(cacheKey, uniqueBrands, fipeCache.getTTL('brands'))
        console.log('💾 Marcas carregadas do banco e salvas no cache')
        
        return uniqueBrands
      }

      // Se não tem no banco, buscar da API e salvar
      console.log('🌐 Carregando marcas da API FIPE...')
      const brands = await fipeService.getBrands('cars')
      
      const processedBrands = brands.map(brand => ({
        id: brand.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        name: brand.name,
        code: brand.code
      }))

      // Remover duplicatas por nome
      const uniqueBrands = this.removeDuplicates(processedBrands, 'name')

      // Salvar no banco de dados
      try {
        await FipeDatabaseService.saveBrands(brands)
        console.log('💾 Marcas salvas no banco de dados')
      } catch (dbError) {
        console.warn('Aviso: Não foi possível salvar marcas no banco:', dbError)
      }

      // Salvar no cache com TTL de 7 dias
      fipeCache.set(cacheKey, uniqueBrands, fipeCache.getTTL('brands'))
      console.log('💾 Marcas salvas no cache')
      
      return uniqueBrands
    } catch (error) {
      console.error('Erro ao carregar marcas da FIPE:', error)
      // Fallback para dados estáticos em caso de erro
      return this.getFallbackBrands()
    }
  }

  // Obter modelos de uma marca
  async getModelsByBrand(brandCode: string): Promise<FipeModel[]> {
    const cacheKey = `models_${brandCode}`
    
    // Verificar cache primeiro
    const cached = fipeCache.get<FipeModel[]>(cacheKey)
    if (cached) {
      console.log(`📦 Modelos da marca ${brandCode} carregados do cache`)
      return cached
    }

    try {
      console.log(`🌐 Carregando modelos da marca ${brandCode} da API FIPE...`)
      const models = await fipeService.getModelsByBrand('cars', brandCode)
      
      const processedModels = models.map(model => ({
        id: model.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        name: model.name,
        code: model.code
      }))

      // Remover duplicatas por nome
      const uniqueModels = this.removeDuplicates(processedModels, 'name')

      // Salvar no cache com TTL de 3 dias
      fipeCache.set(cacheKey, uniqueModels, fipeCache.getTTL('models'))
      console.log(`💾 Modelos da marca ${brandCode} salvos no cache`)
      
      return uniqueModels
    } catch (error) {
      console.error('Erro ao carregar modelos da FIPE:', error)
      // Retornar array vazio em caso de erro para não quebrar a interface
      return []
    }
  }

  // Obter anos de um modelo
  async getYearsByModel(brandCode: string, modelCode: string): Promise<FipeYear[]> {
    const cacheKey = `years_${brandCode}_${modelCode}`
    
    // Verificar cache primeiro
    const cached = fipeCache.get<FipeYear[]>(cacheKey)
    if (cached) {
      console.log(`📦 Anos do modelo ${modelCode} carregados do cache`)
      return cached
    }

    try {
      console.log(`🌐 Carregando anos do modelo ${modelCode} da API FIPE...`)
      const years = await fipeService.getYearsByModel('cars', brandCode, modelCode)
      console.log(`🌐 Anos retornados pela API:`, years.length)
      console.log(`🌐 Amostra dos anos:`, years.slice(0, 5))
      
      const processedYears = years.map(year => ({
        id: year.code,
        name: year.name,
        code: year.code
      }))

      // Remover duplicatas por nome
      const uniqueYears = this.removeDuplicates(processedYears, 'name')
      console.log(`🌐 Anos únicos após remoção de duplicatas:`, uniqueYears.length)

      // Salvar no cache com TTL de 1 dia
      fipeCache.set(cacheKey, uniqueYears, fipeCache.getTTL('years'))
      console.log(`💾 Anos do modelo ${modelCode} salvos no cache`)
      
      return uniqueYears
    } catch (error) {
      console.error('Erro ao carregar anos da FIPE:', error)
      // Retornar array vazio em caso de erro para não quebrar a interface
      return []
    }
  }

  // Dados de fallback em caso de erro na API
  private getFallbackBrands(): FipeBrand[] {
    return [
      { id: 'chevrolet', name: 'Chevrolet', code: '59' },
      { id: 'volkswagen', name: 'VW - VolksWagen', code: '23' },
      { id: 'fiat', name: 'Fiat', code: '21' },
      { id: 'toyota', name: 'Toyota', code: '25' },
      { id: 'hyundai', name: 'Hyundai', code: '26' },
      { id: 'honda', name: 'Honda', code: '27' },
      { id: 'renault', name: 'Renault', code: '28' },
      { id: 'jeep', name: 'Jeep', code: '29' },
      { id: 'nissan', name: 'Nissan', code: '30' },
      { id: 'ford', name: 'Ford', code: '31' },
      { id: 'peugeot', name: 'Peugeot', code: '32' },
      { id: 'citroen', name: 'Citroën', code: '33' },
      { id: 'mitsubishi', name: 'Mitsubishi', code: '34' },
      { id: 'suzuki', name: 'Suzuki', code: '35' },
      { id: 'kia', name: 'Kia', code: '36' },
      { id: 'audi', name: 'Audi', code: '37' },
      { id: 'bmw', name: 'BMW', code: '38' },
      { id: 'mercedes-benz', name: 'Mercedes-Benz', code: '39' },
      { id: 'volvo', name: 'Volvo', code: '40' },
      { id: 'land-rover', name: 'Land Rover', code: '41' },
      { id: 'jaguar', name: 'Jaguar', code: '42' },
      { id: 'porsche', name: 'Porsche', code: '43' },
      { id: 'mini', name: 'Mini', code: '44' },
      { id: 'smart', name: 'Smart', code: '45' },
      { id: 'alfa-romeo', name: 'Alfa Romeo', code: '46' },
      { id: 'ferrari', name: 'Ferrari', code: '47' },
      { id: 'lamborghini', name: 'Lamborghini', code: '48' },
      { id: 'maserati', name: 'Maserati', code: '49' },
      { id: 'bentley', name: 'Bentley', code: '50' },
      { id: 'rolls-royce', name: 'Rolls-Royce', code: '51' },
      { id: 'aston-martin', name: 'Aston Martin', code: '52' },
      { id: 'mclaren', name: 'McLaren', code: '53' },
      { id: 'bugatti', name: 'Bugatti', code: '54' },
      { id: 'koenigsegg', name: 'Koenigsegg', code: '55' },
      { id: 'pagani', name: 'Pagani', code: '56' },
      { id: 'rimac', name: 'Rimac', code: '57' },
      { id: 'tesla', name: 'Tesla', code: '58' },
      { id: 'rivian', name: 'Rivian', code: '59' },
      { id: 'lucid', name: 'Lucid', code: '60' },
      { id: 'polestar', name: 'Polestar', code: '61' },
      { id: 'nio', name: 'NIO', code: '62' },
      { id: 'xpeng', name: 'XPeng', code: '63' },
      { id: 'li-auto', name: 'Li Auto', code: '64' },
      { id: 'byton', name: 'Byton', code: '65' },
      { id: 'fisker', name: 'Fisker', code: '66' },
      { id: 'lucid', name: 'Lucid', code: '67' },
      { id: 'rivian', name: 'Rivian', code: '68' },
      { id: 'canoo', name: 'Canoo', code: '69' },
      { id: 'lordstown', name: 'Lordstown', code: '70' },
      { id: 'nikola', name: 'Nikola', code: '71' },
      { id: 'workhorse', name: 'Workhorse', code: '72' },
      { id: 'arrival', name: 'Arrival', code: '73' },
      { id: 'bollinger', name: 'Bollinger', code: '74' },
      { id: 'cybertruck', name: 'Cybertruck', code: '75' },
      { id: 'hummer', name: 'Hummer', code: '76' },
      { id: 'gmc', name: 'GMC', code: '77' },
      { id: 'cadillac', name: 'Cadillac', code: '78' },
      { id: 'buick', name: 'Buick', code: '79' },
      { id: 'lincoln', name: 'Lincoln', code: '80' },
      { id: 'chrysler', name: 'Chrysler', code: '81' },
      { id: 'dodge', name: 'Dodge', code: '82' },
      { id: 'ram', name: 'RAM', code: '83' },
      { id: 'jeep', name: 'Jeep', code: '84' },
      { id: 'alfa-romeo', name: 'Alfa Romeo', code: '85' },
      { id: 'fiat', name: 'Fiat', code: '86' },
      { id: 'lancia', name: 'Lancia', code: '87' },
      { id: 'abarth', name: 'Abarth', code: '88' },
      { id: 'maserati', name: 'Maserati', code: '89' },
      { id: 'ferrari', name: 'Ferrari', code: '90' },
      { id: 'lamborghini', name: 'Lamborghini', code: '91' },
      { id: 'pagani', name: 'Pagani', code: '92' },
      { id: 'alfa-romeo', name: 'Alfa Romeo', code: '93' },
      { id: 'fiat', name: 'Fiat', code: '94' },
      { id: 'lancia', name: 'Lancia', code: '95' },
      { id: 'abarth', name: 'Abarth', code: '96' },
      { id: 'maserati', name: 'Maserati', code: '97' },
      { id: 'ferrari', name: 'Ferrari', code: '98' },
      { id: 'lamborghini', name: 'Lamborghini', code: '99' },
      { id: 'pagani', name: 'Pagani', code: '100' }
    ]
  }

  // Limpar cache
  clearCache() {
    fipeCache.clear()
    console.log('🗑️ Cache limpo')
  }

  // Obter estatísticas do cache
  getCacheStats() {
    return fipeCache.getStats()
  }

  // ===== MÉTODOS COM INTELIGÊNCIA =====

  // Obter modelos processados com inteligência
  async getProcessedModels(brandCode: string): Promise<ProcessedModel[]> {
    const models = await this.getModelsByBrand(brandCode)
    return FipeIntelligence.processModels(models)
  }

  // Obter versões processadas com inteligência
  async getProcessedVersions(brandCode: string, modelCode: string, selectedModel: string): Promise<ProcessedVersion[]> {
    // Buscar anos da FIPE (que contêm as versões)
    const years = await this.getYearsByModel(brandCode, modelCode)
    
    // Converter anos em versões para processamento
    const versions = years.map(year => ({
      code: year.code,
      name: year.name
    }))
    
    // Processar versões com inteligência
    const processedVersions = FipeIntelligence.processVersions(versions, selectedModel)
    
    // Ordenar por relevância
    return FipeIntelligence.sortVersionsByRelevance(processedVersions)
  }

  // Obter versões agrupadas por combustível
  async getVersionsGroupedByFuel(brandCode: string, modelCode: string, selectedModel: string): Promise<{ [fuel: string]: ProcessedVersion[] }> {
    const versions = await this.getProcessedVersions(brandCode, modelCode, selectedModel)
    return FipeIntelligence.groupVersionsByFuel(versions)
  }

  // Obter anos processados com versões agrupadas
  async getProcessedYearsWithVersions(brandCode: string, modelCode: string, selectedModel: string): Promise<ProcessedYear[]> {
    const years = await this.getYearsByModel(brandCode, modelCode)
    return FipeIntelligence.processYearsWithVersions(years, selectedModel)
  }

  // Obter lista única de anos
  async getUniqueYears(brandCode: string, modelCode: string, selectedModel: string): Promise<number[]> {
    console.log('🔍 getUniqueYears - Buscando anos para:', { brandCode, modelCode, selectedModel })
    
    // Primeiro, tentar buscar anos do modelo específico
    let years = await this.getYearsByModel(brandCode, modelCode)
    console.log('🔍 getUniqueYears - Anos do modelo específico:', years.length)
    
    // Se não encontrou muitos anos, buscar de todos os modelos da marca que começam com o nome
    if (years.length < 5) {
      console.log('🔍 getUniqueYears - Poucos anos encontrados, buscando em todos os modelos da marca')
      
      try {
        // Buscar todos os modelos da marca
        const allModels = await this.getModelsByBrand(brandCode)
        console.log('🔍 getUniqueYears - Total de modelos da marca:', allModels.length)
        
        // Filtrar modelos que começam com o nome selecionado
        const matchingModels = allModels.filter(model => 
          model.name.toLowerCase().startsWith(selectedModel.toLowerCase())
        )
        console.log('🔍 getUniqueYears - Modelos que começam com o nome:', matchingModels.length)
        
        // Buscar anos de todos os modelos correspondentes
        const allYears: Array<{ code: string; name: string }> = []
        for (const model of matchingModels) {
          try {
            const modelYears = await this.getYearsByModel(brandCode, model.code)
            allYears.push(...modelYears)
            console.log(`🔍 getUniqueYears - Anos do modelo ${model.name}:`, modelYears.length)
          } catch (error) {
            console.warn(`🔍 getUniqueYears - Erro ao buscar anos do modelo ${model.name}:`, error)
          }
        }
        
        // Usar todos os anos encontrados se for mais que o modelo específico
        if (allYears.length > years.length) {
          console.log('🔍 getUniqueYears - Usando anos de todos os modelos correspondentes:', allYears.length)
          years = allYears
        }
      } catch (error) {
        console.warn('🔍 getUniqueYears - Erro ao buscar anos de todos os modelos:', error)
      }
    }
    
    return FipeIntelligence.getUniqueYears(years, selectedModel)
  }

  // Obter versões de um ano específico
  async getVersionsByYear(brandCode: string, modelCode: string, selectedModel: string, targetYear: number): Promise<ProcessedVersion[]> {
    const years = await this.getYearsByModel(brandCode, modelCode)
    return FipeIntelligence.getVersionsByYear(years, selectedModel, targetYear)
  }

  // Obter versões agrupadas por modelo
  async getVersionsGroupedByModel(brandCode: string): Promise<{ [modelName: string]: ProcessedVersion[] }> {
    const cacheKey = `versions_grouped_${brandCode}`
    
    // Verificar cache primeiro
    const cached = fipeCache.get<{ [modelName: string]: ProcessedVersion[] }>(cacheKey)
    if (cached) {
      console.log('📦 Versões agrupadas carregadas do cache')
      return cached
    }

    try {
      // Buscar todos os anos da marca
      const years = await FipeDatabaseService.getYearsByBrand(brandCode)
      
      if (years.length === 0) {
        // Se não tem no banco, buscar da API
        const models = await fipeService.getModelsByBrand('cars', brandCode)
        const allVersions: Array<{ code: string; name: string }> = []
        
        // Buscar versões de todos os modelos
        for (const model of models) {
          try {
            const modelYears = await fipeService.getYearsByModel('cars', brandCode, model.code)
            allVersions.push(...modelYears)
          } catch (error) {
            console.warn(`Erro ao buscar versões do modelo ${model.name}:`, error)
          }
        }
        
        const groupedVersions = FipeIntelligence.processAllVersionsByModel(allVersions)
        
        // Salvar no cache
        fipeCache.set(cacheKey, groupedVersions, fipeCache.getTTL('years'))
        console.log('💾 Versões agrupadas salvas no cache')
        
        return groupedVersions
      }

      // Processar anos do banco
      const groupedVersions = FipeIntelligence.processAllVersionsByModel(years)
      
      // Salvar no cache
      fipeCache.set(cacheKey, groupedVersions, fipeCache.getTTL('years'))
      console.log('💾 Versões agrupadas salvas no cache')
      
      return groupedVersions
    } catch (error) {
      console.error('Erro ao carregar versões agrupadas:', error)
      return {}
    }
  }
}

export const fipeDynamicData = new FipeDynamicData()
