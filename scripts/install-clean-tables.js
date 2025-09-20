import { readFileSync } from 'fs'

async function installCleanTables() {
  console.log('🧹 Instalando script de limpeza completa...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/clean-all-tables.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n📋 Este script:')
    console.log('   • Desabilita RLS temporariamente')
    console.log('   • Limpa todas as tabelas normalizadas')
    console.log('   • Verifica se estão vazias')
    console.log('   • Verifica se ocar_transbordo tem dados')
    
    console.log('\n🔄 Depois execute a migração novamente!')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installCleanTables()
