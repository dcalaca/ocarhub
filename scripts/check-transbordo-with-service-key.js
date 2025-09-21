import { createClient } from '@supabase/supabase-js'

// Usar service role key para bypass do RLS
const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTransbordoWithServiceKey() {
  console.log('🔍 Verificando ocar_transbordo com service key...\n')

  try {
    // Verificar contagem
    const { data: count, error: countError } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log('❌ Erro ao verificar contagem:', countError.message)
    } else {
      console.log(`📊 ocar_transbordo: ${count?.length || 0} registros`)
    }

    // Verificar amostra de dados
    const { data: sample, error: sampleError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, ano, codigo_fipe, referencia_mes, preco, processado')
      .limit(10)

    if (sampleError) {
      console.log('❌ Erro ao verificar amostra:', sampleError.message)
    } else {
      console.log(`\n📋 Amostra de dados:`)
      sample.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.marca} ${row.modelo} ${row.ano} - R$ ${row.preco} (processado: ${row.processado})`)
      })
    }

    // Verificar se há dados processados
    const { data: processed, error: processedError } = await supabase
      .from('ocar_transbordo')
      .select('processado')
      .eq('processado', true)
      .limit(1)

    if (processedError) {
      console.log('❌ Erro ao verificar processados:', processedError.message)
    } else {
      console.log(`\n🔄 Registros processados: ${processed?.length || 0}`)
    }

    // Verificar se há dados não processados
    const { data: unprocessed, error: unprocessedError } = await supabase
      .from('ocar_transbordo')
      .select('processado')
      .eq('processado', false)
      .limit(1)

    if (unprocessedError) {
      console.log('❌ Erro ao verificar não processados:', unprocessedError.message)
    } else {
      console.log(`🔄 Registros não processados: ${unprocessed?.length || 0}`)
    }

    // Verificar marcas únicas
    const { data: brands, error: brandsError } = await supabase
      .from('ocar_transbordo')
      .select('marca')
      .eq('processado', false)
      .limit(20)

    if (brandsError) {
      console.log('❌ Erro ao verificar marcas:', brandsError.message)
    } else {
      const uniqueBrands = [...new Set(brands.map(b => b.marca))]
      console.log(`\n🏷️ Marcas únicas (não processadas): ${uniqueBrands.length}`)
      uniqueBrands.slice(0, 10).forEach((brand, index) => {
        const code = brand.toLowerCase().replace(/\s+/g, '-').substring(0, 10)
        console.log(`   ${index + 1}. "${brand}" → "${code}"`)
      })
    }

  } catch (error) {
    console.error('Erro ao verificar dados:', error.message)
  }
}

checkTransbordoWithServiceKey()
