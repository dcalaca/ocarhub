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

// Função helper para localStorage seguro
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && localStorage) {
      try {
        return localStorage.getItem(key)
      } catch (error) {
        console.error('❌ Erro ao acessar localStorage:', error)
        return null
      }
    }
    return null
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && localStorage) {
      try {
        localStorage.setItem(key, value)
      } catch (error) {
        console.error('❌ Erro ao salvar no localStorage:', error)
      }
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && localStorage) {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error('❌ Erro ao remover do localStorage:', error)
      }
    }
  }
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
        console.log('🚀 Inicializando autenticação...')
        
        // Verificar sessão atual do Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error)
          // Se for erro de refresh token, limpar dados locais
          if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('Refresh Token Not Found')) {
            console.log('🔄 Limpando dados de sessão inválida')
            safeLocalStorage.removeItem("ocar-user")
            safeLocalStorage.removeItem("ocar-interactions")
            setUser(null)
            setUserInteractions({ favoritos: [], curtidas: [] })
          }
        } else if (session?.user) {
          console.log('🔐 Usuário logado no Supabase:', session.user.id)
          console.log('📧 Email do usuário:', session.user.email)
          try {
            await loadUserData(session.user.id)
          } catch (loadError) {
            console.error('❌ Erro ao carregar dados do usuário no initializeAuth:', loadError)
          }
        } else {
          console.log('ℹ️ Nenhuma sessão ativa no Supabase')
          // Limpar dados do localStorage se não há sessão ativa
          console.log('🧹 Limpando dados do localStorage (usuário deletado)')
          safeLocalStorage.removeItem("ocar-user")
          safeLocalStorage.removeItem("ocar-interactions")
          setUser(null)
          setUserInteractions({ favoritos: [], curtidas: [] })
        }

        // Carregar interações do localStorage
        try {
          const savedInteractions = safeLocalStorage.getItem("ocar-interactions")
          if (savedInteractions) {
            const parsedInteractions = JSON.parse(savedInteractions)
            if (parsedInteractions && typeof parsedInteractions === 'object') {
              setUserInteractions(parsedInteractions)
            } else {
              console.log('⚠️ Interações inválidas no localStorage, usando padrão')
              setUserInteractions({ favoritos: [], curtidas: [] })
            }
          }
        } catch (parseError) {
          console.error('❌ Erro ao parsear interações do localStorage:', parseError)
          safeLocalStorage.removeItem("ocar-interactions")
          setUserInteractions({ favoritos: [], curtidas: [] })
        }
      } catch (error) {
        console.error("❌ Erro ao inicializar autenticação:", error)
        console.error("❌ Stack trace:", error.stack)
        // Em caso de erro, limpar dados locais para forçar novo login
        safeLocalStorage.removeItem("ocar-user")
        safeLocalStorage.removeItem("ocar-interactions")
        setUser(null)
        setUserInteractions({ favoritos: [], curtidas: [] })
      } finally {
        console.log('✅ Inicialização da autenticação concluída')
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
            try {
              await loadUserData(session.user.id)
            } catch (loadError) {
              console.error('❌ Erro ao carregar dados do usuário no onAuthStateChange:', loadError)
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setUserInteractions({ favoritos: [], curtidas: [] })
            safeLocalStorage.removeItem("ocar-user")
            safeLocalStorage.removeItem("ocar-interactions")
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            console.log('🔄 Token renovado com sucesso')
            try {
              await loadUserData(session.user.id)
            } catch (loadError) {
              console.error('❌ Erro ao carregar dados do usuário no TOKEN_REFRESHED:', loadError)
            }
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
            safeLocalStorage.removeItem("ocar-user")
            safeLocalStorage.removeItem("ocar-interactions")
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
      console.log('🔍 Tipo do userId:', typeof userId)
      console.log('🔍 Tamanho do userId:', userId?.length)
      
      // Verificar se o userId é válido
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('❌ ID do usuário inválido:', userId)
        return
      }
      
      console.log('🔄 Iniciando consulta ao banco...')
      
      // Adicionar timeout para evitar travamento
      const queryPromise = supabase
        .from('ocar_usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na consulta')), 10000)
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      console.log('🔍 Resultado da consulta:', { data, error })
      
      if (error) {
        console.log('❌ Erro na consulta ao banco:', error)
        console.log('❌ Código do erro:', error.code)
        console.log('❌ Mensagem do erro:', error.message)
        // Só exibir erro se não for "usuário não encontrado" (normal durante cadastro)
        if (error.code !== 'PGRST116' && !error.message?.includes('No rows found')) {
          console.error('❌ Erro ao carregar dados do usuário:', error)
          console.error('❌ Código do erro:', error.code)
          console.error('❌ Mensagem do erro:', error.message)
        } else {
          console.log('ℹ️ Usuário não encontrado na tabela (normal durante cadastro)')
        }
        
        // Se o usuário não existe na tabela ou foi deletado
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('🔄 Usuário não encontrado na tabela (pode ter sido deletado)')
          
          // Verificar se ainda existe no Supabase Auth
          const { data: authUser } = await supabase.auth.getUser()
          if (authUser.user && authUser.user.id === userId) {
            console.log('🔄 Usuário ainda existe no Auth, criando perfil básico...')
            
            const { data: newProfile, error: createError } = await supabase
              .from('ocar_usuarios')
              .insert({
                id: userId,
                email: authUser.user.email || '',
                nome: 'Usuário',
                tipo_usuario: 'comprador',
                verificado: false,
                ativo: true,
                promocoes_email: true,
                alertas_multas: false,
                tema_preferido: 'claro',
                saldo: 0
              })
              .select()
              .single()

            if (createError) {
              console.error('❌ Erro ao criar perfil básico:', createError)
              return
            }

            console.log('✅ Perfil básico criado:', newProfile)
            setUser(newProfile)
            safeLocalStorage.setItem("ocar-user", JSON.stringify(newProfile))
          } else {
            console.log('❌ Usuário não existe mais no Supabase Auth, limpando dados locais')
            safeLocalStorage.removeItem("ocar-user")
            safeLocalStorage.removeItem("ocar-interactions")
            setUser(null)
            setUserInteractions({ favoritos: [], curtidas: [] })
          }
        } else {
          // Para outros erros, limpar dados locais
          console.log('❌ Erro não tratado, limpando dados locais')
          safeLocalStorage.removeItem("ocar-user")
          safeLocalStorage.removeItem("ocar-interactions")
          setUser(null)
          setUserInteractions({ favoritos: [], curtidas: [] })
        }
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
        console.log('🔄 Atualizando estado do usuário...')
        setUser(userData)
        safeLocalStorage.setItem("ocar-user", JSON.stringify(userData))
        console.log('✅ Estado do usuário atualizado')
      } else {
        console.log('❌ Nenhum dado encontrado para o usuário')
        console.log('🔍 Dados retornados:', data)
        console.log('🔍 Tipo dos dados:', typeof data)
        console.log('🔍 Dados é null?', data === null)
        console.log('🔍 Dados é undefined?', data === undefined)
      }
    } catch (error) {
      // Só exibir erro se for um erro real, não durante cadastro
      if (error instanceof Error && !error.message?.includes('User not found')) {
        console.error('❌ Erro ao carregar dados do usuário:', error)
        console.error('❌ Tipo do erro:', typeof error)
        console.error('❌ Stack trace:', error.stack)
      } else {
        console.log('ℹ️ Usuário não encontrado (normal durante cadastro)')
      }
    } finally {
      console.log('🏁 loadUserData finalizada')
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
        safeLocalStorage.setItem("ocar-interactions", JSON.stringify(newInteractions))
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
        safeLocalStorage.setItem("ocar-interactions", JSON.stringify(newInteractions))
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
        safeLocalStorage.setItem("ocar-interactions", JSON.stringify(newInteractions))
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
        safeLocalStorage.setItem("ocar-interactions", JSON.stringify(newInteractions))
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
        console.log('🔄 Chamando loadUserData...')
        await loadUserData(data.user.id)
        console.log('✅ loadUserData concluído')
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
      console.log('🔐 Criando usuário no Supabase Auth:', userData.email)
      
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (authError) {
        console.error('❌ Erro no Supabase Auth:', authError)
        
        // Tratar erros específicos
        if (authError.message?.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Tente fazer login ou use outro email.')
        } else if (authError.message?.includes('Invalid email')) {
          throw new Error('Email inválido. Verifique o formato do email.')
        } else if (authError.message?.includes('Password should be at least')) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.')
        } else if (authError.message?.includes('Signup is disabled')) {
          throw new Error('Cadastro temporariamente desabilitado. Tente novamente mais tarde.')
        }
        
        throw authError
      }

      console.log('✅ Usuário criado no Supabase Auth:', authData.user?.id)

      if (authData.user) {
        console.log('📝 Criando perfil na tabela ocar_usuarios...')
        console.log('🔍 Dados do usuário Auth:', authData.user)
        
        const userId = authData.user.id;
        console.log('🆔 ID do usuário recebido:', userId);
        console.log('🔍 Tipo do ID:', typeof userId);
        console.log('📏 Tamanho do ID:', userId?.length);
        console.log('📧 Email do usuário:', authData.user.email);
        
        // Verificar se o perfil já existe antes de tentar criar
        console.log('🔍 Verificando se perfil já existe...')
        
        const { data: existingProfile, error: checkError } = await supabase
          .from('ocar_usuarios')
          .select('id')
          .eq('id', userId)
          .single()
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Erro ao verificar perfil existente:', checkError)
          throw checkError
        }
        
        if (existingProfile) {
          console.log('✅ Perfil já existe, atualizando dados...')
          
          // Atualizar perfil existente com dados do cadastro
          const { data: updatedProfile, error: updateError } = await supabase
            .from('ocar_usuarios')
            .update({
              nome: userData.nome,
              email: userData.email,
              tipo_usuario: userData.tipo_usuario || 'comprador',
              // Dados opcionais - serão preenchidos depois
              cpf: userData.cpf || null,
              telefone: userData.telefone || null,
              endereco: userData.endereco || null,
              data_nascimento: userData.data_nascimento || null,
              cnpj: userData.cnpj || null,
            })
            .eq('id', userId)
            .select()
          
          if (updateError) {
            console.error('❌ Erro ao atualizar perfil:', updateError)
            throw updateError
          }
          
          console.log('✅ Perfil atualizado com sucesso:', updatedProfile)
        } else {
          console.log('🔄 Criando novo perfil...')
          
          // Criar novo perfil
          const { data: profileData, error: profileError } = await supabase
            .from('ocar_usuarios')
            .insert({
              id: userId,
              email: userData.email,
              nome: userData.nome,
              tipo_usuario: userData.tipo_usuario || 'comprador',
              // Dados opcionais - serão preenchidos depois
              cpf: userData.cpf || null,
              telefone: userData.telefone || null,
              endereco: userData.endereco || null,
              data_nascimento: userData.data_nascimento || null,
              cnpj: userData.cnpj || null,
              verificado: false,
              ativo: true,
              promocoes_email: true,
              alertas_multas: false,
              tema_preferido: 'claro'
            })
            .select()
          
          if (profileError) {
            console.error('❌ Erro ao criar perfil:', profileError)
            throw profileError
          }
          
          console.log('✅ Perfil criado com sucesso:', profileData)
        }
        
        // Aguardar um pouco antes de carregar os dados
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        await loadUserData(authData.user.id)
      } else {
        throw new Error('Usuário não foi criado no Supabase Auth')
      }
    } catch (error) {
      console.error('❌ Erro no registro:', error)
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
      safeLocalStorage.removeItem("ocar-user")
      safeLocalStorage.removeItem("ocar-interactions")
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
      const savedUser = safeLocalStorage.getItem("ocar-user")
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
      safeLocalStorage.setItem("ocar-user", JSON.stringify(userAtualizado))

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
      safeLocalStorage.setItem("ocar-user", JSON.stringify(userAtualizado))

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
      safeLocalStorage.setItem("ocar-user", JSON.stringify(userAtualizado))

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
