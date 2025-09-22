const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateUserBalance() {
  try {
    console.log('💰 Atualizando saldo do usuário...')
    
    const userId = '091ef3dc-923b-467a-a4f6-a9660281494a' // ID do usuário dcalaca@gmail.com
    const newBalance = 550.00
    
    console.log(`🔄 Atualizando saldo para R$ ${newBalance.toFixed(2)}...`)
    
    const { data, error } = await supabase
      .from('ocar_usuarios')
      .update({ 
        saldo: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    if (error) {
      console.error('❌ Erro ao atualizar saldo:', error)
      return
    }
    
    console.log('✅ Saldo atualizado com sucesso!')
    console.log('📊 Dados atualizados:', data)
    
    // Verificar se foi atualizado
    const { data: updatedUser, error: checkError } = await supabase
      .from('ocar_usuarios')
      .select('id, nome, email, saldo, updated_at')
      .eq('id', userId)
      .single()
    
    if (checkError) {
      console.error('❌ Erro ao verificar atualização:', checkError)
    } else {
      console.log('✅ Verificação - Usuário atualizado:')
      console.log(`   Nome: ${updatedUser.nome}`)
      console.log(`   Email: ${updatedUser.email}`)
      console.log(`   Saldo: R$ ${(updatedUser.saldo || 0).toFixed(2)}`)
      console.log(`   Atualizado em: ${new Date(updatedUser.updated_at).toLocaleString('pt-BR')}`)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

updateUserBalance()
