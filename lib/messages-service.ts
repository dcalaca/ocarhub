import { supabase } from './supabase'
import type { Chat, Message, User, Vehicle } from '@/types'

export class MessagesService {
  // Buscar conversas do usuário (baseado em mensagens)
  static async getUserChats(userId: string) {
    try {
      console.log('🔍 Buscando conversas para usuário:', userId)
      
      // Buscar mensagens onde o usuário é sender ou receiver
      const { data: messages, error } = await supabase
        .from('ocar_messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      console.log('📊 Resultado da query:', { messages, error })

      if (error) {
        console.error('❌ Erro na query de mensagens:', error)
        throw error
      }

      if (!messages || messages.length === 0) {
        console.log('ℹ️ Nenhuma mensagem encontrada')
        return []
      }

      console.log(`📨 ${messages.length} mensagens encontradas`)

      // Agrupar mensagens por conversa (sender + receiver + vehicle)
      const conversations = new Map()
      
      for (const message of messages) {
        console.log('🔄 Processando mensagem:', message.id)
        
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id
        const vehicleId = message.vehicle_id
        const conversationKey = `${otherUserId}-${vehicleId}`
        
        console.log('🔑 Chave da conversa:', conversationKey)
        
        if (!conversations.has(conversationKey)) {
          console.log('🆕 Nova conversa encontrada')
          
          // Buscar dados do outro usuário
          const { data: otherUser, error: userError } = await supabase
            .from('ocar_usuarios')
            .select('id, nome, email, avatar_url')
            .eq('id', otherUserId)
            .single()

          console.log('👤 Dados do usuário:', { otherUser, userError })

          // Buscar dados do veículo
          const { data: vehicle, error: vehicleError } = await supabase
            .from('ocar_vehicles')
            .select('id, marca, modelo, preco, ano, cidade')
            .eq('id', vehicleId)
            .single()

          console.log('🚗 Dados do veículo:', { vehicle, vehicleError })

          conversations.set(conversationKey, {
            id: conversationKey,
            other_user: otherUser || { id: otherUserId, nome: 'Usuário', email: '', avatar_url: '' },
            vehicle: vehicle || { id: vehicleId, marca: 'Veículo', modelo: '', preco: 0, ano: 0, cidade: '' },
            last_message: message,
            unread_count: 0,
            updated_at: message.created_at
          })
        }
        
        // Contar mensagens não lidas
        if (message.receiver_id === userId && !message.read_at) {
          conversations.get(conversationKey).unread_count++
        }
      }

      const result = Array.from(conversations.values())
      console.log('✅ Conversas processadas:', result.length)
      return result
    } catch (error) {
      console.error('❌ Erro ao buscar conversas:', error)
      return []
    }
  }

  // Buscar mensagens de uma conversa
  static async getChatMessages(conversationKey: string) {
    try {
      // conversationKey é no formato "otherUserId-vehicleId"
      const [otherUserId, vehicleId] = conversationKey.split('-')
      
      const { data, error } = await supabase
        .from('ocar_messages')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Erro na query de mensagens:', error)
        throw error
      }

      // Buscar dados dos usuários para cada mensagem
      const messagesWithUsers = []
      for (const message of data || []) {
        const { data: sender } = await supabase
          .from('ocar_usuarios')
          .select('id, nome, email, avatar_url')
          .eq('id', message.sender_id)
          .single()

        messagesWithUsers.push({
          ...message,
          sender: sender || { id: message.sender_id, nome: 'Usuário', email: '', avatar_url: '' }
        })
      }

      return messagesWithUsers
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
      return []
    }
  }

  // Enviar mensagem
  static async sendMessage(conversationKey: string, senderId: string, content: string) {
    try {
      // conversationKey é no formato "otherUserId-vehicleId"
      const [otherUserId, vehicleId] = conversationKey.split('-')
      
      const { data, error } = await supabase
        .from('ocar_messages')
        .insert({
          sender_id: senderId,
          receiver_id: otherUserId,
          vehicle_id: vehicleId,
          content
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      throw error
    }
  }

  // Marcar mensagens como lidas
  static async markMessagesAsRead(conversationKey: string, userId: string) {
    try {
      const [otherUserId, vehicleId] = conversationKey.split('-')
      
      const { error } = await supabase
        .from('ocar_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('vehicle_id', vehicleId)
        .eq('receiver_id', userId)
        .eq('sender_id', otherUserId)
        .is('read_at', null)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error)
      throw error
    }
  }
}