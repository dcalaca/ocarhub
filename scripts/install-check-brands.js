import { readFileSync } from 'fs'

async function installCheckBrands() {
  console.log('🔍 Instalando verificação de marcas...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/check-brands-simple.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🔍 VERIFICAÇÃO DE MARCAS:')
    console.log('   • Mostra marcas existentes no sistema')
    console.log('   • Mostra marcas únicas no transbordo')
    console.log('   • Identifica possíveis conflitos')
    console.log('   • Ajuda a entender o problema')
    
    console.log('\n✨ O QUE VAI MOSTRAR:')
    console.log('   • Total de marcas no sistema')
    console.log('   • Lista completa de marcas existentes')
    console.log('   • Marcas únicas no transbordo')
    console.log('   • Conflitos de código identificados')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installCheckBrands()
