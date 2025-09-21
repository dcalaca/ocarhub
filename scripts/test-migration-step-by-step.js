import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testMigrationStepByStep() {
  console.log('🧪 Testando migração passo a passo...\n')

  try {
    // 1. Testar inserção de marcas
    console.log('1️⃣ Testando inserção de marcas...')
    const { data: brandsTest, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .insert({
        name: 'TESTE MARCA',
        code: 'teste-marca',
        active: true
      })
      .select()

    if (brandsError) {
      console.log('   ❌ Erro ao inserir marca:', brandsError.message)
    } else {
      console.log('   ✅ Marca inserida com sucesso')
      
      // Remover marca de teste
      await supabase
        .from('ocar_fipe_brands')
        .delete()
        .eq('code', 'teste-marca')
    }

    // 2. Testar inserção de modelos
    console.log('\n2️⃣ Testando inserção de modelos...')
    const { data: modelsTest, error: modelsError } = await supabase
      .from('ocar_fipe_models')
      .insert({
        brand_code: 'honda',
        name: 'TESTE MODELO',
        code: 'honda-teste-modelo',
        active: true
      })
      .select()

    if (modelsError) {
      console.log('   ❌ Erro ao inserir modelo:', modelsError.message)
    } else {
      console.log('   ✅ Modelo inserido com sucesso')
      
      // Remover modelo de teste
      await supabase
        .from('ocar_fipe_models')
        .delete()
        .eq('code', 'honda-teste-modelo')
    }

    // 3. Testar inserção de preços
    console.log('\n3️⃣ Testando inserção de preços...')
    const { data: pricesTest, error: pricesError } = await supabase
      .from('ocar_fipe_prices')
      .insert({
        model_id: '00000000-0000-0000-0000-000000000000', // UUID inválido para teste
        version: 'TESTE VERSÃO',
        year: 2024,
        fipe_code: 'TESTE123',
        reference_month: '2024-01',
        price: 1000.00
      })
      .select()

    if (pricesError) {
      console.log('   ❌ Erro ao inserir preço:', pricesError.message)
    } else {
      console.log('   ✅ Preço inserido com sucesso')
      
      // Remover preço de teste
      await supabase
        .from('ocar_fipe_prices')
        .delete()
        .eq('fipe_code', 'TESTE123')
    }

    // 4. Testar com dados reais (pequena amostra)
    console.log('\n4️⃣ Testando com dados reais...')
    
    // Buscar uma marca real
    const { data: realBrand, error: realBrandError } = await supabase
      .from('ocar_transbordo')
      .select('marca')
      .limit(1)
      .single()

    if (realBrandError) {
      console.log('   ❌ Erro ao buscar marca real:', realBrandError.message)
    } else {
      console.log(`   📋 Marca real encontrada: "${realBrand.marca}"`)
      
      // Testar inserção da marca real
      const brandCode = realBrand.marca.toLowerCase().replace(/\s+/g, '-').substring(0, 20)
      console.log(`   🔤 Código gerado: "${brandCode}" (length: ${brandCode.length})`)
      
      const { data: realBrandInsert, error: realBrandInsertError } = await supabase
        .from('ocar_fipe_brands')
        .insert({
          name: realBrand.marca,
          code: brandCode,
          active: true
        })
        .select()

      if (realBrandInsertError) {
        console.log('   ❌ Erro ao inserir marca real:', realBrandInsertError.message)
      } else {
        console.log('   ✅ Marca real inserida com sucesso')
        
        // Remover marca real de teste
        await supabase
          .from('ocar_fipe_brands')
          .delete()
          .eq('code', brandCode)
      }
    }

  } catch (error) {
    console.error('Erro ao testar migração:', error.message)
  }
}

testMigrationStepByStep()
