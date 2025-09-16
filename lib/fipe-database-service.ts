// Serviço para gerenciar dados da FIPE no banco de dados
// Economiza consultas à API e melhora performance

import { supabase } from './supabase'

export interface FipeBrandDB {
  id: string
  code: string
  name: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface FipeModelDB {
  id: string
  brand_code: string
  code: string
  name: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface FipeYearDB {
  id: string
  brand_code: string
  model_code: string
  code: string
  name: string
  year: number
  fuel_type?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface FipePriceDB {
  id: string
  brand_code: string
  model_code: string
  year_code: string
  fipe_code: string
  price: number
  fuel?: string
  reference_month?: string
  created_at: string
  updated_at: string
}

export class FipeDatabaseService {
  // ===== MARCAS =====
  
  // Salvar marcas no banco
  static async saveBrands(brands: Array<{ code: string; name: string }>): Promise<void> {
    try {
      const brandsToInsert = brands.map(brand => ({
        code: brand.code,
        name: brand.name,
        active: true
      }))

      const { error } = await supabase
        .from('ocar_fipe_brands')
        .upsert(brandsToInsert, { 
          onConflict: 'code',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Erro ao salvar marcas:', error)
        throw error
      }

      console.log(`💾 ${brands.length} marcas salvas no banco`)
    } catch (error) {
      console.error('Erro no FipeDatabaseService.saveBrands:', error)
      throw error
    }
  }

  // Buscar marcas do banco
  static async getBrands(): Promise<FipeBrandDB[]> {
    try {
      const { data, error } = await supabase
        .from('ocar_fipe_brands')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) {
        console.error('Erro ao buscar marcas:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Erro no FipeDatabaseService.getBrands:', error)
      throw error
    }
  }

  // ===== MODELOS =====
  
  // Salvar modelos no banco
  static async saveModels(brandCode: string, models: Array<{ code: string; name: string }>): Promise<void> {
    try {
      const modelsToInsert = models.map(model => ({
        brand_code: brandCode,
        code: model.code,
        name: model.name,
        active: true
      }))

      const { error } = await supabase
        .from('ocar_fipe_models')
        .upsert(modelsToInsert, { 
          onConflict: 'brand_code,code',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Erro ao salvar modelos:', error)
        throw error
      }

      console.log(`💾 ${models.length} modelos da marca ${brandCode} salvos no banco`)
    } catch (error) {
      console.error('Erro no FipeDatabaseService.saveModels:', error)
      throw error
    }
  }

  // Buscar modelos do banco por marca
  static async getModelsByBrand(brandCode: string): Promise<FipeModelDB[]> {
    try {
      const { data, error } = await supabase
        .from('ocar_fipe_models')
        .select('*')
        .eq('brand_code', brandCode)
        .eq('active', true)
        .order('name')

      if (error) {
        console.error('Erro ao buscar modelos:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Erro no FipeDatabaseService.getModelsByBrand:', error)
      throw error
    }
  }

  // ===== ANOS =====
  
  // Salvar anos no banco
  static async saveYears(brandCode: string, modelCode: string, years: Array<{ code: string; name: string; year: number; fuel_type?: string }>): Promise<void> {
    try {
      const yearsToInsert = years.map(year => ({
        brand_code: brandCode,
        model_code: modelCode,
        code: year.code,
        name: year.name,
        year: year.year,
        fuel_type: year.fuel_type,
        active: true
      }))

      const { error } = await supabase
        .from('ocar_fipe_years')
        .upsert(yearsToInsert, { 
          onConflict: 'brand_code,model_code,code',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Erro ao salvar anos:', error)
        throw error
      }

      console.log(`💾 ${years.length} anos do modelo ${modelCode} salvos no banco`)
    } catch (error) {
      console.error('Erro no FipeDatabaseService.saveYears:', error)
      throw error
    }
  }

  // Buscar anos do banco por modelo
  static async getYearsByModel(brandCode: string, modelCode: string): Promise<FipeYearDB[]> {
    try {
      const { data, error } = await supabase
        .from('ocar_fipe_years')
        .select('*')
        .eq('brand_code', brandCode)
        .eq('model_code', modelCode)
        .eq('active', true)
        .order('year', { ascending: false })

      if (error) {
        console.error('Erro ao buscar anos:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Erro no FipeDatabaseService.getYearsByModel:', error)
      throw error
    }
  }

  // ===== PREÇOS =====
  
  // Salvar preço FIPE no banco
  static async savePrice(brandCode: string, modelCode: string, yearCode: string, fipeCode: string, price: number, fuel?: string, referenceMonth?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ocar_fipe_prices')
        .upsert({
          brand_code: brandCode,
          model_code: modelCode,
          year_code: yearCode,
          fipe_code: fipeCode,
          price: price,
          fuel: fuel,
          reference_month: referenceMonth
        }, { 
          onConflict: 'brand_code,model_code,year_code,reference_month',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Erro ao salvar preço:', error)
        throw error
      }

      console.log(`💾 Preço FIPE ${fipeCode} salvo no banco`)
    } catch (error) {
      console.error('Erro no FipeDatabaseService.savePrice:', error)
      throw error
    }
  }

  // Buscar preço FIPE do banco
  static async getPrice(brandCode: string, modelCode: string, yearCode: string): Promise<FipePriceDB | null> {
    try {
      const { data, error } = await supabase
        .from('ocar_fipe_prices')
        .select('*')
        .eq('brand_code', brandCode)
        .eq('model_code', modelCode)
        .eq('year_code', yearCode)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao buscar preço:', error)
        throw error
      }

      return data || null
    } catch (error) {
      console.error('Erro no FipeDatabaseService.getPrice:', error)
      throw error
    }
  }

  // ===== UTILITÁRIOS =====
  
  // Verificar se dados existem no banco
  static async hasBrands(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('ocar_fipe_brands')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)

      if (error) {
        console.error('Erro ao verificar marcas:', error)
        return false
      }

      return (count || 0) > 0
    } catch (error) {
      console.error('Erro no FipeDatabaseService.hasBrands:', error)
      return false
    }
  }

  // Limpar dados antigos (manter apenas últimos 3 meses)
  static async cleanOldData(): Promise<void> {
    try {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

      // Limpar preços antigos
      const { error: pricesError } = await supabase
        .from('ocar_fipe_prices')
        .delete()
        .lt('created_at', threeMonthsAgo.toISOString())

      if (pricesError) {
        console.error('Erro ao limpar preços antigos:', pricesError)
      }

      console.log('🧹 Dados antigos limpos do banco')
    } catch (error) {
      console.error('Erro no FipeDatabaseService.cleanOldData:', error)
    }
  }

  // Obter estatísticas do banco
  static async getStats(): Promise<{ brands: number; models: number; years: number; prices: number }> {
    try {
      const [brandsResult, modelsResult, yearsResult, pricesResult] = await Promise.all([
        supabase.from('ocar_fipe_brands').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('ocar_fipe_models').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('ocar_fipe_years').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('ocar_fipe_prices').select('*', { count: 'exact', head: true })
      ])

      return {
        brands: brandsResult.count || 0,
        models: modelsResult.count || 0,
        years: yearsResult.count || 0,
        prices: pricesResult.count || 0
      }
    } catch (error) {
      console.error('Erro no FipeDatabaseService.getStats:', error)
      return { brands: 0, models: 0, years: 0, prices: 0 }
    }
  }
}
