import { readFileSync } from 'fs'

async function installETLFixed() {
  console.log('🔧 Instalando sistema ETL corrigido...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/etl-fixed-structure.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🔧 Este sistema ETL corrigido:')
    console.log('   • Usa a estrutura atual das tabelas (brand_code em vez de brand_id)')
    console.log('   • Migra dados da ocar_transbordo para as tabelas normalizadas')
    console.log('   • Cria funções auxiliares para consulta')
    console.log('   • Testa o sistema com dados reais')
    console.log('   • Inclui documentação completa')
    
    console.log('\n✨ FUNCIONALIDADES:')
    console.log('   • get_fipe_price() - busca preço por marca, modelo, ano')
    console.log('   • get_available_brands() - lista todas as marcas')
    console.log('   • get_models_by_brand() - lista modelos de uma marca')
    console.log('   • get_years_by_model() - lista anos de um modelo')
    console.log('   • get_prices_by_model() - lista preços com filtros')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela ocar_transbordo NÃO será limpa')
    console.log('   • Apenas os dados serão migrados para as tabelas normalizadas')
    console.log('   • Sistema estará pronto para consultas do frontend')
    console.log('   • Estrutura compatível com as tabelas existentes')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installETLFixed()
