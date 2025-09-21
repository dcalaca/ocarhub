import { readFileSync } from 'fs'

async function installSimpleBrandsOnly() {
  console.log('🏷️ Instalando migração SIMPLES - APENAS MARCAS...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/simple-brands-only.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🏷️ MIGRAÇÃO SIMPLES - APENAS MARCAS:')
    console.log('   • LIMPA a tabela ocar_fipe_brands')
    console.log('   • INSERE apenas marcas únicas')
    console.log('   • SEM duplicatas')
    console.log('   • SEM modelos, SEM versões')
    console.log('   • Apenas marcas simples')
    
    console.log('\n✨ ESTRATÉGIA SIMPLES:')
    console.log('   • DISTINCT marca da ocar_transbordo')
    console.log('   • Code limitado a 10 caracteres')
    console.log('   • Ordenação alfabética')
    console.log('   • Sistema funcional')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • Apenas marcas por enquanto')
    console.log('   • Depois fazemos modelos')
    console.log('   • Depois fazemos preços')
    console.log('   • Passo a passo, sem pressa')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installSimpleBrandsOnly()
