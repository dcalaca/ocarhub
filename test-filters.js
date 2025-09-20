// Script super simples para testar os filtros
// Execute: node test-filters.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testFilters() {
  console.log('🧪 Testando filtros da FIPE...\n')

  try {
    // 1. Testar busca de marcas
    console.log('1️⃣ Testando busca de marcas...')
    const { data: brands, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .select('code, name')
      .limit(5)

    if (brandsError) {
      console.log('❌ Erro ao buscar marcas:', brandsError.message)
    } else {
      console.log('✅ Marcas encontradas:')
      brands.forEach(brand => console.log(`   - ${brand.code}: ${brand.name}`))
    }

    // 2. Testar busca de modelos (Honda)
    console.log('\n2️⃣ Testando busca de modelos da Honda...')
    const { data: models, error: modelsError } = await supabase
      .from('ocar_fipe_models')
      .select('code, name')
      .eq('brand_code', '25') // Honda
      .limit(5)

    if (modelsError) {
      console.log('❌ Erro ao buscar modelos:', modelsError.message)
    } else {
      console.log('✅ Modelos da Honda encontrados:')
      models.forEach(model => console.log(`   - ${model.code}: ${model.name}`))
    }

    // 3. Testar busca de anos (Civic)
    console.log('\n3️⃣ Testando busca de anos do Civic...')
    const { data: years, error: yearsError } = await supabase
      .from('ocar_fipe_years')
      .select('code, name, year')
      .eq('brand_code', '25') // Honda
      .eq('model_code', '1248') // Civic
      .order('year', { ascending: false })
      .limit(10)

    if (yearsError) {
      console.log('❌ Erro ao buscar anos:', yearsError.message)
    } else {
      console.log('✅ Anos do Civic encontrados:')
      years.forEach(year => console.log(`   - ${year.year}: ${year.name}`))
    }

    // 4. Testar busca de versões (Civic 2017)
    console.log('\n4️⃣ Testando busca de versões do Civic 2017...')
    const { data: versions, error: versionsError } = await supabase
      .from('ocar_fipe_years')
      .select('code, name, fuel_type')
      .eq('brand_code', '25') // Honda
      .eq('model_code', '1248') // Civic
      .eq('year', 2017)
      .limit(5)

    if (versionsError) {
      console.log('❌ Erro ao buscar versões:', versionsError.message)
    } else {
      console.log('✅ Versões do Civic 2017 encontradas:')
      versions.forEach(version => console.log(`   - ${version.code}: ${version.name} (${version.fuel_type})`))
    }

    console.log('\n🎉 Teste concluído!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Abra http://localhost:3000/anunciar')
    console.log('2. Teste os filtros na interface')
    console.log('3. Veja se está funcionando como esperado')

  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
  }
}

testFilters()
