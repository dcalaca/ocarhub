// Script específico para importar dados do Excel FIPE
// Processa a estrutura específica do seu arquivo Excel
// Execute: node scripts/import-excel-fipe.js <caminho-do-arquivo.csv>

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class ExcelFipeImporter {
  constructor() {
    this.stats = {
      totalRecords: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      startTime: Date.now()
    }
    this.batchSize = 100
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
      return false
    }

    return data && data.length > 0
  }

  parseYearValue(yearValue) {
    if (!yearValue) return { year: 0, fuel: 'Gasolina' }
    
    // Extrair ano do formato "1998 Gasolina" ou "1997 Gasolina"
    const match = yearValue.toString().match(/^(\d{4})\s+(.+)$/)
    if (match) {
      return {
        year: parseInt(match[1]),
        fuel: match[2].trim()
      }
    }
    
    // Se não conseguir extrair, tentar apenas o número
    const yearMatch = yearValue.toString().match(/(\d{4})/)
    return {
      year: yearMatch ? parseInt(yearMatch[1]) : 0,
      fuel: 'Gasolina'
    }
  }

  parsePrice(priceStr) {
    if (!priceStr) return 0
    
    // Remover "R$", espaços e converter vírgula para ponto
    const cleanPrice = priceStr.toString()
      .replace(/R\$\s?/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim()
    
    return parseFloat(cleanPrice) || 0
  }

  parseReferenceMonth(monthStr) {
    if (!monthStr) return new Date().toISOString().slice(0, 7)
    
    // Converter "setembro de 2025" para "2025-09"
    const monthMap = {
      'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
      'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
      'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    }
    
    const match = monthStr.toString().toLowerCase().match(/(\w+)\s+de\s+(\d{4})/)
    if (match) {
      const month = monthMap[match[1]] || '01'
      const year = match[2]
      return `${year}-${month}`
    }
    
    return new Date().toISOString().slice(0, 7)
  }

  async insertBatch(batchData) {
    let batchInserted = 0
    let batchSkipped = 0
    let batchErrors = 0

    for (const record of batchData) {
      try {
        // Verificar se já existe
        const isDuplicate = await this.checkDuplicate(
          record.marca, 
          record.modelo, 
          record.ano, 
          record.codigo_fipe
        )

        if (isDuplicate) {
          batchSkipped++
          continue
        }

        // Inserir novo registro
        const { data, error } = await supabase
          .from('ocar_transbordo')
          .insert(record)
          .select()

        if (error) {
          throw new Error(error.message)
        }

        batchInserted++

      } catch (error) {
        batchErrors++
        console.log(`         ❌ Erro ao inserir ${record.marca} ${record.modelo} ${record.ano}: ${error.message}`)
      }
    }

    this.stats.inserted += batchInserted
    this.stats.skipped += batchSkipped
    this.stats.errors += batchErrors

    console.log(`         📊 Lote: ${batchInserted} inseridos, ${batchSkipped} duplicados, ${batchErrors} erros`)
  }

  async processCsvFile(filePath) {
    console.log(`📁 Processando arquivo Excel/CSV: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`)
    }

    return new Promise((resolve, reject) => {
      const records = []
      let batchCount = 0

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            // Mapear colunas específicas do seu CSV
            const marca = this.cleanString(row.Brand || row.brand || row.Marca || row.marca || '')
            const modelo = this.cleanString(row.Model || row.model || row.Modelo || row.modelo || '')
            const yearValue = row.Year || row.year || row['Year Value'] || row['year_value'] || row.YearValue || ''
            const codigoFipe = this.cleanString(row['Fipe Code'] || row['fipe_code'] || row.FipeCode || row.codigo_fipe || '')
            const price = row.Price || row.price || row.PRECO || row.preco || ''
            const month = row.Month || row.month || row.MES || row.mes || ''

            // Processar ano e combustível
            const { year, fuel } = this.parseYearValue(yearValue)

            // Validar dados obrigatórios
            if (!marca || !modelo || !year || !codigoFipe) {
              console.log(`         ⚠️  Registro inválido ignorado: ${marca} ${modelo} ${year} ${codigoFipe}`)
              return
            }

            const record = {
              marca: marca,
              modelo: modelo,
              ano: year,
              codigo_fipe: codigoFipe,
              referencia_mes: this.parseReferenceMonth(month),
              preco: this.parsePrice(price),
              processado: false
            }

            records.push(record)
            this.stats.totalRecords++

            // Processar em lotes
            if (records.length >= this.batchSize) {
              batchCount++
              console.log(`   🔄 Processando lote ${batchCount} (${records.length} registros)`)
              await this.insertBatch([...records])
              records.length = 0
            }

          } catch (error) {
            console.log(`         ❌ Erro ao processar linha: ${error.message}`)
            this.stats.errors++
          }
        })
        .on('end', async () => {
          try {
            // Processar último lote
            if (records.length > 0) {
              batchCount++
              console.log(`   🔄 Processando lote final ${batchCount} (${records.length} registros)`)
              await this.insertBatch(records)
            }

            console.log(`✅ Arquivo processado com sucesso!`)
            resolve()
          } catch (error) {
            reject(error)
          }
        })
        .on('error', (error) => {
          reject(error)
        })
    })
  }

  cleanString(str) {
    if (!str) return ''
    return str.toString().trim()
  }

  printFinalStats() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60

    console.log('\n🎉 IMPORTAÇÃO EXCEL FIPE CONCLUÍDA!')
    console.log('\n📊 RELATÓRIO FINAL:')
    console.log(`  - Tempo total: ${minutes}m ${seconds}s`)
    console.log(`  - Total de registros no arquivo: ${this.stats.totalRecords}`)
    console.log(`  - Registros inseridos: ${this.stats.inserted}`)
    console.log(`  - Registros duplicados (pulados): ${this.stats.skipped}`)
    console.log(`  - Erros: ${this.stats.errors}`)

    if (this.stats.errors > 0) {
      console.log('\n⚠️  Alguns erros ocorreram durante a importação, mas o processo continuou.')
    }

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
        console.log('\n🔍 Amostras dos dados na tabela:')
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
    console.log(`   - Tamanho do lote: ${this.batchSize} registros`)
    console.log(`   - URL Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado'}`)
    console.log('')

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('⚠️  ATENÇÃO: Supabase não configurado!')
      return
    }

    const csvFile = process.argv[2]
    if (!csvFile) {
      console.log('❌ Arquivo CSV não especificado!')
      console.log('   Uso: node scripts/import-excel-fipe.js <caminho-do-arquivo.csv>')
      console.log('   Exemplo: node scripts/import-excel-fipe.js dados/fipe-data.csv')
      return
    }

    try {
      await this.processCsvFile(csvFile)
      this.printFinalStats()
    } catch (error) {
      console.error('❌ Erro fatal:', error.message)
      this.stats.errors++
    }
  }
}

// Executar script
async function main() {
  const importer = new ExcelFipeImporter()
  await importer.run()
}

main()
