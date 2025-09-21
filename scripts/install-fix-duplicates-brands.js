import { readFileSync } from 'fs'

async function installFixDuplicatesBrands() {
  console.log('🔧 Instalando correção de duplicatas e inserção de marcas...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/fix-duplicates-and-insert-brands.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🔧 CORREÇÃO DE DUPLICATAS:')
    console.log('   • VERIFICA duplicatas no transbordo')
    console.log('   • TRATA códigos duplicados automaticamente')
    console.log('   • INSERE todas as marcas únicas')
    console.log('   • Sistema 100% funcional')
    
    console.log('\n✨ ESTRATÉGIA INTELIGENTE:')
    console.log('   • Identifica marcas com mesmo código')
    console.log('   • Adiciona número sequencial para duplicatas')
    console.log('   • Ex: caoa-chery1, caoa-chery2')
    console.log('   • Garante códigos únicos')
    
    console.log('\n📊 O QUE SERÁ FEITO:')
    console.log('   • Limpa tabela completamente')
    console.log('   • Verifica duplicatas no transbordo')
    console.log('   • Trata códigos duplicados')
    console.log('   • Insere todas as marcas')
    console.log('   • Verifica resultado final')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • Duplicatas serão tratadas automaticamente')
    console.log('   • Códigos únicos garantidos')
    console.log('   • Sistema estará 100% funcional')
    console.log('   • Pronto para próximos passos')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installFixDuplicatesBrands()
