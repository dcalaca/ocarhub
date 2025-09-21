import { readFileSync } from 'fs'

async function installForceClean() {
  console.log('🧹 Instalando script de limpeza forçada...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/force-clean-tables.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n📋 Este script:')
    console.log('   • Desabilita RLS temporariamente')
    console.log('   • Força limpeza de todas as tabelas')
    console.log('   • Verifica se estão vazias')
    console.log('   • Mostra amostra de marcas disponíveis')
    
    console.log('\n🔄 Depois execute a migração novamente!')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installForceClean()
