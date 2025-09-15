"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

// Definir o tipo de usuário
// interface User {
//   uid: string
//   email: string | null
//   displayName: string | null
//   photoURL: string | null
//   nome: string
//   tipo: "comprador" | "vendedor" | "admin"
//   telefone: string
//   cidade: string
//   cpf: string
//   saldo: number
//   favoritos: string[]
//   curtidas: string[]
// }

interface User {
  id: string
  nome: string
  email: string
  tipo_usuario: "comprador" | "vendedor" | "admin"
  cpf?: string
  telefone?: string
  foto_perfil?: string
  saldo?: number
  endereco?: {
    cidade?: string
    estado?: string
    cep?: string
    rua?: string
    numero?: string
    complemento?: string
  }
  data_nascimento?: string
  verificado?: boolean
  ativo?: boolean
  promocoes_email?: boolean
  alertas_multas?: boolean
  cnpj?: string
  created_at?: string
  updated_at?: string
}

// Definir o tipo do contexto
// interface AuthContextType {
//   user: User | null
//   loading: boolean
//   login: (email: string, password: string) => Promise<User | null>
//   register: (
//     userData: Omit<User, "uid" | "favoritos" | "curtidas" | "saldo"> & { password: string },
//   ) => Promise<User | null>
//   logout: () => Promise<void>
//   debitSaldo: (valor: number, descricao: string) => Promise<boolean>
//   creditSaldo: (valor: number, descricao: string) => Promise<boolean>
//   toggleFavorito: (veiculoId: string) => Promise<void>
//   toggleCurtida: (veiculoId: string) => Promise<void>
//   isFavorito: (veiculoId: string) => boolean
//   isCurtido: (veiculoId: string) => boolean
// }

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    nome: string
    tipo_usuario: "comprador" | "vendedor"
    cpf?: string
    telefone?: string
    endereco?: {
      cidade?: string
      estado?: string
      cep?: string
      rua?: string
      numero?: string
      complemento?: string
    }
    data_nascimento?: string
    cnpj?: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUserData: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
  debitSaldo: (valor: number, descricao: string, tipo?: string) => Promise<boolean>
  creditSaldo: (valor: number, descricao: string, tipo?: string) => Promise<boolean>
  isLoading: boolean
  userInteractions: {
    favoritos: string[]
    curtidas: string[]
  }
  toggleFavorito: (vehicleId: string) => Promise<void>
  toggleCurtida: (vehicleId: string) => Promise<void>
  isFavorito: (vehicleId: string) => boolean
  isCurtido: (vehicleId: string) => boolean
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Componente Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userInteractions, setUserInteractions] = useState({
    favoritos: [] as string[],
    curtidas: [] as string[],
  })

  // Carregar dados do localStorage e verificar sessão do Supabase
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar sessão atual do Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error)
          // Se for erro de refresh token, limpar dados locais
          if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('Refresh Token Not Found')) {
            console.log('🔄 Limpando dados de sessão inválida')
            localStorage.removeItem("ocar-user")
            localStorage.removeItem("ocar-interactions")
            setUser(null)
            setUserInteractions({ favoritos: [], curtidas: [] })
          }
        } else if (session?.user) {
          console.log('🔐 Usuário logado no Supabase:', session.user.id)
          await loadUserData(session.user.id)
        } else {
          // Fallback para dados do localStorage (para desenvolvimento)
          const savedUser = localStorage.getItem("ocar-user")
          if (savedUser) {
            const userData = JSON.parse(savedUser)
            console.log('💾 Usuário do localStorage:', userData.id)
            // Tentar recarregar do Supabase mesmo sem sessão ativa
            await loadUserData(userData.id)
          }
        }

        // Carregar interações do localStorage
        const savedInteractions = localStorage.getItem("ocar-interactions")
        if (savedInteractions) {
          setUserInteractions(JSON.parse(savedInteractions))
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error)
        // Em caso de erro, limpar dados locais para forçar novo login
        localStorage.removeItem("ocar-user")
        localStorage.removeItem("ocar-interactions")
        setUser(null)
        setUserInteractions({ favoritos: [], curtidas: [] })
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Evento de autenticação:', event)
        
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserData(session.user.id)
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setUserInteractions({ favoritos: [], curtidas: [] })
            localStorage.removeItem("ocar-user")
            localStorage.removeItem("ocar-interactions")
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            console.log('🔄 Token renovado com sucesso')
            await loadUserData(session.user.id)
          } else if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
            // Limpar dados em caso de logout ou atualização
            if (event === 'SIGNED_OUT') {
              setUser(null)
              setUserInteractions({ favoritos: [], curtidas: [] })
              localStorage.removeItem("ocar-user")
              localStorage.removeItem("ocar-interactions")
            }
          }
        } catch (error) {
          console.error('❌ Erro no listener de autenticação:', error)
          // Em caso de erro, limpar dados para forçar novo login
          if (error instanceof Error && error.message?.includes('Invalid Refresh Token')) {
            setUser(null)
            setUserInteractions({ favoritos: [], curtidas: [] })
            localStorage.removeItem("ocar-user")
            localStorage.removeItem("ocar-interactions")
          }
        } finally {
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Função para carregar dados do usuário do Supabase
  const loadUserData = async (userId: string) => {
    try {
      console.log('🔍 Buscando usuário no Supabase:', userId)
      const { data, error } = await supabase
        .from('ocar_usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error)
        return
      }

      if (data) {
        console.log('✅ Dados do usuário carregados:', data)
        // Adicionar saldo padrão se não existir
        const userData = {
          ...data,
          saldo: data.saldo || 0
        }
        console.log('💰 Saldo do usuário:', userData.saldo)
        setUser(userData)
        localStorage.setItem("ocar-user", JSON.stringify(userData))
      } else {
        console.log('❌ Nenhum dado encontrado para o usuário')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error)
    }
  }

  // Funções de favoritos e curtidas integradas com Supabase
  const toggleFavorito = async (vehicleId: string) => {
    if (!user) return

    try {
      const isFav = userInteractions.favoritos.includes(vehicleId)
      
      if (isFav) {
        // Remover favorito
        const { error } = await supabase
          .from('ocar_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('vehicle_id', vehicleId)

        if (error) throw error

        const newFavoritos = userInteractions.favoritos.filter((id) => id !== vehicleId)
        const newInteractions = { ...userInteractions, favoritos: newFavoritos }
        setUserInteractions(newInteractions)
        localStorage.setItem("ocar-interactions", JSON.stringify(newInteractions))
      } else {
        // Adicionar favorito
        const { error } = await supabase
          .from('ocar_favorites')
          .insert({
            user_id: user.id,
            vehicle_id: vehicleId
          })

        if (error) throw error

        const newFavoritos = [...userInteractions.favoritos, vehicleId]
        const newInteractions = { ...userInteractions, favoritos: newFavoritos }
        setUserInteractions(newInteractions)
        localStorage.setItem("ocar-interactions", JSON.stringify(newInteractions))
      }
    } catch (error) {
      console.error('Erro ao toggle favorito:', error)
    }
  }

  const toggleCurtida = async (vehicleId: string) => {
    if (!user) return

    try {
      const isLiked = userInteractions.curtidas.includes(vehicleId)
      
      if (isLiked) {
        // Remover curtida
        const { error } = await supabase
          .from('ocar_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('vehicle_id', vehicleId)

        if (error) throw error

        const newCurtidas = userInteractions.curtidas.filter((id) => id !== vehicleId)
        const newInteractions = { ...userInteractions, curtidas: newCurtidas }
        setUserInteractions(newInteractions)
        localStorage.setItem("ocar-interactions", JSON.stringify(newInteractions))
      } else {
        // Adicionar curtida
        const { error } = await supabase
          .from('ocar_likes')
          .insert({
            user_id: user.id,
            vehicle_id: vehicleId
          })

        if (error) throw error

        const newCurtidas = [...userInteractions.curtidas, vehicleId]
        const newInteractions = { ...userInteractions, curtidas: newCurtidas }
        setUserInteractions(newInteractions)
        localStorage.setItem("ocar-interactions", JSON.stringify(newInteractions))
      }
    } catch (error) {
      console.error('Erro ao toggle curtida:', error)
    }
  }

  const isFavorito = (vehicleId: string) => {
    return userInteractions.favoritos.includes(vehicleId)
  }

  const isCurtido = (vehicleId: string) => {
    return userInteractions.curtidas.includes(vehicleId)
  }


  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('🔐 Tentando login no Supabase:', email)
      
      // Login real no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Erro no login:', error)
        throw error
      }

      if (data.user) {
        console.log('✅ Login bem-sucedido:', data.user.id)
        await loadUserData(data.user.id)
      } else {
        throw new Error('Usuário não encontrado')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    email: string
    password: string
    nome: string
    tipo_usuario: "comprador" | "vendedor"
    cpf?: string
    telefone?: string
    endereco?: {
      cidade?: string
      estado?: string
      cep?: string
      rua?: string
      numero?: string
      complemento?: string
    }
    data_nascimento?: string
    cnpj?: string
  }) => {
    setIsLoading(true)
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Criar perfil do usuário na tabela ocar_usuarios
        const { error: profileError } = await supabase
          .from('ocar_usuarios')
          .insert({
            id: authData.user.id,
            email: userData.email,
            nome: userData.nome,
            tipo_usuario: userData.tipo_usuario,
            cpf: userData.cpf,
            telefone: userData.telefone,
            endereco: userData.endereco,
            data_nascimento: userData.data_nascimento,
            cnpj: userData.cnpj,
            verificado: false,
            ativo: true,
            promocoes_email: true,
            alertas_multas: false,
            tema_preferido: 'claro'
          })

        if (profileError) {
          throw profileError
        }

        await loadUserData(authData.user.id)
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserInteractions({ favoritos: [], curtidas: [] })
      localStorage.removeItem("ocar-user")
      localStorage.removeItem("ocar-interactions")
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  // Função para recarregar dados do usuário (útil após atualizações no banco)
  const refreshUserData = async () => {
    if (user?.id) {
      console.log('🔄 Recarregando dados do usuário:', user.id)
      await loadUserData(user.id)
    } else {
      // Se não há usuário logado, tentar carregar do localStorage
      const savedUser = localStorage.getItem("ocar-user")
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        console.log('🔄 Recarregando dados do localStorage:', userData.id)
        await loadUserData(userData.id)
      }
    }
  }

  // Funções de saldo
  const debitSaldo = async (valor: number, descricao: string, tipo: string = "gasto") => {
    if (!user) {
      console.error('❌ Usuário não logado')
      return false
    }

    if (valor <= 0) {
      console.error('❌ Valor deve ser maior que zero')
      return false
    }

    if ((user.saldo || 0) < valor) {
      console.error('❌ Saldo insuficiente')
      return false
    }

    try {
      console.log('💰 Debitando saldo:', { valor, descricao, tipo, saldoAtual: user.saldo })
      
      // Atualizar saldo no Supabase
      const { error } = await supabase
        .from('ocar_usuarios')
        .update({ 
          saldo: (user.saldo || 0) - valor,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('❌ Erro ao debitar saldo:', error)
        return false
      }

      // Atualizar usuário local
      const novoSaldo = (user.saldo || 0) - valor
      const userAtualizado = { ...user, saldo: novoSaldo }
      setUser(userAtualizado)
      localStorage.setItem("ocar-user", JSON.stringify(userAtualizado))

      console.log('✅ Saldo debitado com sucesso. Novo saldo:', novoSaldo)
      return true
    } catch (error) {
      console.error('❌ Erro ao debitar saldo:', error)
      return false
    }
  }

  const creditSaldo = async (valor: number, descricao: string, tipo: string = "deposito") => {
    if (!user) {
      console.error('❌ Usuário não logado')
      return false
    }

    if (valor <= 0) {
      console.error('❌ Valor deve ser maior que zero')
      return false
    }

    try {
      console.log('💰 Creditando saldo:', { valor, descricao, tipo, saldoAtual: user.saldo })
      
      // Atualizar saldo no Supabase
      const { error } = await supabase
        .from('ocar_usuarios')
        .update({ 
          saldo: (user.saldo || 0) + valor,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('❌ Erro ao creditar saldo:', error)
        return false
      }

      // Atualizar usuário local
      const novoSaldo = (user.saldo || 0) + valor
      const userAtualizado = { ...user, saldo: novoSaldo }
      setUser(userAtualizado)
      localStorage.setItem("ocar-user", JSON.stringify(userAtualizado))

      console.log('✅ Saldo creditado com sucesso. Novo saldo:', novoSaldo)
      return true
    } catch (error) {
      console.error('❌ Erro ao creditar saldo:', error)
      return false
    }
  }

  // Função para atualizar dados do usuário
  const updateUser = async (userData: Partial<User>) => {
    if (!user) return

    try {
      console.log('🔄 Atualizando dados do usuário:', userData)
      
      const { error } = await supabase
        .from('ocar_usuarios')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('❌ Erro ao atualizar usuário:', error)
        throw error
      }

      // Atualizar usuário local
      const userAtualizado = { ...user, ...userData }
      setUser(userAtualizado)
      localStorage.setItem("ocar-user", JSON.stringify(userAtualizado))

      console.log('✅ Usuário atualizado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
      throw error
    }
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        refreshUserData,
        updateUser,
        debitSaldo,
        creditSaldo,
        isLoading,
        userInteractions,
        toggleFavorito,
        toggleCurtida,
        isFavorito,
        isCurtido,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
