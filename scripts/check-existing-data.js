import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkExistingData() {
  console.log('🔍 Verificando dados existentes nas tabelas...\n')

  try {
    // Verificar contagem atual
    console.log('📊 Contagem atual das tabelas:')
    
    const { data: brandsCount, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .select('*', { count: 'exact', head: true })

    const { data: modelsCount, error: modelsError } = await supabase
      .from('ocar_fipe_models')
      .select('*', { count: 'exact', head: true })

    const { data: pricesCount, error: pricesError } = await supabase
      .from('ocar_fipe_prices')
      .select('*', { count: 'exact', head: true })

    console.log(`   ocar_fipe_brands: ${brandsCount?.length || 0} registros`)
    console.log(`   ocar_fipe_models: ${modelsCount?.length || 0} registros`)
    console.log(`   ocar_fipe_prices: ${pricesCount?.length || 0} registros`)

    // Verificar se há dados na ocar_transbordo
    const { data: transbordoCount, error: transbordoError } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true })

    console.log(`   ocar_transbordo: ${transbordoCount?.length || 0} registros`)

    // Verificar amostra de marcas existentes
    console.log('\n🏷️ Amostra de marcas existentes:')
    const { data: existingBrands, error: existingBrandsError } = await supabase
      .from('ocar_fipe_brands')
      .select('name, code')
      .limit(10)

    if (existingBrandsError) {
      console.log('   Erro:', existingBrandsError.message)
    } else {
      existingBrands.forEach((brand, index) => {
        console.log(`   ${index + 1}. "${brand.name}" → "${brand.code}"`)
      })
    }

    // Verificar se há marcas duplicadas
    console.log('\n🔍 Verificando marcas duplicadas:')
    const { data: duplicateBrands, error: duplicateError } = await supabase
      .from('ocar_fipe_brands')
      .select('code')
      .not('code', 'is', null)

    if (duplicateError) {
      console.log('   Erro:', duplicateError.message)
    } else {
      const codeCounts = {}
      duplicateBrands.forEach(brand => {
        codeCounts[brand.code] = (codeCounts[brand.code] || 0) + 1
      })
      
      const duplicates = Object.entries(codeCounts).filter(([code, count]) => count > 1)
      if (duplicates.length > 0) {
        console.log(`   Encontrados ${duplicates.length} códigos duplicados:`)
        duplicates.forEach(([code, count]) => {
          console.log(`   - "${code}": ${count} ocorrências`)
        })
      } else {
        console.log('   ✅ Nenhum código duplicado encontrado')
      }
    }

  } catch (error) {
    console.error('Erro ao verificar dados existentes:', error.message)
  }
}

checkExistingData()
