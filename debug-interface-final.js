// Script para debugar a interface final
// Execute: node debug-interface-final.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugInterfaceFinal() {
  console.log('🔍 Debugando interface final...\n')

  try {
    // 1. Verificar dados no transbordo
    console.log('1️⃣ Verificando dados no transbordo...')
    
    const { data: transbordoData, error: transbordoError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, ano, codigo_fipe')
      .limit(10)

    if (transbordoError) {
      console.log('❌ Erro ao buscar dados do transbordo:', transbordoError.message)
      return
    }

    console.log(`✅ ${transbordoData.length} registros no transbordo`)
    console.log('   Primeiros 5 registros:')
    transbordoData.slice(0, 5).forEach(record => {
      console.log(`   - ${record.marca} ${record.modelo} ${record.ano} (${record.codigo_fipe})`)
    })

    // 2. Verificar dados nas tabelas organizadas
    console.log('\n2️⃣ Verificando dados nas tabelas organizadas...')
    
    const [brandsResult, modelsResult, yearsResult] = await Promise.all([
      supabase.from('ocar_fipe_brands').select('code, name').limit(5),
      supabase.from('ocar_fipe_models').select('brand_code, code, name').limit(5),
      supabase.from('ocar_fipe_years').select('brand_code, model_code, code, name, year').limit(5)
    ])

    console.log('✅ Marcas organizadas:')
    brandsResult.data.forEach(brand => {
      console.log(`   - ${brand.name} (${brand.code})`)
    })

    console.log('\n✅ Modelos organizados:')
    modelsResult.data.forEach(model => {
      console.log(`   - ${model.name} (${model.brand_code}/${model.code})`)
    })

    console.log('\n✅ Anos/Versões organizados:')
    yearsResult.data.forEach(year => {
      console.log(`   - ${year.name} (${year.year}) - ${year.brand_code}/${year.model_code}`)
    })

    // 3. Testar consulta específica (Honda Civic)
    console.log('\n3️⃣ Testando consulta específica (Honda Civic)...')
    
    const { data: hondaCivic, error: hondaError } = await supabase
      .from('ocar_fipe_years')
      .select('code, name, year')
      .eq('brand_code', '25') // Honda
      .eq('model_code', '1248') // Civic
      .order('year', { ascending: false })
      .limit(10)

    if (hondaError) {
      console.log('❌ Erro ao buscar Honda Civic:', hondaError.message)
    } else {
      console.log(`✅ ${hondaCivic.length} anos do Honda Civic encontrados:`)
      hondaCivic.forEach(year => {
        console.log(`   - ${year.year}: ${year.name} (${year.code})`)
      })
    }

    // 4. Verificar se há dados para 2017
    console.log('\n4️⃣ Verificando dados para 2017...')
    
    const { data: year2017, error: year2017Error } = await supabase
      .from('ocar_fipe_years')
      .select('code, name, year')
      .eq('brand_code', '25') // Honda
      .eq('model_code', '1248') // Civic
      .eq('year', 2017)

    if (year2017Error) {
      console.log('❌ Erro ao buscar ano 2017:', year2017Error.message)
    } else {
      console.log(`✅ ${year2017.length} versões do Honda Civic 2017 encontradas:`)
      year2017.forEach(version => {
        console.log(`   - ${version.name} (${version.code})`)
      })
    }

    console.log('\n🎉 Debug concluído!')
    console.log('\n📋 Se a interface não está funcionando, verifique:')
    console.log('   1. Se está chamando o serviço correto')
    console.log('   2. Se há erros no console do navegador')
    console.log('   3. Se o cache está funcionando')
    console.log('   4. Se há problemas de permissão')

  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
  }
}

debugInterfaceFinal()
