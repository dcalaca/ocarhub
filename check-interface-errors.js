// Script para verificar erros na interface
// Execute: node check-interface-errors.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Verificar se há problemas específicos na interface
async function checkInterfaceErrors() {
  console.log('🔍 Verificando erros na interface...\n')

  try {
    // 1. Verificar se as variáveis de ambiente estão corretas
    console.log('1️⃣ Verificando variáveis de ambiente...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl) {
      console.log('❌ NEXT_PUBLIC_SUPABASE_URL não encontrada!')
      return
    }
    
    if (!supabaseKey) {
      console.log('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada!')
      return
    }
    
    console.log('✅ Variáveis de ambiente OK')
    console.log(`   URL: ${supabaseUrl}`)
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...`)

    // 2. Verificar se o Supabase está acessível
    console.log('\n2️⃣ Verificando conexão com Supabase...')
    
    const { data, error } = await supabase
      .from('ocar_fipe_brands')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Erro de conexão com Supabase:', error.message)
      return
    }
    
    console.log('✅ Conexão com Supabase OK')

    // 3. Verificar se as tabelas têm dados
    console.log('\n3️⃣ Verificando dados nas tabelas...')
    
    const tables = [
      { name: 'ocar_fipe_brands', description: 'Marcas' },
      { name: 'ocar_fipe_models', description: 'Modelos' },
      { name: 'ocar_fipe_years', description: 'Anos/Versões' }
    ]
    
    for (const table of tables) {
      const { data, error, count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table.description}: ERRO - ${error.message}`)
      } else {
        console.log(`✅ ${table.description}: ${count} registros`)
      }
    }

    // 4. Verificar se há dados específicos que a interface precisa
    console.log('\n4️⃣ Verificando dados específicos...')
    
    // Verificar Honda
    const { data: honda, error: hondaError } = await supabase
      .from('ocar_fipe_brands')
      .select('code, name')
      .eq('name', 'Honda')
      .single()

    if (hondaError || !honda) {
      console.log('❌ Honda não encontrada!')
      return
    }
    console.log(`✅ Honda: ${honda.name} (${honda.code})`)

    // Verificar Civic
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
    console.log(`✅ Civic: ${civic.name} (${civic.code})`)

    // Verificar 2017
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
    console.log(`✅ Ano 2017: ${year2017[0].name}`)

    // 5. Verificar se há problemas de permissão
    console.log('\n5️⃣ Verificando permissões...')
    
    // Testar como usuário anônimo (como a interface faz)
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

    // 6. Verificar se há problemas de formatação
    console.log('\n6️⃣ Verificando formatação dos dados...')
    
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

    console.log('\n🎉 Verificação concluída!')
    console.log('\n📋 Se tudo está OK, o problema pode estar em:')
    console.log('   1. Interface não está chamando o serviço correto')
    console.log('   2. Cache está retornando dados antigos')
    console.log('   3. Erro de JavaScript na interface')
    console.log('   4. Problema de permissão RLS')

  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
  }
}

checkInterfaceErrors()