// Script para popular a tabela de transbordo com dados da FIPE
// Execute: node scripts/populate-transbordo.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Simulação da API FIPE (substitua pela implementação real)
const mockFipeService = {
  async getBrands() {
    return [
      { code: '25', name: 'Honda' },
      { code: '23', name: 'VW - VolksWagen' },
      { code: '21', name: 'Fiat' },
      { code: '59', name: 'Chevrolet' },
      { code: '26', name: 'Hyundai' }
    ]
  },

  async getModelsByBrand(brandCode) {
    // Simulação de modelos por marca com descrições completas da FIPE
    const modelsByBrand = {
      '25': [ // Honda
        { 
          code: '1248', 
          name: 'Civic',
          fullName: 'Civic Sedan EX 2.0 Flex 16V Aut.4p'
        },
        { 
          code: '1249', 
          name: 'Accord',
          fullName: 'Accord Sedan EX 2.0 Flex 16V Aut.4p'
        },
        { 
          code: '1250', 
          name: 'CR-V',
          fullName: 'CR-V EX 2.0 Flex 16V Aut.4p'
        },
        { 
          code: '1251', 
          name: 'Fit',
          fullName: 'Fit LX 1.5 Flex 16V Aut.4p'
        },
        { 
          code: '1252', 
          name: 'HR-V',
          fullName: 'HR-V EX 2.0 Flex 16V Aut.4p'
        }
      ],
      '23': [ // VW
        { 
          code: '2001', 
          name: 'Golf',
          fullName: 'Golf Comfortline 2.0 TSI 16V Aut.4p'
        },
        { 
          code: '2002', 
          name: 'Polo',
          fullName: 'Polo Comfortline 1.6 Flex 16V Aut.4p'
        },
        { 
          code: '2003', 
          name: 'Jetta',
          fullName: 'Jetta Comfortline 2.0 TSI 16V Aut.4p'
        },
        { 
          code: '2004', 
          name: 'Passat',
          fullName: 'Passat Comfortline 2.0 TSI 16V Aut.4p'
        },
        { 
          code: '2005', 
          name: 'Tiguan',
          fullName: 'Tiguan Comfortline 2.0 TSI 16V Aut.4p'
        }
      ],
      '21': [ // Fiat
        { 
          code: '3001', 
          name: 'Palio',
          fullName: 'Palio Fire 1.0 8V Flex 2p'
        },
        { 
          code: '3002', 
          name: 'Uno',
          fullName: 'Uno Fire 1.0 8V Flex 2p'
        },
        { 
          code: '3003', 
          name: 'Siena',
          fullName: 'Siena Fire 1.0 8V Flex 4p'
        },
        { 
          code: '3004', 
          name: 'Strada',
          fullName: 'Strada Working 1.4 Flex 8V 2p'
        },
        { 
          code: '3005', 
          name: 'Doblo',
          fullName: 'Doblo Working 1.4 Flex 8V 2p'
        }
      ]
    }
    
    return modelsByBrand[brandCode] || []
  },

  async getYearsByModel(brandCode, modelCode) {
    // Simulação de anos/versões por modelo com descrições completas da FIPE
    const years = []
    const currentYear = new Date().getFullYear()
    
    // Gerar anos de 2015 até o ano atual
    for (let year = 2015; year <= currentYear; year++) {
      years.push({
        code: `${year}-1`,
        name: `${year} Gasolina`,
        year: year,
        fuel_type: 'Gasolina',
        fipe_code: `${brandCode}${modelCode}${year}1`,
        price: Math.floor(Math.random() * 50000) + 20000 // Preço simulado
      })
      
      // Adicionar versão Flex para anos mais recentes
      if (year >= 2017) {
        years.push({
          code: `${year}-2`,
          name: `${year} Flex`,
          year: year,
          fuel_type: 'Flex',
          fipe_code: `${brandCode}${modelCode}${year}2`,
          price: Math.floor(Math.random() * 50000) + 20000 // Preço simulado
        })
      }
    }
    
    return years
  }
}

