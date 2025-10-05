import { supabase } from './supabase'

export interface Plan {
  id: string
  nome: string
  tipo: 'anuncio' | 'consulta'
  preco: number
  descricao: string
  beneficios: string[] // Será convertido de/para jsonb
  limite_anuncios: number
  limite_consultas: number
  duracao_dias?: number // Campo opcional - será adicionado se necessário
  destaque: boolean
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CreatePlanData {
  nome: string
  tipo: 'anuncio' | 'consulta'
  preco: number
  descricao: string
  beneficios: string[]
  limite_anuncios: number
  limite_consultas: number
  duracao_dias?: number
  destaque: boolean
  ativo: boolean
}

export interface UpdatePlanData extends Partial<CreatePlanData> {
  id: string
}

export class PlansService {
  private static cache = new Map<string, { data: Plan[], timestamp: number }>()
  private static CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  // Invalidar cache
  private static invalidateCache() {
    this.cache.clear()
    console.log('🗑️ Cache de planos invalidado')
  }

  // Buscar todos os planos ativos (com cache)
  static async getActivePlans(): Promise<Plan[]> {
    const cacheKey = 'active_plans'
    const now = Date.now()
    
    // Verificar cache
    const cached = this.cache.get(cacheKey)
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      console.log('📦 Planos carregados do cache')
      return cached.data
    }

    try {
      const { data, error } = await supabase
        .from('ocar_planos')
        .select('*')
        .eq('ativo', true)
        .order('preco', { ascending: true })

      if (error) {
        console.error('❌ Erro ao buscar planos ativos:', error)
        throw error
      }

      // Converter beneficios de jsonb para array de strings
      const plans = (data || []).map(plan => ({
        ...plan,
        beneficios: Array.isArray(plan.beneficios) ? plan.beneficios : []
      }))

      // Salvar no cache
      this.cache.set(cacheKey, { data: plans, timestamp: now })
      console.log('💾 Planos salvos no cache')

      return plans
    } catch (error) {
      console.error('❌ Erro no PlansService.getActivePlans:', error)
      throw error
    }
  }

  // Buscar todos os planos (incluindo inativos) - apenas para admin
  static async getAllPlans(): Promise<Plan[]> {
    try {
      const { data, error } = await supabase
        .from('ocar_planos')
        .select('*')
        .order('tipo', { ascending: true })
        .order('preco', { ascending: true })

      if (error) {
        console.error('❌ Erro ao buscar todos os planos:', error)
        throw error
      }

      // Converter beneficios de jsonb para array de strings
      return (data || []).map(plan => ({
        ...plan,
        beneficios: Array.isArray(plan.beneficios) ? plan.beneficios : []
      }))
    } catch (error) {
      console.error('❌ Erro no PlansService.getAllPlans:', error)
      throw error
    }
  }

  // Buscar planos por tipo
  static async getPlansByType(tipo: 'anuncio' | 'consulta'): Promise<Plan[]> {
    try {
      const { data, error } = await supabase
        .from('ocar_planos')
        .select('*')
        .eq('tipo', tipo)
        .eq('ativo', true)
        .order('preco', { ascending: true })

      if (error) {
        console.error('❌ Erro ao buscar planos por tipo:', error)
        throw error
      }

      // Converter beneficios de jsonb para array de strings
      return (data || []).map(plan => ({
        ...plan,
        beneficios: Array.isArray(plan.beneficios) ? plan.beneficios : []
      }))
    } catch (error) {
      console.error('❌ Erro no PlansService.getPlansByType:', error)
      throw error
    }
  }

  // Buscar plano por ID
  static async getPlanById(id: string): Promise<Plan | null> {
    try {
      const { data, error } = await supabase
        .from('ocar_planos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Erro ao buscar plano por ID:', error)
        return null
      }

      // Converter beneficios de jsonb para array de strings
      return {
        ...data,
        beneficios: Array.isArray(data.beneficios) ? data.beneficios : []
      }
    } catch (error) {
      console.error('❌ Erro no PlansService.getPlanById:', error)
      return null
    }
  }

  // Criar novo plano
  static async createPlan(planData: CreatePlanData): Promise<Plan | null> {
    try {
      // Converter beneficios de array para jsonb
      const dataToInsert = {
        ...planData,
        beneficios: planData.beneficios
      }

      const { data, error } = await supabase
        .from('ocar_planos')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar plano:', error)
        throw error
      }

      // Converter beneficios de jsonb para array de strings
      const newPlan = {
        ...data,
        beneficios: Array.isArray(data.beneficios) ? data.beneficios : []
      }

      // Invalidar cache após criação
      this.invalidateCache()

      return newPlan
    } catch (error) {
      console.error('❌ Erro no PlansService.createPlan:', error)
      throw error
    }
  }

  // Atualizar plano
  static async updatePlan(planData: UpdatePlanData): Promise<Plan | null> {
    try {
      const { id, ...updateData } = planData
      
      console.log('🔄 Atualizando plano:', { id, updateData })
      
      const { data, error } = await supabase
        .from('ocar_planos')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao atualizar plano:', error)
        throw error
      }

      console.log('✅ Update executado com sucesso')

      // Invalidar cache após atualização
      this.invalidateCache()

      // Como o RLS pode impedir o retorno dos dados, vamos buscar o plano atualizado separadamente
      const { data: updatedPlan, error: fetchError } = await supabase
        .from('ocar_planos')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('❌ Erro ao buscar plano atualizado:', fetchError)
        // Se não conseguir buscar, retorna os dados que tentamos atualizar
        const fallbackPlan = {
          id,
          ...updateData,
          beneficios: Array.isArray(updateData.beneficios) ? updateData.beneficios : [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Plan
        
        console.log('⚠️ Retornando plano fallback:', fallbackPlan)
        return fallbackPlan
      }

      // Converter beneficios de jsonb para array de strings
      const result = {
        ...updatedPlan,
        beneficios: Array.isArray(updatedPlan.beneficios) ? updatedPlan.beneficios : []
      }
      
      console.log('✅ Plano atualizado retornado:', result)
      return result
    } catch (error) {
      console.error('❌ Erro no PlansService.updatePlan:', error)
      throw error
    }
  }

  // Deletar plano (soft delete - marcar como inativo)
  static async deletePlan(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ocar_planos')
        .update({ 
          ativo: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao deletar plano:', error)
        throw error
      }

      // Invalidar cache após deleção
      this.invalidateCache()

      return true
    } catch (error) {
      console.error('❌ Erro no PlansService.deletePlan:', error)
      throw error
    }
  }

  // Ativar/Desativar plano
  static async togglePlanStatus(id: string, ativo: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ocar_planos')
        .update({ 
          ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao alterar status do plano:', error)
        throw error
      }

      // Invalidar cache após alteração de status
      this.invalidateCache()

      return true
    } catch (error) {
      console.error('❌ Erro no PlansService.togglePlanStatus:', error)
      throw error
    }
  }
}
