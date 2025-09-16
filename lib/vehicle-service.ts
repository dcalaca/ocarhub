import { supabase } from './supabase'

export interface Vehicle {
  id: string
  dono_id: string
  marca: string
  modelo: string
  versao: string
  ano: number
  cor: string
  quilometragem: number
  motor: string
  combustivel: string[]
  cambio: string
  opcionais?: string[]
  preco: number
  fipe?: number
  placa_parcial?: string
  numero_proprietarios?: number
  observacoes?: string
  fotos?: string[]
  plano: 'gratuito' | 'destaque' | 'premium'
  verificado?: boolean
  status: 'ativo' | 'pausado' | 'expirado'
  cidade: string
  estado?: string
  views?: number
  likes?: number
  shares?: number
  created_at: string
  updated_at: string
}

export interface CreateVehicleData {
  marca: string
  modelo: string
  versao: string
  ano: number
  cor: string
  quilometragem: number
  motor: string
  combustivel: string[]
  cambio: string
  opcionais?: string[]
  preco: number
  fipe?: number
  placa_parcial?: string
  numero_proprietarios: number
  observacoes?: string
  fotos: string[]
  plano: 'gratuito' | 'destaque' | 'premium'
  cidade: string
  estado?: string
}

export class VehicleService {
  // Buscar todos os veículos de um usuário
  static async getUserVehicles(userId: string): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('ocar_vehicles')
        .select('*')
        .eq('dono_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar veículos do usuário:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('❌ Erro no VehicleService.getUserVehicles:', error)
      throw error
    }
  }

  // Buscar veículo por ID
  static async getVehicleById(vehicleId: string): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('ocar_vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single()

      if (error) {
        console.error('❌ Erro ao buscar veículo:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Erro no VehicleService.getVehicleById:', error)
      return null
    }
  }

  // Criar novo veículo
  static async createVehicle(vehicleData: CreateVehicleData, userId: string): Promise<Vehicle | null> {
    try {
      console.log('🚗 Criando veículo:', { ...vehicleData, dono_id: userId })

      const { data, error } = await supabase
        .from('ocar_vehicles')
        .insert({
          ...vehicleData,
          dono_id: userId,
          status: 'ativo',
          verificado: false,
          views: 0,
          likes: 0,
          shares: 0
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar veículo:', error)
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
        console.error('❌ Código do erro:', error.code)
        console.error('❌ Mensagem do erro:', error.message)
        console.error('❌ Dados enviados:', JSON.stringify({ ...vehicleData, dono_id: userId }, null, 2))
        throw error
      }

      console.log('✅ Veículo criado com sucesso:', data)
      return data
    } catch (error) {
      console.error('❌ Erro no VehicleService.createVehicle:', error)
      throw error
    }
  }

  // Atualizar veículo
  static async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('ocar_vehicles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar veículo:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('❌ Erro no VehicleService.updateVehicle:', error)
      throw error
    }
  }

  // Deletar veículo
  static async deleteVehicle(vehicleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ocar_vehicles')
        .delete()
        .eq('id', vehicleId)

      if (error) {
        console.error('❌ Erro ao deletar veículo:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('❌ Erro no VehicleService.deleteVehicle:', error)
      throw error
    }
  }

  // Pausar veículo
  static async pauseVehicle(vehicleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ocar_vehicles')
        .update({ 
          status: 'pausado',
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)

      if (error) {
        console.error('❌ Erro ao pausar veículo:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('❌ Erro no VehicleService.pauseVehicle:', error)
      throw error
    }
  }

  // Reativar veículo
  static async activateVehicle(vehicleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ocar_vehicles')
        .update({ 
          status: 'ativo',
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)

      if (error) {
        console.error('❌ Erro ao reativar veículo:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('❌ Erro no VehicleService.activateVehicle:', error)
      throw error
    }
  }

  // Incrementar visualizações
  static async incrementViews(vehicleId: string): Promise<boolean> {
    try {
      // Primeiro buscar o veículo para obter o valor atual de views
      const { data: vehicle, error: fetchError } = await supabase
        .from('ocar_vehicles')
        .select('views')
        .eq('id', vehicleId)
        .single()

      if (fetchError) {
        console.error('❌ Erro ao buscar veículo para incrementar views:', fetchError)
        return false
      }

      const currentViews = vehicle?.views || 0

      // Atualizar com o novo valor
      const { error } = await supabase
        .from('ocar_vehicles')
        .update({ 
          views: currentViews + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)

      if (error) {
        console.error('❌ Erro ao incrementar visualizações:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Erro no VehicleService.incrementViews:', error)
      return false
    }
  }

  // Renovar anúncio Destaque
  static async renovarAnuncio(vehicleId: string, userId: string): Promise<boolean> {
    try {
      // Verificar se o veículo pertence ao usuário e é do tipo destaque
      const { data: vehicle, error: fetchError } = await supabase
        .from('ocar_vehicles')
        .select('id, plano, dono_id')
        .eq('id', vehicleId)
        .eq('dono_id', userId)
        .single()

      if (fetchError || !vehicle) {
        console.error('❌ Veículo não encontrado ou não pertence ao usuário:', fetchError)
        return false
      }

      if (vehicle.plano !== 'destaque') {
        console.error('❌ Apenas anúncios do tipo destaque podem ser renovados')
        return false
      }

      // Atualizar o veículo para estender a duração (isso seria implementado com uma lógica de data de expiração)
      const { error } = await supabase
        .from('ocar_vehicles')
        .update({ 
          updated_at: new Date().toISOString(),
          // Aqui você adicionaria lógica para estender a data de expiração em 45 dias
        })
        .eq('id', vehicleId)

      if (error) {
        console.error('❌ Erro ao renovar anúncio:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Erro no VehicleService.renovarAnuncio:', error)
      return false
    }
  }

  // Buscar veículos com filtros
  static async searchVehicles(filters: {
    marca?: string
    modelo?: string
    anoMin?: number
    anoMax?: number
    precoMin?: number
    precoMax?: number
    cidade?: string
    status?: string
    plano?: string
  } = {}): Promise<Vehicle[]> {
    try {
      let query = supabase
        .from('ocar_vehicles')
        .select('*')
        .eq('status', 'ativo')

      if (filters.marca) {
        query = query.eq('marca', filters.marca)
      }

      if (filters.modelo) {
        query = query.eq('modelo', filters.modelo)
      }

      if (filters.anoMin) {
        query = query.gte('ano', filters.anoMin)
      }

      if (filters.anoMax) {
        query = query.lte('ano', filters.anoMax)
      }

      if (filters.precoMin) {
        query = query.gte('preco', filters.precoMin)
      }

      if (filters.precoMax) {
        query = query.lte('preco', filters.precoMax)
      }

      if (filters.cidade) {
        query = query.eq('cidade', filters.cidade)
      }

      if (filters.plano) {
        query = query.eq('plano', filters.plano)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar veículos:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('❌ Erro no VehicleService.searchVehicles:', error)
      throw error
    }
  }
}
