import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkModelsTableStructure() {
  console.log('🔍 Verificando estrutura da tabela ocar_fipe_models...\n')

  try {
    // Verificar estrutura da tabela
    console.log('📋 Estrutura da tabela ocar_fipe_models:')
    const { data: structure, error: structureError } = await supabase
      .from('ocar_fipe_models')
      .select('*')
      .limit(1)

    if (structureError) {
      console.log('   Erro:', structureError.message)
    } else {
      console.log('   Colunas encontradas:', Object.keys(structure[0] || {}))
    }

    // Verificar dados existentes
    console.log('\n📊 Dados existentes na ocar_fipe_models:')
    const { data: existingData, error: existingError } = await supabase
      .from('ocar_fipe_models')
      .select('brand_code, name, code')
      .limit(10)

    if (existingError) {
      console.log('   Erro:', existingError.message)
    } else {
      existingData.forEach((row, index) => {
        console.log(`   ${index + 1}. brand_code: "${row.brand_code}" (${row.brand_code.length})`)
        console.log(`      name: "${row.name}" (${row.name.length})`)
        console.log(`      code: "${row.code}" (${row.code.length})`)
        console.log('   ---')
      })
    }

    // Verificar dados existentes na ocar_fipe_brands
    console.log('\n🏷️ Dados existentes na ocar_fipe_brands:')
    const { data: brandsData, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .select('name, code')
      .limit(10)

    if (brandsError) {
      console.log('   Erro:', brandsError.message)
    } else {
      brandsData.forEach((row, index) => {
        console.log(`   ${index + 1}. name: "${row.name}" (${row.name.length})`)
        console.log(`      code: "${row.code}" (${row.code.length})`)
        console.log('   ---')
      })
    }

  } catch (error) {
    console.error('Erro ao verificar estrutura:', error.message)
  }
}

checkModelsTableStructure()
