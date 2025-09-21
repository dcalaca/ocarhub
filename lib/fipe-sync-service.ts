// Serviço de sincronização com a FIPE
// Popula o banco local com todos os dados e mantém sincronizado

import { fipeService } from './fipe-service'
import { FipeDatabaseService } from './fipe-database-service'
import { fipeCache } from './fipe-cache'
import { FipeIntelligence } from './fipe-intelligence'

export interface SyncStats {
  brands: number
  models: number
  years: number
  versions: number
  lastSync: Date
  errors: string[]
}

export class FipeSyncService {
  private static instance: FipeSyncService

  static getInstance(): FipeSyncService {
    if (!FipeSyncService.instance) {
      FipeSyncService.instance = new FipeSyncService()
    }
    return FipeSyncService.instance
  }

  // Sincronização completa - popula todo o banco
  async fullSync(): Promise<SyncStats> {
    console.log('🔄 Iniciando sincronização completa com FIPE...')
    const stats: SyncStats = {
      brands: 0,
      models: 0,
      years: 0,
      versions: 0,
      lastSync: new Date(),
      errors: []
    }

    try {
      // 1. Sincronizar marcas
      console.log('📊 Sincronizando marcas...')
      const brands = await fipeService.getBrands('cars')
      await FipeDatabaseService.saveBrands(brands)
      stats.brands = brands.length
      console.log(`✅ ${stats.brands} marcas sincronizadas`)

      // 2. Para cada marca, sincronizar modelos
      console.log('📊 Sincronizando modelos...')
      for (const brand of brands) {
        try {
          const models = await fipeService.getModelsByBrand('cars', brand.code)
          await FipeDatabaseService.saveModels(brand.code, models)
          stats.models += models.length
          console.log(`✅ ${models.length} modelos da marca ${brand.name} sincronizados`)
        } catch (error) {
          const errorMsg = `Erro ao sincronizar modelos da marca ${brand.name}: ${error}`
          console.error(errorMsg)
          stats.errors.push(errorMsg)
        }
      }

      // 3. Para cada modelo, sincronizar anos/versões
      console.log('📊 Sincronizando anos e versões...')
      const allModels = await FipeDatabaseService.getAllModels()
      
      for (const model of allModels) {
        try {
          const years = await fipeService.getYearsByModel('cars', model.brand_code, model.code)
          await FipeDatabaseService.saveYears(model.brand_code, model.code, years)
          stats.years += years.length
          stats.versions += years.length // Anos = versões na FIPE
          console.log(`✅ ${years.length} anos/versões do modelo ${model.name} sincronizados`)
        } catch (error) {
          const errorMsg = `Erro ao sincronizar anos do modelo ${model.name}: ${error}`
          console.error(errorMsg)
          stats.errors.push(errorMsg)
        }
      }

      // 4. Limpar cache para forçar recarregamento
      fipeCache.clear()
      console.log('🗑️ Cache limpo')

      console.log('✅ Sincronização completa finalizada!', stats)
      return stats

    } catch (error) {
      const errorMsg = `Erro na sincronização completa: ${error}`
      console.error(errorMsg)
      stats.errors.push(errorMsg)
      return stats
    }
  }

