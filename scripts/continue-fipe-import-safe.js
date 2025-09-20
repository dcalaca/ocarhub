// Script seguro para continuar importação FIPE sem duplicidades
// Execute: node scripts/continue-fipe-import-safe.js

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

class SafeFipeImport {
  constructor() {
    this.fipeService = new FipeService()
    this.stats = {
      totalBrands: 0,
      processedBrands: 0,
      skippedBrands: 0,
      totalModels: 0,
      totalYears: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      startTime: Date.now()
    }
    this.delay = 1500 // 1.5 segundos entre requisições
    this.batchSize = 20 // Processar em lotes menores
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getImportedBrands() {
    console.log('🔍 Verificando marcas já importadas...')
    
    const { data, error } = await supabase
      .from('ocar_transbordo')
      .select('marca')
      .order('marca')

    if (error) {
      throw new Error(`Erro ao verificar marcas importadas: ${error.message}`)
    }

    const importedBrands = [...new Set(data.map(item => item.marca))]
    console.log(`✅ ${importedBrands.length} marcas já importadas: ${importedBrands.join(', ')}`)
    
    return importedBrands
  }

  async getAllFipeBrands() {
    console.log('🌐 Buscando todas as marcas da FIPE...')
    
    const brands = await this.fipeService.getBrands('cars')
    this.stats.totalBrands = brands.length
    console.log(`✅ ${brands.length} marcas encontradas na FIPE`)
    
    return brands
  }

  async getBrandsToImport(importedBrands) {
    console.log('📋 Determinando marcas para importar...')
    
    const allBrands = await this.getAllFipeBrands()
    const brandsToImport = allBrands.filter(brand => !importedBrands.includes(brand.name))
    
    console.log(`📊 Resumo:`)
    console.log(`   - Total de marcas na FIPE: ${allBrands.length}`)
    console.log(`   - Marcas já importadas: ${importedBrands.length}`)
    console.log(`   - Marcas para importar: ${brandsToImport.length}`)
    
    if (brandsToImport.length > 0) {
      console.log(`\n🚀 Marcas que serão importadas:`)
      brandsToImport.slice(0, 10).forEach((brand, index) => {
        console.log(`   ${index + 1}. ${brand.name} (${brand.code})`)
      })
      if (brandsToImport.length > 10) {
        console.log(`   ... e mais ${brandsToImport.length - 10} marcas`)
      }
    }
    
    return brandsToImport
  }

  async checkDuplicate(marca, modelo, ano, codigo_fipe) {
    const { data, error } = await supabase
      .from('ocar_transbordo')
      .select('id')
      .eq('marca', marca)
      .eq('modelo', modelo)
      .eq('ano', ano)
      .eq('codigo_fipe', codigo_fipe)
      .limit(1)

    if (error) {
      console.log(`         ⚠️  Erro ao verificar duplicidade: ${error.message}`)
      return false // Em caso de erro, tenta inserir
    }

    return data && data.length > 0
  }

  async insertSingleRecord(record) {
    try {
      // Verificar se já existe
      const isDuplicate = await this.checkDuplicate(
        record.marca, 
        record.modelo, 
        record.ano, 
        record.codigo_fipe
      )

      if (isDuplicate) {
        this.stats.skipped++
        return { success: true, action: 'skipped' }
      }

      // Inserir novo registro
      const { data, error } = await supabase
        .from('ocar_transbordo')
        .insert(record)
        .select()

      if (error) {
        throw new Error(error.message)
      }

      this.stats.inserted++
      return { success: true, action: 'inserted' }

    } catch (error) {
      this.stats.errors++
      return { success: false, error: error.message }
    }
  }

  async processBrand(brand) {
    console.log(`\n🌐 Processando marca: ${brand.name} (${brand.code})`)
    
    try {
      // Buscar modelos da marca
      const models = await this.fipeService.getModelsByBrand('cars', brand.code)
      this.stats.totalModels += models.length
      console.log(`   📦 ${models.length} modelos encontrados`)

      // Processar modelos em lotes
      for (let i = 0; i < models.length; i += this.batchSize) {
        const batch = models.slice(i, i + this.batchSize)
        console.log(`   🔄 Processando lote ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(models.length / this.batchSize)} (${batch.length} modelos)`)
        
        await this.processBatch(brand, batch)
        
        // Delay entre lotes
        if (i + this.batchSize < models.length) {
          await this.wait(this.delay)
        }
      }

      this.stats.processedBrands++
      console.log(`   ✅ Marca ${brand.name} processada com sucesso`)

    } catch (error) {
      console.log(`   ❌ Erro ao processar marca ${brand.name}: ${error.message}`)
      this.stats.errors++
    }
  }

  async processBatch(brand, models) {
    let batchInserted = 0
    let batchSkipped = 0
    let batchErrors = 0

    for (const model of models) {
      try {
        // Buscar anos do modelo
        const years = await this.fipeService.getYearsByModel('cars', brand.code, model.code)
        this.stats.totalYears += years.length

        // Para cada ano, buscar informações completas
        for (const year of years) {
          try {
            const vehicleInfo = await this.fipeService.getVehicleInfo('cars', brand.code, model.code, year.code)
            
            // Preparar dados para inserção
            const transbordoData = {
              marca: brand.name,
              modelo: model.name,
              ano: parseInt(year.code.split('-')[0]),
              codigo_fipe: vehicleInfo.codeFipe,
              referencia_mes: new Date().toISOString().slice(0, 7),
              preco: parseFloat(vehicleInfo.price.replace('R$ ', '').replace('.', '').replace(',', '.')),
              processado: false
            }

            // Inserir registro individual
            const result = await this.insertSingleRecord(transbordoData)
            
            if (result.success) {
              if (result.action === 'inserted') {
                batchInserted++
              } else if (result.action === 'skipped') {
                batchSkipped++
              }
            } else {
              batchErrors++
              console.log(`         ❌ Erro: ${result.error}`)
            }

            // Delay entre requisições
            await this.wait(100)

          } catch (yearError) {
            console.log(`         ❌ Erro ao buscar ano ${year.code} do ${model.name}: ${yearError.message}`)
            batchErrors++
          }
        }

      } catch (modelError) {
        console.log(`      ❌ Erro ao buscar anos do modelo ${model.name}: ${modelError.message}`)
        batchErrors++
      }
    }

    console.log(`         📊 Lote: ${batchInserted} inseridos, ${batchSkipped} duplicados, ${batchErrors} erros`)
  }

  async continueImport() {
    console.log('🚀 Iniciando continuação da importação FIPE...\n')

    try {
      // 1. Verificar marcas já importadas
      const importedBrands = await this.getImportedBrands()
      
      // 2. Determinar marcas para importar
      const brandsToImport = await this.getBrandsToImport(importedBrands)
      
      if (brandsToImport.length === 0) {
        console.log('\n🎉 Todas as marcas já foram importadas!')
        return
      }

      // 3. Processar marcas restantes
      console.log(`\n🔄 Iniciando processamento de ${brandsToImport.length} marcas...`)
      
      for (let i = 0; i < brandsToImport.length; i++) {
        const brand = brandsToImport[i]
        console.log(`\n📊 Progresso: ${i + 1}/${brandsToImport.length} marcas`)
        
        await this.processBrand(brand)
        
        // Delay entre marcas
        if (i < brandsToImport.length - 1) {
          console.log(`   ⏳ Aguardando ${this.delay/1000}s antes da próxima marca...`)
          await this.wait(this.delay)
        }
      }

      this.printFinalStats()

    } catch (error) {
      console.error('❌ Erro fatal:', error.message)
      this.stats.errors++
    }
  }

  printFinalStats() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60

    console.log('\n🎉 IMPORTAÇÃO CONCLUÍDA!')
    console.log('\n📊 RELATÓRIO FINAL:')
    console.log(`  - Tempo total: ${minutes}m ${seconds}s`)
    console.log(`  - Total de marcas na FIPE: ${this.stats.totalBrands}`)
    console.log(`  - Marcas processadas: ${this.stats.processedBrands}`)
    console.log(`  - Modelos processados: ${this.stats.totalModels}`)
    console.log(`  - Anos processados: ${this.stats.totalYears}`)
    console.log(`  - Registros inseridos: ${this.stats.inserted}`)
    console.log(`  - Registros duplicados (pulados): ${this.stats.skipped}`)
    console.log(`  - Erros: ${this.stats.errors}`)

    if (this.stats.errors > 0) {
      console.log('\n⚠️  Alguns erros ocorreram durante a importação, mas o processo continuou.')
    }

    // Verificar total final
    this.verifyFinalCount()
  }

