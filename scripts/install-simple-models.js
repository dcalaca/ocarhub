import { readFileSync } from 'fs'

async function installSimpleModels() {
  console.log('🚗 Instalando migração simples de modelos...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/simple-models-migration.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🚗 Esta migração simples de modelos:')
    console.log('   • Limpa a tabela ocar_fipe_models')
    console.log('   • Agrupa modelos únicos da ocar_transbordo')
    console.log('   • Conecta cada modelo com sua marca')
    console.log('   • Gera código único para cada modelo')
    console.log('   • Verifica o resultado')
    
    console.log('\n✨ BENEFÍCIOS:')
    console.log('   • Simples e direto')
    console.log('   • Sem conflitos ou duplicatas')
    console.log('   • Agrupa automaticamente por marca')
    console.log('   • Fácil de entender e executar')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela ocar_transbordo NÃO será alterada')
    console.log('   • Apenas a tabela ocar_fipe_models será limpa e repopulada')
    console.log('   • Cada modelo será conectado com sua marca')
    console.log('   • Sistema estará pronto para próximos passos')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installSimpleModels()
