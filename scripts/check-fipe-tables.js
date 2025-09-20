// Script para verificar se as tabelas FIPE existem e estão funcionando
// Execute: node scripts/check-fipe-tables.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!')
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

class FipeChecker {
  async checkTables() {
    console.log('🔍 Verificando tabelas FIPE...\n')

    const tables = [
      'ocar_fipe_brands',
      'ocar_fipe_models', 
      'ocar_fipe_years',
      'ocar_fipe_prices'
    ]

    for (const tableName of tables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.log(`❌ ${tableName}: ERRO - ${error.message}`)
        } else {
          console.log(`✅ ${tableName}: OK (${count} registros)`)
        }
      } catch (error) {
        console.log(`❌ ${tableName}: ERRO - ${error.message}`)
      }
    }
  }

  async checkData() {
    console.log('\n📊 Verificando dados...\n')

    try {
      // Verificar marcas
      const { data: brands, error: brandsError } = await supabase
        .from('ocar_fipe_brands')
        .select('code, name')
        .limit(5)

      if (brandsError) {
        console.log('❌ Erro ao buscar marcas:', brandsError.message)
      } else {
        console.log('✅ Marcas encontradas:')
        brands.forEach(brand => console.log(`  - ${brand.code}: ${brand.name}`))
      }

      // Verificar modelos
      const { data: models, error: modelsError } = await supabase
        .from('ocar_fipe_models')
        .select('brand_code, code, name')
        .limit(5)

      if (modelsError) {
        console.log('❌ Erro ao buscar modelos:', modelsError.message)
      } else {
        console.log('\n✅ Modelos encontrados:')
        models.forEach(model => console.log(`  - ${model.brand_code}/${model.code}: ${model.name}`))
      }

      // Verificar anos
      const { data: years, error: yearsError } = await supabase
        .from('ocar_fipe_years')
        .select('brand_code, model_code, code, name, year')
        .limit(5)

      if (yearsError) {
        console.log('❌ Erro ao buscar anos:', yearsError.message)
      } else {
        console.log('\n✅ Anos/Versões encontrados:')
        years.forEach(year => console.log(`  - ${year.brand_code}/${year.model_code}/${year.code}: ${year.name} (${year.year})`))
      }

    } catch (error) {
      console.log('❌ Erro ao verificar dados:', error.message)
    }
  }

  async checkIndexes() {
    console.log('\n🔍 Verificando índices...\n')

    try {
      const { data, error } = await supabase
        .rpc('get_table_indexes', { table_name: 'ocar_fipe_brands' })

      if (error) {
        console.log('⚠️  Não foi possível verificar índices (função não existe)')
      } else {
        console.log('✅ Índices verificados')
      }
    } catch (error) {
      console.log('⚠️  Não foi possível verificar índices')
    }
  }

  async checkRLS() {
    console.log('\n🔒 Verificando RLS...\n')

    const tables = [
      'ocar_fipe_brands',
      'ocar_fipe_models', 
      'ocar_fipe_years',
      'ocar_fipe_prices'
    ]

    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('table_name, is_insertable_into')
          .eq('table_name', tableName)
          .eq('table_schema', 'public')

        if (error) {
          console.log(`❌ ${tableName}: Erro ao verificar RLS`)
        } else {
          console.log(`✅ ${tableName}: RLS configurado`)
        }
      } catch (error) {
        console.log(`❌ ${tableName}: Erro ao verificar RLS`)
      }
    }
  }

  async runAllChecks() {
    console.log('🚀 Iniciando verificação das tabelas FIPE...\n')

    await this.checkTables()
    await this.checkData()
    await this.checkIndexes()
    await this.checkRLS()

    console.log('\n✅ Verificação concluída!')
  }
}

// Executar verificação
async function main() {
  const checker = new FipeChecker()
  
  try {
    await checker.runAllChecks()
  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
    process.exit(1)
  }
}

main()
