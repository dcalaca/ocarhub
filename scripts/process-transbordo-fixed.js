// Script corrigido para processar dados de transbordo
// Execute: node scripts/process-transbordo-fixed.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class TransbordoProcessorFixed {
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
    console.log('🔄 Processando dados de transbordo (versão corrigida)...\n')

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

      // 2. Processar marcas (usando INSERT simples)
      console.log('\n2️⃣ Processando marcas...')
      const uniqueBrands = [...new Set(transbordoData.map(item => item.marca))]
      
      for (const brandName of uniqueBrands) {
        try {
          // Verificar se já existe
          const { data: existingBrand } = await supabase
            .from('ocar_fipe_brands')
            .select('id')
            .eq('name', brandName)
            .single()

          if (existingBrand) {
            console.log(`✅ Marca ${brandName} já existe`)
            this.stats.brands++
            continue
          }

          // Inserir nova marca
          const { error } = await supabase
            .from('ocar_fipe_brands')
            .insert({
              code: brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              name: brandName,
              active: true
            })

          if (error) {
            console.log(`❌ Erro ao inserir marca ${brandName}:`, error.message)
            this.stats.errors.push(`Marca ${brandName}: ${error.message}`)
          } else {
            this.stats.brands++
            console.log(`✅ Marca ${brandName} inserida`)
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

          // Verificar se modelo já existe
          const { data: existingModel } = await supabase
            .from('ocar_fipe_models')
            .select('id')
            .eq('brand_code', brandData.code)
            .eq('name', modelo)
            .single()

          if (existingModel) {
            console.log(`✅ Modelo ${modelo} já existe`)
            this.stats.models++
            continue
          }

          // Inserir novo modelo
          const { error } = await supabase
            .from('ocar_fipe_models')
            .insert({
              brand_code: brandData.code,
              code: modelo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              name: modelo,
              active: true
            })

          if (error) {
            console.log(`❌ Erro ao inserir modelo ${modelo}:`, error.message)
            this.stats.errors.push(`Modelo ${modelo}: ${error.message}`)
          } else {
            this.stats.models++
            console.log(`✅ Modelo ${modelo} inserido`)
          }
        } catch (error) {
          console.log(`❌ Erro ao processar modelo ${modelo}:`, error.message)
          this.stats.errors.push(`Modelo ${modelo}: ${error.message}`)
        }
      }

      // 4. Processar anos/versões
      console.log('\n4️⃣ Processando anos/versões...')
      const uniqueYears = [...new Set(transbordoData.map(item => `${item.marca}|${item.modelo}|${item.ano}`))]
      
      for (const yearKey of uniqueYears) {
        const [marca, modelo, ano] = yearKey.split('|')
        
        try {
          // Buscar dados da marca e modelo
          const { data: brandData } = await supabase
            .from('ocar_fipe_brands')
            .select('code')
            .eq('name', marca)
            .single()

          const { data: modelData } = await supabase
            .from('ocar_fipe_models')
            .select('code')
            .eq('brand_code', brandData?.code)
            .eq('name', modelo)
            .single()

          if (!brandData || !modelData) {
            console.log(`⚠️  Dados não encontrados para ${marca} ${modelo}, pulando`)
            continue
          }

          // Verificar se ano já existe
          const { data: existingYear } = await supabase
            .from('ocar_fipe_years')
            .select('id')
            .eq('brand_code', brandData.code)
            .eq('model_code', modelData.code)
            .eq('year', parseInt(ano))
            .single()

          if (existingYear) {
            console.log(`✅ Ano ${ano} para ${modelo} já existe`)
            this.stats.years++
            continue
          }

          // Inserir novo ano
          const { error } = await supabase
            .from('ocar_fipe_years')
            .insert({
              brand_code: brandData.code,
              model_code: modelData.code,
              year: parseInt(ano),
              version_name: modelo, // Usar o nome completo do modelo como versão
              active: true
            })

          if (error) {
            console.log(`❌ Erro ao inserir ano ${ano} para ${modelo}:`, error.message)
            this.stats.errors.push(`Ano ${ano} para ${modelo}: ${error.message}`)
          } else {
            this.stats.years++
            console.log(`✅ Ano ${ano} para ${modelo} inserido`)
          }
        } catch (error) {
          console.log(`❌ Erro ao processar ano ${ano} para ${modelo}:`, error.message)
          this.stats.errors.push(`Ano ${ano} para ${modelo}: ${error.message}`)
        }
      }

      // 5. Marcar como processado
      console.log('\n5️⃣ Marcando como processado...')
      const { error: updateError } = await supabase
        .from('ocar_transbordo')
        .update({ processado: true })
        .eq('processado', false)

      if (updateError) {
        console.log('❌ Erro ao marcar como processado:', updateError.message)
      } else {
        console.log('✅ Registros marcados como processados')
        this.stats.processed = transbordoData.length
      }

      console.log('\n🎉 Processamento concluído!')
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

      // Verificar dados processados
      console.log('\n🔍 Verificando dados processados...')
      const [brandsCount, modelsCount, yearsCount] = await Promise.all([
        supabase.from('ocar_fipe_brands').select('*', { count: 'exact', head: true }),
        supabase.from('ocar_fipe_models').select('*', { count: 'exact', head: true }),
        supabase.from('ocar_fipe_years').select('*', { count: 'exact', head: true })
      ])

      console.log('📊 Dados no banco:')
      console.log(`  - Transbordo: ${transbordoData.length}`)
      console.log(`  - Marcas: ${brandsCount.count}`)
      console.log(`  - Modelos: ${modelsCount.count}`)
      console.log(`  - Anos/Versões: ${yearsCount.count}`)

    } catch (error) {
      console.error('❌ Erro fatal:', error.message)
    }
  }

  async run() {
    await this.processTransbordo()
  }
}

async function main() {
  const processor = new TransbordoProcessorFixed()
  await processor.run()
}

main()

