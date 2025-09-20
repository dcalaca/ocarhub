import { readFileSync } from 'fs'

async function installETLFixedOrderBy() {
  console.log('🔧 Instalando sistema ETL corrigido (sem limpeza e sem ORDER BY)...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/etl-fixed-order-by.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🔧 Este sistema ETL corrigido:')
    console.log('   • NÃO limpa as tabelas existentes')
    console.log('   • Usa ON CONFLICT DO NOTHING para evitar duplicatas')
    console.log('   • Remove ORDER BY problemático do SELECT DISTINCT')
    console.log('   • Ignora código FIPE duplicado (usa apenas nome da marca)')
    console.log('   • Migra dados da ocar_transbordo')
    console.log('   • Cria funções auxiliares para consulta')
    console.log('   • Testa o sistema com dados reais')
    
    console.log('\n✨ CORREÇÕES:')
    console.log('   • Removido ORDER BY do SELECT DISTINCT')
    console.log('   • Usado ON CONFLICT para evitar duplicatas')
    console.log('   • Ignorado código FIPE para marcas (usa apenas nome)')
    console.log('   • Sistema robusto sem limpeza agressiva')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela ocar_transbordo NÃO será limpa')
    console.log('   • Apenas os dados serão migrados para as tabelas normalizadas')
    console.log('   • Sistema estará pronto para consultas do frontend')
    console.log('   • Duplicatas serão ignoradas automaticamente')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installETLFixedOrderBy()
