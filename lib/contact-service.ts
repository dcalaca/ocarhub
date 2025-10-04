import { supabase } from './supabase'

export interface ContactInfo {
  id: string
  nome: string
  telefone?: string
  email: string
  tipo_usuario: string
  foto_perfil?: string
}

export class ContactService {
  // Buscar informações de contato do proprietário do veículo
  static async getVehicleOwnerContact(vehicleId: string): Promise<ContactInfo | null> {
    try {
      console.log('🔍 Buscando informações do proprietário do veículo:', vehicleId)
      
      const { data, error } = await supabase
        .from('ocar_vehicles')
        .select(`
          dono_id,
          ocar_usuarios!inner(
            id,
            nome,
            telefone,
            email,
            tipo_usuario,
            foto_perfil
          )
        `)
        .eq('id', vehicleId)
        .single()

      if (error) {
        console.error('❌ Erro ao buscar proprietário:', error)
        throw error
      }

      if (!data || !data.ocar_usuarios) {
        console.log('ℹ️ Proprietário não encontrado')
        return null
      }

      const owner = data.ocar_usuarios
      console.log('✅ Proprietário encontrado:', owner.nome)
      
      return {
        id: owner.id,
        nome: owner.nome,
        telefone: owner.telefone,
        email: owner.email,
        tipo_usuario: owner.tipo_usuario,
        foto_perfil: owner.foto_perfil
      }
    } catch (error) {
      console.error('❌ Erro ao buscar contato do proprietário:', error)
      throw error
    }
  }

  // Verificar se o usuário pode ver o telefone (regras de negócio)
  static canViewPhone(currentUserId: string, ownerId: string): boolean {
    // Por enquanto, qualquer usuário logado pode ver o telefone
    // Futuramente pode implementar regras como:
    // - Apenas usuários verificados
    // - Apenas após enviar mensagem
    // - Apenas usuários premium
    return currentUserId !== ownerId // Não pode ver o próprio telefone
  }

  // Formatar telefone para exibição
  static formatPhone(phone: string): string {
    if (!phone) return ''
    
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')
    
    // Formata baseado no tamanho
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    
    return phone
  }
}
