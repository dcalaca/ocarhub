import { readFileSync } from 'fs'

async function installListBrands() {
  console.log('📋 Instalando listagem de TODAS as marcas únicas...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/list-all-unique-brands.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n📋 LISTAGEM COMPLETA DE MARCAS:')
    console.log('   • Total de marcas únicas no transbordo')
    console.log('   • Lista completa com numeração')
    console.log('   • Marcas que JÁ EXISTEM no sistema')
    console.log('   • Marcas NOVAS (que não existem)')
    
    console.log('\n✨ O QUE VAI MOSTRAR:')
    console.log('   • Número da marca')
    console.log('   • Nome da marca')
    console.log('   • Código gerado')
    console.log('   • Total de registros')
    console.log('   • Status (existe/não existe)')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installListBrands()
