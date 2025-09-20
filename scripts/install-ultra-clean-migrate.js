import { readFileSync } from 'fs'

async function installUltraCleanMigrate() {
  console.log('🧹 Instalando limpeza ultra agressiva e migração...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/ultra-clean-and-migrate.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🧹 Esta migração ultra agressiva:')
    console.log('   • Desabilita RLS temporariamente')
    console.log('   • Limpa tabelas com CASCADE (força limpeza)')
    console.log('   • Verifica se as tabelas estão vazias')
    console.log('   • Migra dados da ocar_transbordo')
    console.log('   • Marca registros como processados')
    console.log('   • Verifica contagem e amostra de dados')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela ocar_transbordo NÃO será limpa')
    console.log('   • Apenas os dados serão marcados como processados')
    console.log('   • Esta é a fonte de todas as informações')
    console.log('   • CASCADE força a limpeza de dados residuais')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installUltraCleanMigrate()
