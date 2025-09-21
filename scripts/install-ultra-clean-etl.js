import { readFileSync } from 'fs'

async function installUltraCleanETL() {
  console.log('🧹 Instalando sistema ETL com limpeza ultra agressiva...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/ultra-clean-etl.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🧹 Este sistema ETL com limpeza ultra agressiva:')
    console.log('   • Desabilita RLS temporariamente')
    console.log('   • Limpa tabelas com CASCADE (força limpeza)')
    console.log('   • Usa ON CONFLICT DO NOTHING para evitar duplicatas')
    console.log('   • Migra dados da ocar_transbordo')
    console.log('   • Cria funções auxiliares para consulta')
    console.log('   • Reabilita RLS após migração')
    console.log('   • Testa o sistema com dados reais')
    
    console.log('\n✨ ESTRATÉGIA:')
    console.log('   • CASCADE força limpeza completa das tabelas')
    console.log('   • ON CONFLICT DO NOTHING evita erros de duplicata')
    console.log('   • Verificação em cada etapa do processo')
    console.log('   • Sistema robusto e à prova de falhas')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela ocar_transbordo NÃO será limpa')
    console.log('   • Apenas os dados serão migrados para as tabelas normalizadas')
    console.log('   • Sistema estará pronto para consultas do frontend')
    console.log('   • RLS será reabilitado após a migração')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installUltraCleanETL()
