import { readFileSync } from 'fs'

async function installCheckStructure() {
  console.log('🔍 Instalando verificação de estrutura atual...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/check-current-structure.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🔍 Esta verificação mostra:')
    console.log('   • Estrutura atual das tabelas existentes')
    console.log('   • Colunas e tipos de dados')
    console.log('   • Constraints existentes')
    console.log('   • Identifica o problema com brand_id')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • Execute primeiro para ver a estrutura atual')
    console.log('   • Depois criaremos o SQL correto baseado na estrutura')
    console.log('   • O problema é que a tabela não tem a coluna brand_id')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installCheckStructure()