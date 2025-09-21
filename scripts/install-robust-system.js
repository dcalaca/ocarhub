import { readFileSync } from 'fs'

async function installRobustSystem() {
  console.log('🚀 Instalando sistema robusto de FIPE...\n')

  try {
    // Ler o SQL de migração
    const migrationSql = readFileSync('database/migrate-robust-structure.sql', 'utf8')
    
    // Ler o SQL de funções
    const functionsSql = readFileSync('database/query-fipe-by-concatenation.sql', 'utf8')
    
    console.log('📝 SQL 1 - MIGRAÇÃO (Execute primeiro):')
    console.log('=' .repeat(80))
    console.log(migrationSql)
    console.log('=' .repeat(80))
    
    console.log('\n📝 SQL 2 - FUNÇÕES (Execute depois):')
    console.log('=' .repeat(80))
    console.log(functionsSql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute os SQLs acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n📋 Este sistema robusto inclui:')
    console.log('   • IDs únicos para marcas e modelos')
    console.log('   • Estratégia de concatenação para buscar FIPE')
    console.log('   • Funções de consulta inteligentes')
    console.log('   • Suporte a múltiplos códigos FIPE por modelo')
    
    console.log('\n🔍 Como usar:')
    console.log('   1. get_available_brands() - Lista todas as marcas')
    console.log('   2. get_models_by_brand("Honda") - Lista modelos de uma marca')
    console.log('   3. get_versions_by_model("Honda", "Civic") - Lista versões de um modelo')
    console.log('   4. get_fipe_price("Honda", "Civic", "Sedan EX", 2020) - Busca preço específico')
    console.log('   5. get_fipe_prices_by_model("Honda", "Civic") - Lista todos os preços de um modelo')
    
  } catch (error) {
    console.error('Erro ao ler arquivos SQL:', error.message)
  }
}

installRobustSystem()
