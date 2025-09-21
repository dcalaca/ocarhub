import { readFileSync } from 'fs'

async function installDebugFix() {
  console.log('🔍 Instalando debug e correção de duplicatas...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/debug-and-fix-duplicates.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🔍 Esta migração de debug:')
    console.log('   • Desabilita RLS temporariamente')
    console.log('   • Verifica o que está nas tabelas ANTES da limpeza')
    console.log('   • Usa TRUNCATE CASCADE para limpeza mais agressiva')
    console.log('   • Verifica se as tabelas estão vazias APÓS limpeza')
    console.log('   • Usa ON CONFLICT DO NOTHING para evitar duplicatas')
    console.log('   • Migra dados da ocar_transbordo')
    console.log('   • Marca registros como processados')
    console.log('   • Verifica contagem e amostra de dados')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela ocar_transbordo NÃO será limpa')
    console.log('   • Apenas os dados serão marcados como processados')
    console.log('   • Esta é a fonte de todas as informações')
    console.log('   • ON CONFLICT DO NOTHING evita erros de duplicata')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installDebugFix()
