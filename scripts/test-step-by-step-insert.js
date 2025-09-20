import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testStepByStepInsert() {
  console.log('🧪 Testando inserção passo a passo...\n')

  try {
    // 1. Testar inserção de uma marca
    console.log('1️⃣ Testando inserção de marca...')
    const { data: brandData, error: brandError } = await supabase
      .from('ocar_fipe_brands')
      .insert({
        name: 'TESTE MARCA',
        code: 'teste-marca',
        active: true
      })
      .select()

    if (brandError) {
      console.log('   ❌ Erro ao inserir marca:', brandError.message)
      return
    } else {
      console.log('   ✅ Marca inserida com sucesso')
    }

    // 2. Testar inserção de um modelo
    console.log('\n2️⃣ Testando inserção de modelo...')
    const { data: modelData, error: modelError } = await supabase
      .from('ocar_fipe_models')
      .insert({
        brand_code: 'teste-marca',
        name: 'TESTE MODELO',
        code: 'teste-marca-teste-modelo',
        active: true
      })
      .select()

    if (modelError) {
      console.log('   ❌ Erro ao inserir modelo:', modelError.message)
      return
    } else {
      console.log('   ✅ Modelo inserido com sucesso')
    }

    // 3. Testar inserção de preço com dados reais
    console.log('\n3️⃣ Testando inserção de preço com dados reais...')
    
    // Buscar um registro real da ocar_transbordo
    const { data: realData, error: realError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, ano, codigo_fipe, referencia_mes, preco')
      .limit(1)
      .single()

    if (realError) {
      console.log('   ❌ Erro ao buscar dados reais:', realError.message)
      return
    }

    console.log(`   📋 Dados reais encontrados:`)
    console.log(`   Marca: "${realData.marca}" (${realData.marca.length})`)
    console.log(`   Modelo: "${realData.modelo}" (${realData.modelo.length})`)
    console.log(`   Ano: ${realData.ano}`)
    console.log(`   Código FIPE: "${realData.codigo_fipe}" (${realData.codigo_fipe.length})`)
    console.log(`   Referência: "${realData.referencia_mes}" (${realData.referencia_mes.length})`)
    console.log(`   Preço: ${realData.preco}`)

    // Testar inserção de preço com dados reais
    const { data: priceData, error: priceError } = await supabase
      .from('ocar_fipe_prices')
      .insert({
        model_id: modelData[0].id,
        version: realData.modelo,
        year: realData.ano,
        fipe_code: realData.codigo_fipe,
        reference_month: realData.referencia_mes,
        price: realData.preco
      })
      .select()

    if (priceError) {
      console.log('   ❌ Erro ao inserir preço:', priceError.message)
      console.log('   Detalhes do erro:', priceError.details)
      console.log('   Código do erro:', priceError.code)
    } else {
      console.log('   ✅ Preço inserido com sucesso')
    }

    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...')
    await supabase.from('ocar_fipe_prices').delete().eq('model_id', modelData[0].id)
    await supabase.from('ocar_fipe_models').delete().eq('id', modelData[0].id)
    await supabase.from('ocar_fipe_brands').delete().eq('id', brandData[0].id)
    console.log('   ✅ Dados de teste removidos')

  } catch (error) {
    console.error('Erro ao testar inserção:', error.message)
  }
}

testStepByStepInsert()
