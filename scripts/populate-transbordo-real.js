// Script para popular a tabela de transbordo com dados REAIS da FIPE
// Execute: node scripts/populate-transbordo-real.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Simular o FipeService (copiado do código existente)
class FipeService {
  constructor() {
    this.baseUrl = 'https://fipe.parallelum.com.br/api/v2'
  }

  async makeRequest(endpoint) {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
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

  // Obter marcas
  async getBrands(vehicleType = 'cars') {
    return this.makeRequest(`/${vehicleType}/brands`)
  }

  // Obter modelos por marca
  async getModelsByBrand(vehicleType, brandCode) {
    return this.makeRequest(`/${vehicleType}/brands/${brandCode}/models`)
  }

  // Obter anos por modelo
  async getYearsByModel(vehicleType, brandCode, modelCode) {
    return this.makeRequest(`/${vehicleType}/brands/${brandCode}/models/${modelCode}/years`)
  }

  // Obter informações do veículo
  async getVehicleInfo(vehicleType, brandCode, modelCode, yearCode) {
    return this.makeRequest(`/${vehicleType}/brands/${brandCode}/models/${modelCode}/years/${yearCode}`)
  }
}

class TransbordoRealPopulator {
  constructor() {
    this.fipeService = new FipeService()
    this.stats = {
      brands: 0,
      models: 0,
      years: 0,
      totalRecords: 0,
      errors: []
    }
  }

  async populateTransbordo() {
    console.log('📊 Populando tabela de transbordo com dados REAIS da FIPE...\n')

    try {
      // 1. Buscar marcas da FIPE
      console.log('1️⃣ Buscando marcas da FIPE...')
      const brands = await this.fipeService.getBrands('cars')
      this.stats.brands = brands.length
      console.log(`✅ ${brands.length} marcas encontradas`)

      // Limitar para teste (pegar apenas Honda para ver os nomes completos)
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

          // Processar TODOS os modelos para pegar nomes completos
          console.log(`   🔍 Processando ${models.length} modelos:`)
          models.forEach(model => console.log(`      - ${model.name}`))

          // 3. Para cada modelo, buscar anos
          for (const model of models) {
            console.log(`      📅 Processando modelo: ${model.name}`)
            
            try {
              const years = await this.fipeService.getYearsByModel('cars', brand.code, model.code)
              this.stats.years += years.length
              console.log(`         📊 ${years.length} anos encontrados`)

              // 4. Para cada ano, buscar informações completas
              for (const year of years) {
                try {
                  const vehicleInfo = await this.fipeService.getVehicleInfo('cars', brand.code, model.code, year.code)
                  
                  // Extrair dados para a tabela de transbordo
                  const transbordoData = {
                    marca: brand.name,
                    modelo: model.name, // Este já vem com a versão completa da FIPE (ex: "Golf Comfortline 2.0 TSI 16V Aut.4p")
                    ano: parseInt(year.code.split('-')[0]),
                    codigo_fipe: vehicleInfo.codeFipe,
                    referencia_mes: new Date().toISOString().slice(0, 7), // YYYY-MM
                    preco: parseFloat(vehicleInfo.price.replace('R$ ', '').replace('.', '').replace(',', '.')),
                    processado: false
                  }

                  // Inserir na tabela de transbordo
                  const { error } = await supabase
                    .from('ocar_transbordo')
                    .insert(transbordoData)

                  if (error) {
                    const errorMsg = `Erro ao inserir ${brand.name} ${model.name} ${transbordoData.ano}: ${error.message}`
                    console.error(`         ❌ ${errorMsg}`)
                    this.stats.errors.push(errorMsg)
                  } else {
                    this.stats.totalRecords++
                    console.log(`         ✅ ${brand.name} ${model.name} ${transbordoData.ano} - R$ ${transbordoData.preco.toLocaleString('pt-BR')}`)
                  }

                  // Pequena pausa para não sobrecarregar a API
                  await new Promise(resolve => setTimeout(resolve, 100))

                } catch (yearError) {
                  const errorMsg = `Erro ao buscar ano ${year.code} do ${model.name}: ${yearError.message}`
                  console.error(`         ❌ ${errorMsg}`)
                  this.stats.errors.push(errorMsg)
                }
              }

            } catch (modelError) {
              const errorMsg = `Erro ao buscar anos do modelo ${model.name}: ${modelError.message}`
              console.error(`      ❌ ${errorMsg}`)
              this.stats.errors.push(errorMsg)
            }
          }

        } catch (brandError) {
          const errorMsg = `Erro ao buscar modelos da marca ${brand.name}: ${brandError.message}`
          console.error(`   ❌ ${errorMsg}`)
          this.stats.errors.push(errorMsg)
        }
      }

      console.log('\n🎉 População da tabela de transbordo concluída!')
      this.printStats()

    } catch (error) {
      const errorMsg = `Erro fatal: ${error.message}`
      console.error(`❌ ${errorMsg}`)
      this.stats.errors.push(errorMsg)
    }
  }

  async verifyData() {
    console.log('\n🔍 Verificando dados inseridos...')

    try {
      const { data: transbordoData, error: transbordoError } = await supabase
        .from('ocar_transbordo')
        .select('marca, modelo, ano, codigo_fipe, preco')
        .order('marca, modelo, ano')
        .limit(20)

      if (transbordoError) {
        console.log('❌ Erro ao verificar dados:', transbordoError.message)
        return
      }

      console.log(`📊 ${transbordoData.length} registros na tabela de transbordo:`)
      transbordoData.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.marca} ${record.modelo} ${record.ano} - R$ ${record.preco.toLocaleString('pt-BR')} (${record.codigo_fipe})`)
      })

    } catch (error) {
      console.error('❌ Erro ao verificar dados:', error.message)
    }
  }

  printStats() {
    console.log('\n📊 RELATÓRIO FINAL:')
    console.log(`  - Marcas processadas: ${this.stats.brands}`)
    console.log(`  - Modelos processados: ${this.stats.models}`)
    console.log(`  - Anos processados: ${this.stats.years}`)
    console.log(`  - Total de registros inseridos: ${this.stats.totalRecords}`)
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
    console.log('🚀 Iniciando população da tabela de transbordo com dados REAIS da FIPE...\n')
    console.log('⚠️  Este processo pode demorar alguns minutos...\n')

    try {
      await this.populateTransbordo()
      await this.verifyData()
    } catch (error) {
      console.error('❌ Erro fatal:', error.message)
      process.exit(1)
    }
  }
}

// Executar script
async function main() {
  const populator = new TransbordoRealPopulator()
  await populator.run()
}

main()
