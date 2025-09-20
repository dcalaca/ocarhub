// Script para limpar as tabelas FIPE
// Execute: node scripts/clean-tables.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanTables() {
  console.log('🧹 Limpando tabelas FIPE...\n')

  try {
    // 1. Limpar tabela de transbordo
    console.log('1️⃣ Limpando tabela de transbordo...')
    const { error: transbordoError } = await supabase
      .from('ocar_transbordo')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar tudo

    if (transbordoError) {
      console.log('❌ Erro ao limpar transbordo:', transbordoError.message)
    } else {
      console.log('✅ Tabela de transbordo limpa')
    }

    // 2. Limpar tabela de anos/versões
    console.log('\n2️⃣ Limpando tabela de anos/versões...')
    const { error: yearsError } = await supabase
      .from('ocar_fipe_years')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar tudo

    if (yearsError) {
      console.log('❌ Erro ao limpar anos:', yearsError.message)
    } else {
      console.log('✅ Tabela de anos/versões limpa')
    }

    // 3. Limpar tabela de modelos
    console.log('\n3️⃣ Limpando tabela de modelos...')
    const { error: modelsError } = await supabase
      .from('ocar_fipe_models')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar tudo

    if (modelsError) {
      console.log('❌ Erro ao limpar modelos:', modelsError.message)
    } else {
      console.log('✅ Tabela de modelos limpa')
    }

    // 4. Limpar tabela de marcas (manter apenas as originais se necessário)
    console.log('\n4️⃣ Limpando tabela de marcas...')
    const { error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar tudo

    if (brandsError) {
      console.log('❌ Erro ao limpar marcas:', brandsError.message)
    } else {
      console.log('✅ Tabela de marcas limpa')
    }

    // 5. Limpar tabela de preços
    console.log('\n5️⃣ Limpando tabela de preços...')
    const { error: pricesError } = await supabase
      .from('ocar_fipe_prices')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar tudo

    if (pricesError) {
      console.log('❌ Erro ao limpar preços:', pricesError.message)
    } else {
      console.log('✅ Tabela de preços limpa')
    }

    // 6. Verificar se ficou limpo
    console.log('\n6️⃣ Verificando se ficou limpo...')
    
    const [transbordoCount, brandsCount, modelsCount, yearsCount, pricesCount] = await Promise.all([
      supabase.from('ocar_transbordo').select('*', { count: 'exact', head: true }),
      supabase.from('ocar_fipe_brands').select('*', { count: 'exact', head: true }),
      supabase.from('ocar_fipe_models').select('*', { count: 'exact', head: true }),
      supabase.from('ocar_fipe_years').select('*', { count: 'exact', head: true }),
      supabase.from('ocar_fipe_prices').select('*', { count: 'exact', head: true })
    ])

    console.log('📊 Contagem final:')
    console.log(`  - Transbordo: ${transbordoCount.count}`)
    console.log(`  - Marcas: ${brandsCount.count}`)
    console.log(`  - Modelos: ${modelsCount.count}`)
    console.log(`  - Anos/Versões: ${yearsCount.count}`)
    console.log(`  - Preços: ${pricesCount.count}`)

    console.log('\n🎉 Limpeza concluída!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Execute: node scripts/populate-transbordo-real.js')
    console.log('2. Execute: node scripts/process-transbordo-simple.js')
    console.log('3. Teste: node test-transbordo.js')

  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
  }
}

cleanTables()
