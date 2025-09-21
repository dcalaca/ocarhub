import { readFileSync } from 'fs'

async function installSimpleMigration() {
  console.log('🚀 Instalando migração simples sem ON CONFLICT...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/simple-migration-no-conflict.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🚀 Esta migração simples:')
    console.log('   • Desabilita RLS temporariamente')
    console.log('   • Limpa tabelas de destino com DELETE')
    console.log('   • Verifica se as tabelas estão vazias')
    console.log('   • Migra dados da ocar_transbordo')
    console.log('   • Marca registros como processados')
    console.log('   • Verifica contagem e amostra de dados')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela ocar_transbordo NÃO será limpa')
    console.log('   • Apenas os dados serão marcados como processados')
    console.log('   • Esta é a fonte de todas as informações')
    console.log('   • Não usa ON CONFLICT (compatível com estrutura atual)')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installSimpleMigration()