// Script para processar dados de transbordo de forma simples
// Execute: node scripts/process-transbordo-simple.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class TransbordoProcessor {
  constructor() {
    this.stats = {
      brands: 0,
      models: 0,
      years: 0,
      processed: 0,
      errors: []
    }
  }

  async processTransbordo() {
    console.log('🔄 Processando dados de transbordo...\n')

    try {
      // 1. Buscar dados não processados
      console.log('1️⃣ Buscando dados não processados...')
      const { data: transbordoData, error: transbordoError } = await supabase
        .from('ocar_transbordo')
        .select('*')
        .eq('processado', false)
        .limit(100) // Processar apenas 100 por vez

      if (transbordoError) {
        console.log('❌ Erro ao buscar dados:', transbordoError.message)
        return
      }

      console.log(`✅ ${transbordoData.length} registros para processar`)

      if (transbordoData.length === 0) {
        console.log('✅ Nenhum dado para processar')
        return
      }

      // 2. Processar marcas
      console.log('\n2️⃣ Processando marcas...')
      const uniqueBrands = [...new Set(transbordoData.map(item => item.marca))]
      
      for (const brandName of uniqueBrands) {
        try {
          const { error } = await supabase
            .from('ocar_fipe_brands')
            .upsert({
              code: brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              name: brandName,
              active: true
            }, { onConflict: 'name' })

          if (error) {
            console.log(`❌ Erro ao inserir marca ${brandName}:`, error.message)
            this.stats.errors.push(`Marca ${brandName}: ${error.message}`)
          } else {
            this.stats.brands++
            console.log(`✅ Marca ${brandName} processada`)
          }
        } catch (error) {
          console.log(`❌ Erro ao processar marca ${brandName}:`, error.message)
          this.stats.errors.push(`Marca ${brandName}: ${error.message}`)
        }
      }

      // 3. Processar modelos
      console.log('\n3️⃣ Processando modelos...')
      const uniqueModels = [...new Set(transbordoData.map(item => `${item.marca}|${item.modelo}`))]
      
      for (const modelKey of uniqueModels) {
        const [marca, modelo] = modelKey.split('|')
        
        try {
          // Buscar código da marca
          const { data: brandData } = await supabase
            .from('ocar_fipe_brands')
            .select('code')
            .eq('name', marca)
            .single()

          if (!brandData) {
            console.log(`⚠️  Marca ${marca} não encontrada, pulando modelo ${modelo}`)
            continue
          }

          const { error } = await supabase
            .from('ocar_fipe_models')
            .upsert({
              brand_code: brandData.code,
              code: modelo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              name: modelo,
              active: true
            }, { onConflict: 'brand_code,name' })

          if (error) {
            console.log(`❌ Erro ao inserir modelo ${modelo}:`, error.message)
            this.stats.errors.push(`Modelo ${modelo}: ${error.message}`)
          } else {
            this.stats.models++
            console.log(`✅ Modelo ${modelo} processado`)
          }
        } catch (error) {
          console.log(`❌ Erro ao processar modelo ${modelo}:`, error.message)
          this.stats.errors.push(`Modelo ${modelo}: ${error.message}`)
        }
      }

      // 4. Processar anos/versões
      console.log('\n4️⃣ Processando anos/versões...')
      
      for (const item of transbordoData) {
        try {
          // Buscar códigos da marca e modelo
          const { data: brandData } = await supabase
            .from('ocar_fipe_brands')
            .select('code')
            .eq('name', item.marca)
            .single()

          const { data: modelData } = await supabase
            .from('ocar_fipe_models')
            .select('code')
            .eq('brand_code', brandData?.code)
            .eq('name', item.modelo)
            .single()

          if (!brandData || !modelData) {
            console.log(`⚠️  Dados não encontrados para ${item.marca} ${item.modelo}, pulando`)
            continue
          }

          const { error } = await supabase
            .from('ocar_fipe_years')
            .upsert({
              brand_code: brandData.code,
              model_code: modelData.code,
              code: item.codigo_fipe,
              name: `${item.ano} - ${item.modelo}`,
              year: item.ano,
              fuel_type: 'Gasolina', // Default
              active: true
            }, { onConflict: 'brand_code,model_code,code' })

          if (error) {
            console.log(`❌ Erro ao inserir ano ${item.ano}:`, error.message)
            this.stats.errors.push(`Ano ${item.ano}: ${error.message}`)
          } else {
            this.stats.years++
            console.log(`✅ Ano ${item.ano} processado`)
          }

          // Marcar como processado
          await supabase
            .from('ocar_transbordo')
            .update({ processado: true })
            .eq('id', item.id)

          this.stats.processed++

        } catch (error) {
          console.log(`❌ Erro ao processar item ${item.id}:`, error.message)
          this.stats.errors.push(`Item ${item.id}: ${error.message}`)
        }
      }

      console.log('\n🎉 Processamento concluído!')
      this.printStats()

    } catch (error) {
      console.error('❌ Erro fatal:', error.message)
    }
  }

  async verifyData() {
    console.log('\n🔍 Verificando dados processados...')

    try {
      const [transbordoResult, brandsResult, modelsResult, yearsResult] = await Promise.all([
        supabase.from('ocar_transbordo').select('*', { count: 'exact', head: true }),
        supabase.from('ocar_fipe_brands').select('*', { count: 'exact', head: true }),
        supabase.from('ocar_fipe_models').select('*', { count: 'exact', head: true }),
        supabase.from('ocar_fipe_years').select('*', { count: 'exact', head: true })
      ])

      console.log('📊 Dados no banco:')
      console.log(`  - Transbordo: ${transbordoResult.count}`)
      console.log(`  - Marcas: ${brandsResult.count}`)
      console.log(`  - Modelos: ${modelsResult.count}`)
      console.log(`  - Anos/Versões: ${yearsResult.count}`)

    } catch (error) {
      console.error('❌ Erro ao verificar dados:', error.message)
    }
  }

  printStats() {
    console.log('\n📊 RELATÓRIO FINAL:')
    console.log(`  - Marcas processadas: ${this.stats.brands}`)
    console.log(`  - Modelos processados: ${this.stats.models}`)
    console.log(`  - Anos processados: ${this.stats.years}`)
    console.log(`  - Registros processados: ${this.stats.processed}`)
    console.log(`  - Erros: ${this.stats.errors.length}`)

    if (this.stats.errors.length > 0) {
      console.log('\n⚠️  ERROS ENCONTRADOS:')
      this.stats.errors.slice(0, 5).forEach(error => console.log(`  - ${error}`))
      if (this.stats.errors.length > 5) {
        console.log(`  ... e mais ${this.stats.errors.length - 5} erros`)
      }
    }
  }

  async run() {
    console.log('🚀 Iniciando processamento de dados de transbordo...\n')

    try {
      await this.processTransbordo()
      await this.verifyData()
    } catch (error) {
      console.error('❌ Erro fatal:', error.message)
      process.exit(1)
    }
  }
}

// Executar script
async function main() {
  const processor = new TransbordoProcessor()
  await processor.run()
}

main()
