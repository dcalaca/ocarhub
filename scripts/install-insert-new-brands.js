import { readFileSync } from 'fs'

async function installInsertNewBrands() {
  console.log('🏷️ Instalando inserção de marcas novas...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/insert-new-brands-only.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🏷️ INSERÇÃO DE MARCAS NOVAS:')
    console.log('   • Insere APENAS marcas que não existem')
    console.log('   • SEM duplicatas')
    console.log('   • SEM conflitos')
    console.log('   • Sistema limpo e funcional')
    
    console.log('\n✨ ESTRATÉGIA INTELIGENTE:')
    console.log('   • LEFT JOIN para verificar existência')
    console.log('   • WHERE b.code IS NULL (não existe)')
    console.log('   • DISTINCT para evitar duplicatas')
    console.log('   • Ordenação alfabética')
    
    console.log('\n📊 MARCAS QUE SERÃO INSERIDAS:')
    console.log('   • Acura, Agrale, Alfa Romeo, AM Gen...')
    console.log('   • BMW, BYD, Cadillac, Caoa Chery...')
    console.log('   • Ferrari, Fiat, Ford, Hyundai...')
    console.log('   • Mercedes-Benz, Nissan, Toyota...')
    console.log('   • E muitas outras!')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • RLS será desabilitado temporariamente')
    console.log('   • Apenas marcas novas serão inseridas')
    console.log('   • RLS será reabilitado após inserção')
    console.log('   • Sistema estará 100% funcional')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installInsertNewBrands()
