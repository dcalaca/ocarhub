import { readFileSync } from 'fs'

async function addVendidoStatus() {
  console.log('🔧 Adicionando status "vendido" à tabela ocar_vehicles...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('add-vendido-status.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🔧 Este script:')
    console.log('   • Remove a constraint atual de status')
    console.log('   • Adiciona nova constraint incluindo "vendido"')
    console.log('   • Verifica se a constraint foi aplicada')
    
    console.log('\n📋 Status permitidos após execução:')
    console.log('   • ativo')
    console.log('   • pausado') 
    console.log('   • expirado')
    console.log('   • vendido (NOVO)')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

addVendidoStatus()
