// Script para importar apenas registros que ainda não existem na tabela
// Execute: node scripts/import-missing-records.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class MissingRecordsImporter {
  constructor() {
    this.stats = {
      totalRecords: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      startTime: Date.now()
    }
    this.batchSize = 10 // Lotes muito pequenos
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  parseYearValue(yearValue) {
    if (!yearValue) return { year: 0, fuel: 'Gasolina' }
    
    const match = yearValue.toString().match(/^(\d{4})\s+(.+)$/)
    if (match) {
      return {
        year: parseInt(match[1]),
        fuel: match[2].trim()
      }
    }
    
    const yearMatch = yearValue.toString().match(/(\d{4})/)
    return {
      year: yearMatch ? parseInt(yearMatch[1]) : 0,
      fuel: 'Gasolina'
    }
  }

  parsePrice(priceStr) {
    if (!priceStr) return 0
    
    const cleanPrice = priceStr.toString()
      .replace(/R\$\s?/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim()
    
    return parseFloat(cleanPrice) || 0
  }

  parseReferenceMonth(monthStr) {
    if (!monthStr) return new Date().toISOString().slice(0, 7)
    
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

  async insertRecord(record) {
    try {
      const { error } = await supabase
        .from('ocar_transbordo')
        .insert(record)

      if (error) {
        throw new Error(error.message)
      }

      return true
    } catch (error) {
      throw error
    }
  }

  async processCsvFile(filePath) {
    console.log(`📁 Processando arquivo tabelafipe.csv: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`)
    }

    return new Promise((resolve, reject) => {
      let lineCount = 0
      let batchCount = 0
      const records = []

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          lineCount++

          try {
            // Mapear colunas específicas do tabelafipe.csv
            const marca = this.cleanString(row['Brand Value'] || '')
            const modelo = this.cleanString(row['Model Value'] || '')
            const yearValue = row['Year Value'] || ''
            const codigoFipe = this.cleanString(row['Fipe Code'] || '')
            const price = row['Price'] || ''
            const month = row['Month'] || ''

            // Processar ano e combustível
            const { year, fuel } = this.parseYearValue(yearValue)

            // Validar dados obrigatórios
            if (!marca || !modelo || !year || !codigoFipe) {
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

            // Processar em lotes pequenos
            if (records.length >= this.batchSize) {
              batchCount++
              console.log(`   🔄 Processando lote ${batchCount} (${records.length} registros) - Linha ${lineCount}`)
              
              for (const record of records) {
                try {
                  await this.insertRecord(record)
                  this.stats.inserted++
                  console.log(`         ✅ Inserido: ${record.marca} ${record.modelo} ${record.ano}`)
                } catch (error) {
                  if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
                    this.stats.skipped++
                    console.log(`         ⏭️  Duplicado: ${record.marca} ${record.modelo} ${record.ano}`)
                  } else {
                    this.stats.errors++
                    console.log(`         ❌ Erro: ${record.marca} ${record.modelo} ${record.ano} - ${error.message}`)
                  }
                }
                
                // Pequena pausa entre inserções
                await this.sleep(100)
              }
              
              records.length = 0
              
              // Pausa entre lotes
              await this.sleep(500)
            }

          } catch (error) {
            console.log(`         ❌ Erro ao processar linha ${lineCount}: ${error.message}`)
            this.stats.errors++
          }
        })
        .on('end', async () => {
          try {
            // Processar último lote
            if (records.length > 0) {
              batchCount++
              console.log(`   🔄 Processando lote final ${batchCount} (${records.length} registros)`)
              
              for (const record of records) {
                try {
                  await this.insertRecord(record)
                  this.stats.inserted++
                  console.log(`         ✅ Inserido: ${record.marca} ${record.modelo} ${record.ano}`)
                } catch (error) {
                  if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
                    this.stats.skipped++
                    console.log(`         ⏭️  Duplicado: ${record.marca} ${record.modelo} ${record.ano}`)
                  } else {
                    this.stats.errors++
                    console.log(`         ❌ Erro: ${record.marca} ${record.modelo} ${record.ano} - ${error.message}`)
                  }
                }
                
                await this.sleep(100)
              }
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

    console.log('\n🎉 IMPORTAÇÃO CONCLUÍDA!')
    console.log('\n📊 RELATÓRIO FINAL:')
    console.log(`  - Tempo total: ${minutes}m ${seconds}s`)
    console.log(`  - Total de registros processados: ${this.stats.totalRecords}`)
    console.log(`  - Registros inseridos: ${this.stats.inserted}`)
    console.log(`  - Registros duplicados (pulados): ${this.stats.skipped}`)
    console.log(`  - Erros: ${this.stats.errors}`)

    this.verifyFinalCount()
  }

  async verifyFinalCount() {
    try {
      const { count } = await supabase
        .from('ocar_transbordo')
        .select('*', { count: 'exact', head: true })
      
      console.log(`\n📈 Total de registros na tabela ocar_transbordo: ${count}`)
      
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
      console.log('   Uso: node scripts/import-missing-records.js <caminho-do-arquivo.csv>')
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
  const importer = new MissingRecordsImporter()
  await importer.run()
}

main()