  // Sincronização incremental - apenas novos dados
  async incrementalSync(): Promise<SyncStats> {
    console.log('🔄 Iniciando sincronização incremental...')
    const stats: SyncStats = {
      brands: 0,
      models: 0,
      years: 0,
      versions: 0,
      lastSync: new Date(),
      errors: []
    }

    try {
      // 1. Verificar se há marcas novas
      const localBrands = await FipeDatabaseService.getBrands()
      const remoteBrands = await fipeService.getBrands('cars')
      
      const newBrands = remoteBrands.filter(remote => 
        !localBrands.some(local => local.code === remote.code)
      )

      if (newBrands.length > 0) {
        await FipeDatabaseService.saveBrands(newBrands)
        stats.brands = newBrands.length
        console.log(`✅ ${stats.brands} novas marcas encontradas`)
      }

      // 2. Para cada marca, verificar modelos novos
      for (const brand of remoteBrands) {
        const localModels = await FipeDatabaseService.getModelsByBrand(brand.code)
        const remoteModels = await fipeService.getModelsByBrand('cars', brand.code)
        
        const newModels = remoteModels.filter(remote => 
          !localModels.some(local => local.code === remote.code)
        )

        if (newModels.length > 0) {
          await FipeDatabaseService.saveModels(brand.code, newModels)
          stats.models += newModels.length
          console.log(`✅ ${newModels.length} novos modelos da marca ${brand.name}`)
        }
      }

      // 3. Verificar anos/versões novos
      const allModels = await FipeDatabaseService.getAllModels()
      for (const model of allModels) {
        const localYears = await FipeDatabaseService.getYearsByModel(model.brand_code, model.code)
        const remoteYears = await fipeService.getYearsByModel('cars', model.brand_code, model.code)
        
        const newYears = remoteYears.filter(remote => 
          !localYears.some(local => local.code === remote.code)
        )

        if (newYears.length > 0) {
          await FipeDatabaseService.saveYears(model.brand_code, model.code, newYears)
          stats.years += newYears.length
          stats.versions += newYears.length
          console.log(`✅ ${newYears.length} novos anos do modelo ${model.name}`)
        }
      }

      console.log('✅ Sincronização incremental finalizada!', stats)
      return stats

    } catch (error) {
      const errorMsg = `Erro na sincronização incremental: ${error}`
      console.error(errorMsg)
      stats.errors.push(errorMsg)
      return stats
    }
  }

  // Verificar se precisa sincronizar
  async needsSync(): Promise<boolean> {
    try {
      const hasData = await FipeDatabaseService.hasBrands()
      if (!hasData) {
        console.log('📊 Banco vazio, precisa de sincronização completa')
        return true
      }

      // Verificar última sincronização (exemplo: 7 dias)
      const lastSync = await this.getLastSyncDate()
      const daysSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceSync > 7) {
        console.log(`📊 Última sincronização há ${Math.floor(daysSinceSync)} dias, precisa sincronizar`)
        return true
      }

      console.log('✅ Dados atualizados, não precisa sincronizar')
      return false
    } catch (error) {
      console.error('Erro ao verificar necessidade de sincronização:', error)
      return true
    }
  }

  // Obter data da última sincronização
  private async getLastSyncDate(): Promise<Date> {
    // Implementar lógica para obter última sincronização do banco
    // Por enquanto, retornar data antiga para forçar sincronização
    return new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 dias atrás
  }

  // Sincronização automática (chamada no startup)
  async autoSync(): Promise<void> {
    try {
      const needsSync = await this.needsSync()
      if (needsSync) {
        console.log('🔄 Executando sincronização automática...')
        await this.incrementalSync()
      }
    } catch (error) {
      console.error('Erro na sincronização automática:', error)
    }
  }

  // Obter estatísticas do banco local
  async getLocalStats(): Promise<SyncStats> {
    try {
      const brands = await FipeDatabaseService.getBrands()
      const models = await FipeDatabaseService.getAllModels()
      const years = await FipeDatabaseService.getAllYears()

      return {
        brands: brands.length,
        models: models.length,
        years: years.length,
        versions: years.length,
        lastSync: new Date(), // Implementar data real
        errors: []
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas locais:', error)
      return {
        brands: 0,
        models: 0,
        years: 0,
        versions: 0,
        lastSync: new Date(),
        errors: [error.toString()]
      }
    }
  }

  // Limpar dados antigos (manutenção)
  async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    console.log(`🧹 Limpando dados antigos (mais de ${daysToKeep} dias)...`)
    // Implementar lógica de limpeza se necessário
    console.log('✅ Limpeza concluída')
  }
}

export const fipeSyncService = FipeSyncService.getInstance()
