import { readFileSync } from 'fs'

async function installMonthlySystem() {
  console.log('📅 Instalando sistema de atualização mensal...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/monthly-update-system.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n📋 Este sistema inclui:')
    console.log('   • Função update_fipe_brands() - Atualiza marcas')
    console.log('   • Função update_fipe_models() - Atualiza modelos base')
    console.log('   • Função update_fipe_prices() - Atualiza preços')
    console.log('   • Função monthly_fipe_update() - Atualização completa')
    console.log('   • Segue sua regra de negócio mensal')
    
    console.log('\n🔄 Como usar mensalmente:')
    console.log('   1. Atualize a tabela ocar_transbordo com novos dados FIPE')
    console.log('   2. Execute: SELECT monthly_fipe_update();')
    console.log('   3. O sistema distribui automaticamente para as 3 tabelas')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installMonthlySystem()
