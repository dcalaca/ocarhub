import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura das tabelas...\n')

  try {
    // Verificar estrutura da ocar_fipe_prices
    console.log('📋 ESTRUTURA DA ocar_fipe_prices:')
    const { data: pricesStructure, error: pricesError } = await supabase
      .from('ocar_fipe_prices')
      .select('*')
      .limit(1)

    if (pricesError) {
      console.log('   Erro:', pricesError.message)
    } else {
      console.log('   Colunas encontradas:', Object.keys(pricesStructure[0] || {}))
    }

    // Verificar estrutura da ocar_fipe_brands
    console.log('\n🏷️ ESTRUTURA DA ocar_fipe_brands:')
    const { data: brandsStructure, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .select('*')
      .limit(1)

    if (brandsError) {
      console.log('   Erro:', brandsError.message)
    } else {
      console.log('   Colunas encontradas:', Object.keys(brandsStructure[0] || {}))
    }

    // Verificar estrutura da ocar_fipe_models
    console.log('\n🚗 ESTRUTURA DA ocar_fipe_models:')
    const { data: modelsStructure, error: modelsError } = await supabase
      .from('ocar_fipe_models')
      .select('*')
      .limit(1)

    if (modelsError) {
      console.log('   Erro:', modelsError.message)
    } else {
      console.log('   Colunas encontradas:', Object.keys(modelsStructure[0] || {}))
    }

    // Verificar estrutura da ocar_transbordo
    console.log('\n📊 ESTRUTURA DA ocar_transbordo:')
    const { data: transbordoStructure, error: transbordoError } = await supabase
      .from('ocar_transbordo')
      .select('*')
      .limit(1)

    if (transbordoError) {
      console.log('   Erro:', transbordoError.message)
    } else {
      console.log('   Colunas encontradas:', Object.keys(transbordoStructure[0] || {}))
    }

  } catch (error) {
    console.error('Erro ao verificar estrutura das tabelas:', error.message)
  }
}

checkTableStructure()
