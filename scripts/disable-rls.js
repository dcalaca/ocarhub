import { readFileSync } from 'fs'

async function disableRLS() {
  console.log('🔧 Desabilitando RLS temporariamente...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/disable-rls-temporarily.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

disableRLS()
