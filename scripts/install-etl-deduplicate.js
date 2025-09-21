import { readFileSync } from 'fs'

async function installETLDeduplicate() {
  console.log('🔄 Instalando sistema ETL com deduplicação prévia...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/etl-deduplicate-first.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🔄 Este sistema ETL com deduplicação prévia:')
    console.log('   • Deduplica dados ANTES de inserir')
    console.log('   • Usa SELECT DISTINCT para eliminar duplicatas')
    console.log('   • Evita erro "ON CONFLICT DO UPDATE command cannot affect row a second time"')
    console.log('   • Migra dados da ocar_transbordo')
    console.log('   • Cria funções auxiliares para consulta')
    console.log('   • Testa o sistema com dados reais')
    
    console.log('\n✨ ESTRATÉGIA:')
    console.log('   • SELECT DISTINCT elimina duplicatas na fonte')
    console.log('   • ON CONFLICT DO NOTHING para dados existentes')
    console.log('   • ON CONFLICT DO UPDATE para preços (atualiza valores)')
    console.log('   • Sistema robusto e à prova de falhas')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela ocar_transbordo NÃO será limpa')
    console.log('   • Apenas os dados serão migrados para as tabelas normalizadas')
    console.log('   • Sistema estará pronto para consultas do frontend')
    console.log('   • Duplicatas são eliminadas na fonte')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installETLDeduplicate()
