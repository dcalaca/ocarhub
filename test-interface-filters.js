// Script para testar se os filtros da interface estão funcionando
// Execute: node test-interface-filters.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Simular o que a interface faz
async function testInterfaceFilters() {
  console.log('🧪 Testando filtros como a interface faz...\n')

  try {
    // 1. Simular carregamento de marcas (como a interface faz)
    console.log('1️⃣ Testando carregamento de marcas...')
    
    // Verificar se tem marcas no banco
    const { data: brands, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .select('code, name')
      .eq('active', true)
      .order('name')

    if (brandsError) {
      console.log('❌ Erro ao buscar marcas:', brandsError.message)
      return
    }

    console.log(`✅ ${brands.length} marcas encontradas no banco`)
    console.log('   Primeiras 5 marcas:')
    brands.slice(0, 5).forEach(brand => console.log(`   - ${brand.name} (${brand.code})`))

    // 2. Simular seleção de marca (Honda)
    console.log('\n2️⃣ Testando seleção da marca Honda...')
    const hondaBrand = brands.find(b => b.name === 'Honda')
    
    if (!hondaBrand) {
      console.log('❌ Marca Honda não encontrada!')
      return
    }

    console.log(`✅ Marca Honda encontrada: ${hondaBrand.name} (${hondaBrand.code})`)

    // 3. Simular carregamento de modelos da Honda
    console.log('\n3️⃣ Testando carregamento de modelos da Honda...')
    const { data: models, error: modelsError } = await supabase
      .from('ocar_fipe_models')
      .select('code, name')
      .eq('brand_code', hondaBrand.code)
      .eq('active', true)
      .order('name')

    if (modelsError) {
      console.log('❌ Erro ao buscar modelos:', modelsError.message)
      return
    }

    console.log(`✅ ${models.length} modelos da Honda encontrados`)
    models.forEach(model => console.log(`   - ${model.name} (${model.code})`))

    // 4. Simular seleção de modelo (Civic)
    console.log('\n4️⃣ Testando seleção do modelo Civic...')
    const civicModel = models.find(m => m.name === 'Civic')
    
    if (!civicModel) {
      console.log('❌ Modelo Civic não encontrado!')
      return
    }

    console.log(`✅ Modelo Civic encontrado: ${civicModel.name} (${civicModel.code})`)

    // 5. Simular carregamento de anos do Civic
    console.log('\n5️⃣ Testando carregamento de anos do Civic...')
    const { data: years, error: yearsError } = await supabase
      .from('ocar_fipe_years')
      .select('code, name, year')
      .eq('brand_code', hondaBrand.code)
      .eq('model_code', civicModel.code)
      .eq('active', true)
      .order('year', { ascending: false })

    if (yearsError) {
      console.log('❌ Erro ao buscar anos:', yearsError.message)
      return
    }

    console.log(`✅ ${years.length} anos do Civic encontrados`)
    years.slice(0, 10).forEach(year => console.log(`   - ${year.year}: ${year.name}`))

    // 6. Simular seleção de ano (2017)
    console.log('\n6️⃣ Testando seleção do ano 2017...')
    const year2017 = years.find(y => y.year === 2017)
    
    if (!year2017) {
      console.log('❌ Ano 2017 não encontrado!')
      return
    }

    console.log(`✅ Ano 2017 encontrado: ${year2017.name} (${year2017.code})`)

    // 7. Simular carregamento de versões do Civic 2017
    console.log('\n7️⃣ Testando carregamento de versões do Civic 2017...')
    const { data: versions, error: versionsError } = await supabase
      .from('ocar_fipe_years')
      .select('code, name, fuel_type')
      .eq('brand_code', hondaBrand.code)
      .eq('model_code', civicModel.code)
      .eq('year', 2017)
      .eq('active', true)

    if (versionsError) {
      console.log('❌ Erro ao buscar versões:', versionsError.message)
      return
    }

    console.log(`✅ ${versions.length} versões do Civic 2017 encontradas`)
    versions.forEach(version => console.log(`   - ${version.name} (${version.fuel_type})`))

    console.log('\n🎉 Teste da interface concluído!')
    console.log('\n📋 Resumo:')
    console.log(`   - Marcas: ${brands.length}`)
    console.log(`   - Modelos da Honda: ${models.length}`)
    console.log(`   - Anos do Civic: ${years.length}`)
    console.log(`   - Versões do Civic 2017: ${versions.length}`)

  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
  }
}

testInterfaceFilters()
