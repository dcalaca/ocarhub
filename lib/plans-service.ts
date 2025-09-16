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
  // Buscar todos os planos ativos
  static async getActivePlans(): Promise<Plan[]> {
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
      return (data || []).map(plan => ({
        ...plan,
        beneficios: Array.isArray(plan.beneficios) ? plan.beneficios : []
      }))
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
      return {
        ...data,
        beneficios: Array.isArray(data.beneficios) ? data.beneficios : []
      }
    } catch (error) {
      console.error('❌ Erro no PlansService.createPlan:', error)
      throw error
    }
  }

  // Atualizar plano
  static async updatePlan(planData: UpdatePlanData): Promise<Plan | null> {
    try {
      const { id, ...updateData } = planData
      
      const { data, error } = await supabase
        .from('ocar_planos')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar plano:', error)
        throw error
      }

      // Converter beneficios de jsonb para array de strings
      return {
        ...data,
        beneficios: Array.isArray(data.beneficios) ? data.beneficios : []
      }
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

      return true
    } catch (error) {
      console.error('❌ Erro no PlansService.togglePlanStatus:', error)
      throw error
    }
  }
}
