// Script para popular o banco de dados com dados da FIPE
// Execute: node scripts/populate-fipe-database.js

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

// Simulação da API FIPE (substitua pela implementação real)
const mockFipeService = {
  async getBrands() {
    return [
      { code: '25', name: 'Honda' },
      { code: '23', name: 'VW - VolksWagen' },
      { code: '21', name: 'Fiat' },
      { code: '59', name: 'Chevrolet' },
      { code: '26', name: 'Hyundai' },
      { code: '27', name: 'Renault' },
      { code: '28', name: 'Jeep' },
      { code: '29', name: 'Nissan' },
      { code: '30', name: 'Ford' }
    ]
  },

  async getModelsByBrand(brandCode) {
    // Simulação de modelos por marca
    const modelsByBrand = {
      '25': [ // Honda
        { code: '1248', name: 'Civic' },
        { code: '1249', name: 'Accord' },
        { code: '1250', name: 'CR-V' },
        { code: '1251', name: 'Fit' },
        { code: '1252', name: 'HR-V' }
      ],
      '23': [ // VW
        { code: '2001', name: 'Golf' },
        { code: '2002', name: 'Polo' },
        { code: '2003', name: 'Jetta' },
        { code: '2004', name: 'Passat' },
        { code: '2005', name: 'Tiguan' }
      ],
      '21': [ // Fiat
        { code: '3001', name: 'Palio' },
        { code: '3002', name: 'Uno' },
        { code: '3003', name: 'Siena' },
        { code: '3004', name: 'Strada' },
        { code: '3005', name: 'Doblo' }
      ]
    }
    
    return modelsByBrand[brandCode] || []
  },

  async getYearsByModel(brandCode, modelCode) {
    // Simulação de anos/versões por modelo
    const years = []
    const currentYear = new Date().getFullYear()
    
    // Gerar anos de 2015 até o ano atual
    for (let year = 2015; year <= currentYear; year++) {
      years.push({
        code: `${year}-1`,
        name: `${year} Gasolina`,
        year: year,
        fuel_type: 'Gasolina'
      })
      
      // Adicionar versão Flex para anos mais recentes
      if (year >= 2017) {
        years.push({
          code: `${year}-2`,
          name: `${year} Flex`,
          year: year,
          fuel_type: 'Flex'
        })
      }
    }
    
    return years
  }
}

class FipePopulator {
  constructor() {
    this.stats = {
      brands: 0,
      models: 0,
      years: 0,
      errors: []
    }
  }

  async populateBrands() {
    console.log('📊 Populando marcas...')
    
    try {
      const brands = await mockFipeService.getBrands()
      
      const { error } = await supabase
        .from('ocar_fipe_brands')
        .upsert(brands.map(brand => ({
          code: brand.code,
          name: brand.name,
          active: true
        })), { onConflict: 'code' })

      if (error) throw error

      this.stats.brands = brands.length
      console.log(`✅ ${brands.length} marcas inseridas`)
      
    } catch (error) {
      const errorMsg = `Erro ao popular marcas: ${error.message}`
      console.error('❌', errorMsg)
      this.stats.errors.push(errorMsg)
    }
  }

  async populateModels() {
    console.log('📊 Populando modelos...')
    
    try {
      const brands = await mockFipeService.getBrands()
      
      for (const brand of brands) {
        try {
          const models = await mockFipeService.getModelsByBrand(brand.code)
          
          if (models.length > 0) {
            const { error } = await supabase
              .from('ocar_fipe_models')
              .upsert(models.map(model => ({
                brand_code: brand.code,
                code: model.code,
                name: model.name,
                active: true
              })), { onConflict: 'brand_code,code' })

            if (error) throw error

            this.stats.models += models.length
            console.log(`✅ ${models.length} modelos da marca ${brand.name} inseridos`)
          }
        } catch (error) {
          const errorMsg = `Erro ao popular modelos da marca ${brand.name}: ${error.message}`
          console.error('❌', errorMsg)
          this.stats.errors.push(errorMsg)
        }
      }
      
    } catch (error) {
      const errorMsg = `Erro ao popular modelos: ${error.message}`
      console.error('❌', errorMsg)
      this.stats.errors.push(errorMsg)
    }
  }

  async populateYears() {
    console.log('📊 Populando anos/versões...')
    
    try {
      const brands = await mockFipeService.getBrands()
      
      for (const brand of brands) {
        const models = await mockFipeService.getModelsByBrand(brand.code)
        
        for (const model of models) {
          try {
            const years = await mockFipeService.getYearsByModel(brand.code, model.code)
            
            if (years.length > 0) {
              const { error } = await supabase
                .from('ocar_fipe_years')
                .upsert(years.map(year => ({
                  brand_code: brand.code,
                  model_code: model.code,
                  code: year.code,
                  name: year.name,
                  year: year.year,
                  fuel_type: year.fuel_type,
                  active: true
                })), { onConflict: 'brand_code,model_code,code' })

              if (error) throw error

              this.stats.years += years.length
              console.log(`✅ ${years.length} anos/versões do modelo ${model.name} inseridos`)
            }
          } catch (error) {
            const errorMsg = `Erro ao popular anos do modelo ${model.name}: ${error.message}`
            console.error('❌', errorMsg)
            this.stats.errors.push(errorMsg)
          }
        }
      }
      
    } catch (error) {
      const errorMsg = `Erro ao popular anos: ${error.message}`
      console.error('❌', errorMsg)
      this.stats.errors.push(errorMsg)
    }
  }

  async populateAll() {
    console.log('🚀 Iniciando população do banco de dados FIPE...')
    console.log('⚠️  Este processo pode demorar alguns minutos...\n')

    const startTime = Date.now()

    // 1. Popular marcas
    await this.populateBrands()
    console.log('')

    // 2. Popular modelos
    await this.populateModels()
    console.log('')

    // 3. Popular anos/versões
    await this.populateYears()
    console.log('')

    const endTime = Date.now()
    const duration = Math.round((endTime - startTime) / 1000)

    // Relatório final
    console.log('📊 RELATÓRIO FINAL:')
    console.log(`  - Marcas: ${this.stats.brands}`)
    console.log(`  - Modelos: ${this.stats.models}`)
    console.log(`  - Anos/Versões: ${this.stats.years}`)
    console.log(`  - Erros: ${this.stats.errors.length}`)
    console.log(`  - Tempo: ${duration}s`)

    if (this.stats.errors.length > 0) {
      console.log('\n⚠️  ERROS ENCONTRADOS:')
      this.stats.errors.forEach(error => console.log(`  - ${error}`))
    }

    console.log('\n✅ População concluída!')
  }

  async verifyData() {
    console.log('🔍 Verificando dados inseridos...')
    
    try {
      const [brandsResult, modelsResult, yearsResult] = await Promise.all([
        supabase.from('ocar_fipe_brands').select('*', { count: 'exact', head: true }),
        supabase.from('ocar_fipe_models').select('*', { count: 'exact', head: true }),
        supabase.from('ocar_fipe_years').select('*', { count: 'exact', head: true })
      ])

      console.log(`📊 Dados no banco:`)
      console.log(`  - Marcas: ${brandsResult.count}`)
      console.log(`  - Modelos: ${modelsResult.count}`)
      console.log(`  - Anos/Versões: ${yearsResult.count}`)

    } catch (error) {
      console.error('❌ Erro ao verificar dados:', error.message)
    }
  }
}

// Executar script
async function main() {
  const populator = new FipePopulator()
  
  try {
    await populator.populateAll()
    await populator.verifyData()
  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
    process.exit(1)
  }
}

main()
