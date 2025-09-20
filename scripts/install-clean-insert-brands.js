import { readFileSync } from 'fs'

async function installCleanInsertBrands() {
  console.log('🧹 Instalando limpeza e inserção de TODAS as marcas...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/clean-and-insert-all-brands.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🧹 LIMPEZA E INSERÇÃO COMPLETA:')
    console.log('   • LIMPA completamente a tabela ocar_fipe_brands')
    console.log('   • INSERE todas as marcas únicas do transbordo')
    console.log('   • SEM duplicatas')
    console.log('   • Sistema limpo e funcional')
    
    console.log('\n✨ ESTRATÉGIA DEFINITIVA:')
    console.log('   • DELETE FROM ocar_fipe_brands (limpa tudo)')
    console.log('   • DISTINCT marca do transbordo')
    console.log('   • LEFT() para limitar código a 10 caracteres')
    console.log('   • Ordenação alfabética')
    
    console.log('\n📊 O QUE SERÁ INSERIDO:')
    console.log('   • Todas as marcas únicas do transbordo')
    console.log('   • Sem duplicatas')
    console.log('   • Códigos únicos')
    console.log('   • Sistema 100% funcional')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela será LIMPA completamente')
    console.log('   • Todas as marcas serão reinseridas')
    console.log('   • RLS será reabilitado após inserção')
    console.log('   • Sistema estará 100% funcional')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installCleanInsertBrands()
