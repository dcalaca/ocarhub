// Script para testar a interface passo a passo
// Execute: node test-interface-step-by-step.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Simular exatamente o que a interface faz
async function testInterfaceStepByStep() {
  console.log('🧪 Testando interface passo a passo...\n')

  try {
    // 1. Simular carregamento inicial (como a interface faz)
    console.log('1️⃣ Simulando carregamento inicial...')
    
    // Verificar se tem marcas no banco (como a interface faz)
    const { data: brands, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .select('code, name')
      .eq('active', true)
      .order('name')

    if (brandsError) {
      console.log('❌ Erro ao buscar marcas:', brandsError.message)
      return
    }

    console.log(`✅ ${brands.length} marcas carregadas`)
    console.log('   Primeiras 5 marcas:')
    brands.slice(0, 5).forEach(brand => console.log(`   - ${brand.name}`))

    // 2. Simular seleção de marca (Honda)
    console.log('\n2️⃣ Simulando seleção da marca Honda...')
    const hondaBrand = brands.find(b => b.name === 'Honda')
    
    if (!hondaBrand) {
      console.log('❌ Marca Honda não encontrada!')
      return
    }

    console.log(`✅ Marca Honda selecionada: ${hondaBrand.name} (${hondaBrand.code})`)

    // 3. Simular carregamento de modelos (como a interface faz)
    console.log('\n3️⃣ Simulando carregamento de modelos...')
    
    // Buscar modelos da Honda (como a interface faz)
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

    console.log(`✅ ${models.length} modelos da Honda carregados`)
    models.forEach(model => console.log(`   - ${model.name}`))

    // 4. Simular seleção de modelo (Civic)
    console.log('\n4️⃣ Simulando seleção do modelo Civic...')
    const civicModel = models.find(m => m.name === 'Civic')
    
    if (!civicModel) {
      console.log('❌ Modelo Civic não encontrado!')
      return
    }

    console.log(`✅ Modelo Civic selecionado: ${civicModel.name} (${civicModel.code})`)

    // 5. Simular carregamento de anos (como a interface faz)
    console.log('\n5️⃣ Simulando carregamento de anos...')
    
    // Buscar anos do Civic (como a interface faz)
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

    console.log(`✅ ${years.length} anos do Civic carregados`)
    console.log('   Primeiros 10 anos:')
    years.slice(0, 10).forEach(year => console.log(`   - ${year.year}: ${year.name}`))

    // 6. Simular seleção de ano (2017)
    console.log('\n6️⃣ Simulando seleção do ano 2017...')
    const year2017 = years.find(y => y.year === 2017)
    
    if (!year2017) {
      console.log('❌ Ano 2017 não encontrado!')
      return
    }

    console.log(`✅ Ano 2017 selecionado: ${year2017.name}`)

    // 7. Simular carregamento de versões (como a interface faz)
    console.log('\n7️⃣ Simulando carregamento de versões...')
    
    // Buscar versões do Civic 2017 (como a interface faz)
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

    console.log(`✅ ${versions.length} versões do Civic 2017 carregadas`)
    versions.forEach(version => console.log(`   - ${version.name} (${version.fuel_type})`))

    // 8. Simular formatação para a interface
    console.log('\n8️⃣ Simulando formatação para a interface...')
    
    // Formatar marcas para a interface
    const formattedBrands = brands.map(brand => ({
      value: brand.name,
      label: brand.name
    }))
    console.log(`✅ ${formattedBrands.length} marcas formatadas para a interface`)

    // Formatar modelos para a interface
    const formattedModels = models.map(model => ({
      value: model.name,
      label: model.name
    }))
    console.log(`✅ ${formattedModels.length} modelos formatados para a interface`)

    // Formatar anos para a interface
    const formattedYears = years.map(year => ({
      value: year.year.toString(),
      label: year.year.toString()
    }))
    console.log(`✅ ${formattedYears.length} anos formatados para a interface`)

    // Formatar versões para a interface
    const formattedVersions = versions.map(version => ({
      value: version.name,
      label: version.name
    }))
    console.log(`✅ ${formattedVersions.length} versões formatadas para a interface`)

    console.log('\n🎉 Teste da interface concluído!')
    console.log('\n📋 Resumo final:')
    console.log(`   - Marcas: ${formattedBrands.length}`)
    console.log(`   - Modelos: ${formattedModels.length}`)
    console.log(`   - Anos: ${formattedYears.length}`)
    console.log(`   - Versões: ${formattedVersions.length}`)

    console.log('\n🔍 Se a interface não está funcionando, verifique:')
    console.log('   1. Se está chamando o serviço correto')
    console.log('   2. Se há erros no console do navegador')
    console.log('   3. Se o cache está funcionando')
    console.log('   4. Se há problemas de permissão')

  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
  }
}

testInterfaceStepByStep()
