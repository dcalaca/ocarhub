// Script para criar usuário de teste no Supabase
// Execute este script no Node.js ou no console do navegador

const { createClient } = require('@supabase/supabase-js')

// Substitua pelas suas credenciais do Supabase
const supabaseUrl = 'SUA_SUPABASE_URL'
const supabaseKey = 'SUA_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  try {
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'teste@ocar.com',
      password: '123456',
      options: {
        data: {
          nome: 'Usuário Teste'
        }
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário no Auth:', authError)
      return
    }

    console.log('Usuário criado no Auth:', authData.user?.id)

    // Criar perfil na tabela ocar_usuarios
    const { data: profileData, error: profileError } = await supabase
      .from('ocar_usuarios')
      .insert({
        id: authData.user?.id,
        email: 'teste@ocar.com',
        nome: 'Usuário Teste',
        tipo_usuario: 'comprador',
        cpf: '123.456.789-00',
        telefone: '(11) 99999-9999',
        endereco: {
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567'
        },
        verificado: true,
        ativo: true
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      return
    }

    console.log('Perfil criado com sucesso!')
    console.log('Email: teste@ocar.com')
    console.log('Senha: 123456')

  } catch (error) {
    console.error('Erro geral:', error)
  }
}

createTestUser()
