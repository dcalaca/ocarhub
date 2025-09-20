import { readFileSync } from 'fs'

async function installUltraCleanBrands() {
  console.log('🧹 Instalando limpeza ultra agressiva de marcas...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/ultra-clean-brands.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🧹 Esta limpeza ultra agressiva de marcas:')
    console.log('   • Desabilita RLS temporariamente')
    console.log('   • Limpa tabela com CASCADE (força limpeza)')
    console.log('   • Verifica se a tabela está vazia')
    console.log('   • Insere marcas únicas da ocar_transbordo')
    console.log('   • Reabilita RLS após migração')
    console.log('   • Verifica o resultado final')
    
    console.log('\n✨ ESTRATÉGIA:')
    console.log('   • CASCADE força limpeza completa')
    console.log('   • Desabilita RLS para evitar bloqueios')
    console.log('   • Verifica cada etapa do processo')
    console.log('   • Sistema robusto e à prova de falhas')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela ocar_transbordo NÃO será alterada')
    console.log('   • Apenas a tabela ocar_fipe_brands será limpa e repopulada')
    console.log('   • RLS será reabilitado após a migração')
    console.log('   • Sistema estará pronto para próximos passos')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installUltraCleanBrands()
