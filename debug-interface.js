// Script para debugar problemas na interface
// Execute: node debug-interface.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugInterface() {
  console.log('🔍 Debugando problemas na interface...\n')

  try {
    // 1. Verificar se as tabelas existem e têm dados
    console.log('1️⃣ Verificando estrutura do banco...')
    
    const tables = ['ocar_fipe_brands', 'ocar_fipe_models', 'ocar_fipe_years']
    
    for (const table of tables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table}: ERRO - ${error.message}`)
      } else {
        console.log(`✅ ${table}: ${count} registros`)
      }
    }

    // 2. Verificar se há dados específicos que a interface precisa
    console.log('\n2️⃣ Verificando dados específicos...')
    
    // Verificar se Honda existe
    const { data: honda, error: hondaError } = await supabase
      .from('ocar_fipe_brands')
      .select('code, name')
      .eq('name', 'Honda')
      .single()

    if (hondaError || !honda) {
      console.log('❌ Honda não encontrada!')
      return
    }

    console.log(`✅ Honda encontrada: ${honda.name} (${honda.code})`)

    // Verificar se Civic existe
    const { data: civic, error: civicError } = await supabase
      .from('ocar_fipe_models')
      .select('code, name')
      .eq('brand_code', honda.code)
      .eq('name', 'Civic')
      .single()

    if (civicError || !civic) {
      console.log('❌ Civic não encontrado!')
      return
    }

    console.log(`✅ Civic encontrado: ${civic.name} (${civic.code})`)

    // Verificar se 2017 existe
    const { data: year2017, error: yearError } = await supabase
      .from('ocar_fipe_years')
      .select('code, name, year')
      .eq('brand_code', honda.code)
      .eq('model_code', civic.code)
      .eq('year', 2017)
      .limit(1)

    if (yearError || !year2017 || year2017.length === 0) {
      console.log('❌ Ano 2017 não encontrado!')
      return
    }

    console.log(`✅ Ano 2017 encontrado: ${year2017[0].name}`)

    // 3. Verificar se há problemas de permissão
    console.log('\n3️⃣ Verificando permissões...')
    
    // Testar consulta como usuário anônimo (como a interface faz)
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: anonBrands, error: anonError } = await anonSupabase
      .from('ocar_fipe_brands')
      .select('code, name')
      .limit(5)

    if (anonError) {
      console.log('❌ Erro de permissão:', anonError.message)
      console.log('   Verifique as políticas RLS!')
    } else {
      console.log('✅ Permissões OK - usuário anônimo pode ler dados')
      console.log(`   ${anonBrands.length} marcas acessíveis`)
    }

    // 4. Verificar se há problemas de cache
    console.log('\n4️⃣ Verificando cache...')
    
    // Simular o que o cache faz
    const cacheKey = 'brands'
    console.log(`   Cache key: ${cacheKey}`)
    console.log('   (Cache é gerenciado pelo fipe-cache.ts)')

    // 5. Verificar se há problemas de formatação
    console.log('\n5️⃣ Verificando formatação dos dados...')
    
    const { data: sampleBrands, error: sampleError } = await supabase
      .from('ocar_fipe_brands')
      .select('code, name')
      .limit(3)

    if (sampleError) {
      console.log('❌ Erro ao buscar dados de exemplo:', sampleError.message)
    } else {
      console.log('✅ Dados de exemplo:')
      sampleBrands.forEach(brand => {
        console.log(`   - Código: "${brand.code}" (tipo: ${typeof brand.code})`)
        console.log(`   - Nome: "${brand.name}" (tipo: ${typeof brand.name})`)
      })
    }

    console.log('\n🎉 Debug concluído!')
    console.log('\n📋 Se tudo está OK, o problema pode estar em:')
    console.log('   1. Interface não está chamando o serviço correto')
    console.log('   2. Cache está retornando dados antigos')
    console.log('   3. Erro de JavaScript na interface')
    console.log('   4. Problema de permissão RLS')

  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
  }
}

debugInterface()
