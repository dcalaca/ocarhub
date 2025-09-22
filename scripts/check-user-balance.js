const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUserBalance() {
  try {
    console.log('🔍 Verificando saldo dos usuários...')
    
    // Buscar todos os usuários com saldo
    const { data: users, error } = await supabase
      .from('ocar_usuarios')
      .select('id, nome, email, saldo, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error)
      return
    }
    
    console.log('👥 Usuários encontrados:')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nome} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Saldo: R$ ${(user.saldo || 0).toFixed(2)}`)
      console.log(`   Criado em: ${new Date(user.created_at).toLocaleString('pt-BR')}`)
      console.log('')
    })
    
    // Buscar usuário específico se tiver email
    const email = 'dcalaca@gmail.com' // Substitua pelo email do usuário
    console.log(`🔍 Buscando usuário específico: ${email}`)
    
    const { data: specificUser, error: specificError } = await supabase
      .from('ocar_usuarios')
      .select('id, nome, email, saldo, created_at')
      .eq('email', email)
      .single()
    
    if (specificError) {
      console.error('❌ Erro ao buscar usuário específico:', specificError)
    } else if (specificUser) {
      console.log('✅ Usuário específico encontrado:')
      console.log(`   Nome: ${specificUser.nome}`)
      console.log(`   Email: ${specificUser.email}`)
      console.log(`   ID: ${specificUser.id}`)
      console.log(`   Saldo: R$ ${(specificUser.saldo || 0).toFixed(2)}`)
      console.log(`   Criado em: ${new Date(specificUser.created_at).toLocaleString('pt-BR')}`)
    } else {
      console.log('❌ Usuário específico não encontrado')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkUserBalance()
