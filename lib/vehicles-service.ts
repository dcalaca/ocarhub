import { supabase } from './supabase'
import type { Vehicle } from '@/types'

export class VehiclesService {
  // Buscar veículos com filtros (otimizado)
  static async getVehicles(filters?: {
    marca?: string
    modelo?: string
    ano?: number
    precoMin?: number
    precoMax?: number
    cidade?: string
    combustivel?: string
    cambio?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    try {
      // Query otimizada - sem JOIN desnecessário para listagem
      let query = supabase
        .from('ocar_vehicles')
        .select(`
          id,
          marca,
          modelo,
          versao,
          ano,
          cor,
          quilometragem,
          motor,
          combustivel,
          cambio,
          opcionais,
          preco,
          fipe,
          plano,
          status,
          cidade,
          estado,
          views,
          likes,
          shares,
          fotos,
          verificado,
          created_at,
          updated_at
        `)
        .eq('status', 'ativo')

      // Aplicar filtros de forma otimizada
      if (filters?.marca) {
        query = query.eq('marca', filters.marca)
      }
      if (filters?.modelo) {
        query = query.eq('modelo', filters.modelo)
      }
      if (filters?.ano) {
        query = query.eq('ano', filters.ano)
      }
      if (filters?.precoMin) {
        query = query.gte('preco', filters.precoMin)
      }
      if (filters?.precoMax) {
        query = query.lte('preco', filters.precoMax)
      }
      if (filters?.cidade) {
        query = query.eq('cidade', filters.cidade)
      }
      if (filters?.combustivel) {
        query = query.contains('combustivel', [filters.combustivel])
      }
      if (filters?.cambio) {
        query = query.eq('cambio', filters.cambio)
      }

      // Paginação otimizada
      const limit = filters?.limit || 20
      const offset = filters?.offset || 0
      query = query.range(offset, offset + limit - 1)

      // Ordenação otimizada - priorizar veículos em destaque
      const { data, error } = await query
        .order('plano', { ascending: false }) // destaque primeiro
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar veículos:', error)
      throw error
    }
  }

  // Buscar veículo por ID
  static async getVehicleById(id: string) {
    try {
      const { data, error } = await supabase
        .from('ocar_vehicles')
        .select(`
          *,
          ocar_usuarios!ocar_vehicles_dono_id_fkey(nome, endereco, telefone, email)
        `)
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar veículo:', error)
      throw error
    }
  }

  // Criar novo veículo
  static async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('ocar_vehicles')
        .insert(vehicleData)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao criar veículo:', error)
      throw error
    }
  }

  // Atualizar veículo
  static async updateVehicle(id: string, updates: Partial<Vehicle>) {
    try {
      const { data, error } = await supabase
        .from('ocar_vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error)
      throw error
    }
  }

  // Deletar veículo
  static async deleteVehicle(id: string) {
    try {
      const { error } = await supabase
        .from('ocar_vehicles')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Erro ao deletar veículo:', error)
      throw error
    }
  }

  // Buscar veículos do usuário
  static async getUserVehicles(userId: string) {
    try {
      const { data, error } = await supabase
        .from('ocar_vehicles')
        .select('*')
        .eq('dono_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar veículos do usuário:', error)
      throw error
    }
  }

  // Incrementar visualizações
  static async incrementViews(vehicleId: string) {
    try {
      const { error } = await supabase.rpc('increment_views', {
        vehicle_id: vehicleId
      })

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error)
      throw error
    }
  }

  // Buscar veículos favoritos do usuário
  static async getUserFavorites(userId: string) {
    try {
      const { data, error } = await supabase
        .from('ocar_favorites')
        .select(`
          ocar_vehicles(*, ocar_usuarios!ocar_vehicles_dono_id_fkey(nome, endereco, telefone))
        `)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return data?.map(item => item.ocar_vehicles).filter(Boolean) || []
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error)
      throw error
    }
  }

  // Buscar estatísticas do veículo
  static async getVehicleStats(vehicleId: string) {
    try {
      const { data, error } = await supabase
        .from('ocar_vehicles')
        .select('views, likes, shares')
        .eq('id', vehicleId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }
}