class TransbordoPopulator {
  constructor() {
    this.stats = {
      brands: 0,
      models: 0,
      years: 0,
      totalRecords: 0,
      errors: []
    }
  }

  async populateTransbordo() {
    console.log('📊 Populando tabela de transbordo...\n')

    try {
      const brands = await mockFipeService.getBrands()
      this.stats.brands = brands.length

      for (const brand of brands) {
        console.log(`\n🌐 Processando marca: ${brand.name} (${brand.code})`)
        
        const models = await mockFipeService.getModelsByBrand(brand.code)
        this.stats.models += models.length

        for (const model of models) {
          console.log(`  📦 Processando modelo: ${model.name} (${model.fullName})`)
          
          const years = await mockFipeService.getYearsByModel(brand.code, model.code)
          this.stats.years += years.length

          // Preparar dados para inserção na tabela de transbordo
          const transbordoData = years.map(year => ({
            brand_code: brand.code,
            brand_name: brand.name,
            model_code: model.code,
            model_name: model.name,
            model_full_name: model.fullName,
            year_code: year.code,
            year_name: year.name,
            year_number: year.year,
            fuel_type: year.fuel_type,
            fipe_code: year.fipe_code,
            reference_month: new Date().toISOString().slice(0, 7), // YYYY-MM
            price: year.price,
            processed: false
          }))

          // Inserir dados na tabela de transbordo
          const { error } = await supabase
            .from('ocar_transbordo')
            .upsert(transbordoData, { 
              onConflict: 'brand_code,model_code,year_code,reference_month' 
            })

          if (error) {
            const errorMsg = `Erro ao inserir dados do modelo ${model.name}: ${error.message}`
            console.error(`❌ ${errorMsg}`)
            this.stats.errors.push(errorMsg)
          } else {
            this.stats.totalRecords += transbordoData.length
            console.log(`    ✅ ${transbordoData.length} registros inseridos`)
          }
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

  async processTransbordoData() {
    console.log('\n🔄 Processando dados de transbordo para tabelas organizadas...')

    try {
      // Chamar a função SQL que processa os dados
      const { data, error } = await supabase
        .rpc('process_fipe_raw_data')

      if (error) {
        console.error('❌ Erro ao processar dados:', error.message)
        return
      }

      console.log('✅ Dados processados com sucesso!')

      // Verificar quantos registros foram processados
      const { data: processedCount, error: countError } = await supabase
        .from('ocar_transbordo')
        .select('processed', { count: 'exact', head: true })
        .eq('processed', true)

      if (countError) {
        console.log('⚠️  Não foi possível contar registros processados')
      } else {
        console.log(`📊 ${processedCount} registros processados`)
      }

    } catch (error) {
      console.error('❌ Erro ao processar dados:', error.message)
    }
  }

  async verifyData() {
    console.log('\n🔍 Verificando dados inseridos...')

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
    console.log(`  - Marcas: ${this.stats.brands}`)
    console.log(`  - Modelos: ${this.stats.models}`)
    console.log(`  - Anos/Versões: ${this.stats.years}`)
    console.log(`  - Total de registros: ${this.stats.totalRecords}`)
    console.log(`  - Erros: ${this.stats.errors.length}`)

    if (this.stats.errors.length > 0) {
      console.log('\n⚠️  ERROS ENCONTRADOS:')
      this.stats.errors.forEach(error => console.log(`  - ${error}`))
    }
  }

  async run() {
    console.log('🚀 Iniciando população da tabela de transbordo...\n')

    try {
      await this.populateTransbordo()
      await this.processTransbordoData()
      await this.verifyData()
    } catch (error) {
      console.error('❌ Erro fatal:', error.message)
      process.exit(1)
    }
  }
}

// Executar script
async function main() {
  const populator = new TransbordoPopulator()
  await populator.run()
}

main()
