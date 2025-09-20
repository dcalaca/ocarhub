import { readFileSync } from 'fs'

async function installETLTest() {
  console.log('🧪 Instalando teste do sistema ETL...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/test-etl-system.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🧪 Este teste verifica:')
    console.log('   • Estrutura das tabelas criadas')
    console.log('   • Constraints e índices')
    console.log('   • Trigger funcionando')
    console.log('   • Funções auxiliares')
    console.log('   • Sistema ETL com dados de teste')
    console.log('   • Verificação final do sistema')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • Execute APÓS instalar o sistema ETL principal')
    console.log('   • O teste insere dados de teste e depois limpa')
    console.log('   • Verifica se tudo está funcionando corretamente')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installETLTest()
