// Script inteligente para popular transbordo com delay entre requisições
// Execute: node scripts/populate-transbordo-smart.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class FipeService {
  constructor() {
    this.baseUrl = 'https://fipe.parallelum.com.br/api/v2'
    this.apiToken = process.env.FIPE_API_TOKEN
  }

  async makeRequest(endpoint) {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
    }

    if (this.apiToken) {
      headers['X-Subscription-Token'] = this.apiToken
    }

    try {
      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error(`Erro na API FIPE: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao consultar API FIPE:', error)
      throw new Error('Erro ao consultar tabela FIPE. Tente novamente.')
    }
  }

  async getBrands(vehicleType = 'cars', reference) {
    const params = reference ? `?reference=${reference}` : ''
    return this.makeRequest(`/${vehicleType}/brands${params}`)
  }

  async getModelsByBrand(vehicleType = 'cars', brandId, reference) {
    const params = reference ? `?reference=${reference}` : ''
    return this.makeRequest(`/${vehicleType}/brands/${brandId}/models${params}`)
  }

  async getYearsByModel(vehicleType = 'cars', brandId, modelId, reference) {
    const params = reference ? `?reference=${reference}` : ''
    return this.makeRequest(`/${vehicleType}/brands/${brandId}/models/${modelId}/years${params}`)
  }

  async getVehicleInfo(vehicleType = 'cars', brandId, modelId, yearId, reference) {
    const params = reference ? `?reference=${reference}` : ''
    return this.makeRequest(`/${vehicleType}/brands/${brandId}/models/${modelId}/years/${yearId}${params}`)
  }
}

class SmartTransbordoPopulator {
  constructor() {
    this.fipeService = new FipeService()
    this.stats = {
      brands: 0,
      models: 0,
      years: 0,
      inserted: 0,
      errors: 0
    }
    this.delay = 3000 // 3 segundos entre requisições
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async populateTransbordo() {
    console.log('🚀 Iniciando população inteligente da tabela de transbordo...\n')

    try {
      // 1. Buscar marcas
      console.log('1️⃣ Buscando marcas da FIPE...')
      const brands = await this.fipeService.getBrands('cars')
      this.stats.brands = brands.length
      console.log(`✅ ${brands.length} marcas encontradas`)

      // Limitar para teste (apenas Honda)
      const limitedBrands = brands.filter(b => b.name === 'Honda')
      console.log(`🔍 Processando apenas ${limitedBrands.length} marca para teste:`)
      limitedBrands.forEach(brand => console.log(`   - ${brand.name} (${brand.code})`))

      // 2. Para cada marca, buscar modelos
      for (const brand of limitedBrands) {
        console.log(`\n🌐 Processando marca: ${brand.name} (${brand.code})`)
        
        try {
          const models = await this.fipeService.getModelsByBrand('cars', brand.code)
          this.stats.models += models.length
          console.log(`   📦 ${models.length} modelos encontrados`)
          console.log(`   🔍 Processando ${models.length} modelos:`)
          models.forEach(model => console.log(`      - ${model.name}`))

          // 3. Para cada modelo, buscar anos
          for (const model of models) {
            console.log(`      📅 Processando modelo: ${model.name}`)
            
            try {
              await this.wait(this.delay) // Delay entre requisições
              
              const years = await this.fipeService.getYearsByModel('cars', brand.code, model.code)
              this.stats.years += years.length
              console.log(`         📊 ${years.length} anos encontrados`)

              // 4. Para cada ano, buscar informações do veículo
              for (const year of years) {
                try {
                  await this.wait(this.delay) // Delay entre requisições
                  
                  const vehicleInfo = await this.fipeService.getVehicleInfo('cars', brand.code, model.code, year.code)
                  
                  // Preparar dados para inserção
                  const transbordoData = {
                    marca: brand.name,
                    modelo: model.name, // Nome completo do modelo/versão
                    ano: parseInt(year.code.split('-')[0]),
                    codigo_fipe: vehicleInfo.codeFipe,
                    referencia_mes: new Date().toISOString().slice(0, 7),
                    preco: parseFloat(vehicleInfo.price.replace('R$ ', '').replace('.', '').replace(',', '.')),
                    processado: false
                  }

                  // Inserir no banco
                  const { error } = await supabase
                    .from('ocar_transbordo')
                    .insert(transbordoData)

                  if (error) {
                    console.log(`         ❌ Erro ao inserir ${brand.name} ${model.name} ${year.code}: ${error.message}`)
                    this.stats.errors++
                  } else {
                    console.log(`         ✅ ${brand.name} ${model.name} ${year.code} - R$ ${vehicleInfo.price}`)
                    this.stats.inserted++
                  }

                } catch (error) {
                  console.log(`         ❌ Erro ao buscar ano ${year.code} do ${model.name}: ${error.message}`)
                  this.stats.errors++
                }
              }

            } catch (error) {
              console.log(`      ❌ Erro ao buscar anos do modelo ${model.name}: ${error.message}`)
              this.stats.errors++
            }
          }

        } catch (error) {
          console.log(`   ❌ Erro ao buscar modelos da marca ${brand.name}: ${error.message}`)
          this.stats.errors++
        }
      }

      console.log('\n🎉 População da tabela de transbordo concluída!')
      console.log('\n📊 RELATÓRIO FINAL:')
      console.log(`  - Marcas processadas: ${this.stats.brands}`)
      console.log(`  - Modelos processados: ${this.stats.models}`)
      console.log(`  - Anos processados: ${this.stats.years}`)
      console.log(`  - Total de registros inseridos: ${this.stats.inserted}`)
      console.log(`  - Erros: ${this.stats.errors}`)

      // Verificar dados inseridos
      console.log('\n🔍 Verificando dados inseridos...')
      const { data: insertedData, error: selectError } = await supabase
        .from('ocar_transbordo')
        .select('*')
        .order('marca', { ascending: true })
        .order('modelo', { ascending: true })
        .order('ano', { ascending: false })
        .limit(20)

      if (selectError) {
        console.log('❌ Erro ao verificar dados:', selectError.message)
      } else {
        const { count } = await supabase
          .from('ocar_transbordo')
          .select('*', { count: 'exact', head: true })
        
        console.log(`📊 ${count} registros na tabela de transbordo:`)
        insertedData.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.marca} ${item.modelo} ${item.ano} - R$ ${item.preco.toLocaleString('pt-BR')} (${item.codigo_fipe})`)
        })
      }

    } catch (error) {
      console.error('❌ Erro fatal:', error.message)
    }
  }

  async run() {
    await this.populateTransbordo()
  }
}

async function main() {
  const populator = new SmartTransbordoPopulator()
  await populator.run()
}

main()