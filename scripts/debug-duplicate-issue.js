import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugDuplicateIssue() {
  console.log('🔍 Debugando problema de duplicatas...\n')

  try {
    // 1. Verificar se ocar_transbordo tem dados
    console.log('📊 Verificando ocar_transbordo:')
    const { data: transbordoCount, error: transbordoError } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true })

    if (transbordoError) {
      console.log('   ❌ Erro:', transbordoError.message)
    } else {
      console.log(`   ✅ ocar_transbordo: ${transbordoCount?.length || 0} registros`)
    }

    // 2. Verificar dados existentes nas tabelas normalizadas
    console.log('\n📋 Verificando tabelas normalizadas:')
    
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

    // 3. Verificar amostra de marcas na ocar_transbordo
    console.log('\n🏷️ Amostra de marcas na ocar_transbordo:')
    const { data: transbordoBrands, error: transbordoBrandsError } = await supabase
      .from('ocar_transbordo')
      .select('marca')
      .limit(10)

    if (transbordoBrandsError) {
      console.log('   ❌ Erro:', transbordoBrandsError.message)
    } else {
      transbordoBrands.forEach((row, index) => {
        const code = row.marca.toLowerCase().replace(/\s+/g, '-').substring(0, 10)
        console.log(`   ${index + 1}. "${row.marca}" → "${code}"`)
      })
    }

    // 4. Verificar se há marcas duplicadas na ocar_transbordo
    console.log('\n🔍 Verificando marcas duplicadas na ocar_transbordo:')
    const { data: allBrands, error: allBrandsError } = await supabase
      .from('ocar_transbordo')
      .select('marca')

    if (allBrandsError) {
      console.log('   ❌ Erro:', allBrandsError.message)
    } else {
      const brandCounts = {}
      allBrands.forEach(row => {
        const code = row.marca.toLowerCase().replace(/\s+/g, '-').substring(0, 10)
        brandCounts[code] = (brandCounts[code] || 0) + 1
      })
      
      const duplicates = Object.entries(brandCounts).filter(([code, count]) => count > 1)
      if (duplicates.length > 0) {
        console.log(`   ⚠️ Encontrados ${duplicates.length} códigos que gerariam duplicatas:`)
        duplicates.slice(0, 10).forEach(([code, count]) => {
          console.log(`   - "${code}": ${count} ocorrências`)
        })
      } else {
        console.log('   ✅ Nenhuma duplicata encontrada')
      }
    }

    // 5. Verificar se há dados na ocar_fipe_brands
    console.log('\n🏷️ Verificando dados existentes na ocar_fipe_brands:')
    const { data: existingBrands, error: existingBrandsError } = await supabase
      .from('ocar_fipe_brands')
      .select('name, code')
      .limit(10)

    if (existingBrandsError) {
      console.log('   ❌ Erro:', existingBrandsError.message)
    } else {
      console.log(`   Encontrados ${existingBrands.length} registros:`)
      existingBrands.forEach((brand, index) => {
        console.log(`   ${index + 1}. "${brand.name}" → "${brand.code}"`)
      })
    }

  } catch (error) {
    console.error('Erro ao debugar duplicatas:', error.message)
  }
}

debugDuplicateIssue()
