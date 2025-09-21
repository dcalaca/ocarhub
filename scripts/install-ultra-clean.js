import { readFileSync } from 'fs'

async function installUltraClean() {
  console.log('🧹 Instalando script de ultra limpeza...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/ultra-clean-tables.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n📋 Este script:')
    console.log('   • Desabilita RLS temporariamente')
    console.log('   • Força limpeza completa de todas as tabelas')
    console.log('   • Verifica se estão vazias')
    console.log('   • Verifica se ocar_transbordo tem dados')
    console.log('   • Lista tabelas do sistema')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   Se ocar_transbordo estiver vazia, você precisa:')
    console.log('   1. Importar dados para ocar_transbordo primeiro')
    console.log('   2. Depois executar a migração')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installUltraClean()