  async verifyFinalCount() {
    try {
      const { count } = await supabase
        .from('ocar_transbordo')
        .select('*', { count: 'exact', head: true })
      
      console.log(`\n📈 Total de registros na tabela ocar_transbordo: ${count}`)
      
      // Mostrar algumas amostras
      const { data: samples } = await supabase
        .from('ocar_transbordo')
        .select('marca, modelo, ano, preco')
        .order('marca, modelo, ano')
        .limit(5)
      
      if (samples && samples.length > 0) {
        console.log('\n🔍 Amostras dos dados importados:')
        samples.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.marca} ${item.modelo} ${item.ano} - R$ ${item.preco.toLocaleString('pt-BR')}`)
        })
      }

    } catch (error) {
      console.log('❌ Erro ao verificar contagem final:', error.message)
    }
  }

  async run() {
    console.log('🔧 Configurações:')
    console.log(`   - Delay entre requisições: ${this.delay}ms`)
    console.log(`   - Tamanho do lote: ${this.batchSize} modelos`)
    console.log(`   - Token FIPE: ${this.fipeService.apiToken ? '✅ Configurado' : '❌ Não configurado'}`)
    console.log('')

    if (!this.fipeService.apiToken) {
      console.log('⚠️  ATENÇÃO: Token FIPE não configurado!')
      console.log('   Configure a variável FIPE_API_TOKEN no arquivo .env.local')
      console.log('   Exemplo: FIPE_API_TOKEN=seu_token_aqui')
      return
    }

    await this.continueImport()
  }
}

// Executar script
async function main() {
  const importer = new SafeFipeImport()
  await importer.run()
}

main()
