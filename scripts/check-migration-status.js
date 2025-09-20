import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase não encontradas.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkMigrationStatus() {
  console.log('🔍 Verificando status da migração...\n')

  try {
    // 1. Verificar contagem de registros
    console.log('📊 CONTAGEM DE REGISTROS:')
    
    const { data: transbordoCount, error: transbordoError } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true })

    const { data: brandsCount, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .select('*', { count: 'exact', head: true })

    const { data: modelsCount, error: modelsError } = await supabase
      .from('ocar_fipe_models')
      .select('*', { count: 'exact', head: true })

    const { data: pricesCount, error: pricesError } = await supabase
      .from('ocar_fipe_prices')
      .select('*', { count: 'exact', head: true })

    console.log(`   ocar_transbordo: ${transbordoCount?.length || 0} registros`)
    console.log(`   ocar_fipe_brands: ${brandsCount?.length || 0} registros`)
    console.log(`   ocar_fipe_models: ${modelsCount?.length || 0} registros`)
    console.log(`   ocar_fipe_prices: ${pricesCount?.length || 0} registros`)

    // 2. Verificar amostra de marcas
    console.log('\n🏷️ AMOSTRA DE MARCAS:')
    const { data: brandsSample, error: brandsSampleError } = await supabase
      .from('ocar_fipe_brands')
      .select('name, code')
      .limit(10)

    if (brandsSampleError) {
      console.error('   Erro ao buscar marcas:', brandsSampleError.message)
    } else {
      brandsSample.forEach((brand, index) => {
        console.log(`   ${index + 1}. ${brand.name} (code: ${brand.code})`)
      })
    }

    // 3. Verificar amostra de modelos
    console.log('\n🚗 AMOSTRA DE MODELOS:')
    const { data: modelsSample, error: modelsSampleError } = await supabase
      .from('ocar_fipe_models')
      .select('name, code, brand_code')
      .limit(10)

    if (modelsSampleError) {
      console.error('   Erro ao buscar modelos:', modelsSampleError.message)
    } else {
      modelsSample.forEach((model, index) => {
        console.log(`   ${index + 1}. ${model.name} (code: ${model.code}, brand: ${model.brand_code})`)
      })
    }

    // 4. Verificar amostra de preços
    console.log('\n💰 AMOSTRA DE PREÇOS:')
    const { data: pricesSample, error: pricesSampleError } = await supabase
      .from('ocar_fipe_prices')
      .select('version, year, fipe_code, reference_month, price')
      .limit(5)

    if (pricesSampleError) {
      console.error('   Erro ao buscar preços:', pricesSampleError.message)
    } else {
      pricesSample.forEach((price, index) => {
        console.log(`   ${index + 1}. ${price.version} ${price.year} - R$ ${price.price} (${price.reference_month})`)
      })
    }

    // 5. Verificar se há dados na ocar_transbordo
    console.log('\n📋 AMOSTRA DE ocar_transbordo:')
    const { data: transbordoSample, error: transbordoSampleError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, ano, codigo_fipe, referencia_mes, preco')
      .limit(5)

    if (transbordoSampleError) {
      console.error('   Erro ao buscar ocar_transbordo:', transbordoSampleError.message)
    } else {
      transbordoSample.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.marca} ${row.modelo} ${row.ano} - R$ ${row.preco}`)
      })
    }

    // 6. Status da migração
    console.log('\n✅ STATUS DA MIGRAÇÃO:')
    if (brandsCount?.length > 0) {
      console.log('   ✅ Marcas migradas com sucesso')
    } else {
      console.log('   ❌ Nenhuma marca migrada')
    }

    if (modelsCount?.length > 0) {
      console.log('   ✅ Modelos migrados com sucesso')
    } else {
      console.log('   ❌ Nenhum modelo migrado')
    }

    if (pricesCount?.length > 0) {
      console.log('   ✅ Preços migrados com sucesso')
    } else {
      console.log('   ❌ Nenhum preço migrado')
    }

  } catch (error) {
    console.error('Erro ao verificar status da migração:', error.message)
  }
}

checkMigrationStatus()
