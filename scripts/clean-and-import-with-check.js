// Script para limpar e importar com verificação de duplicatas
// Execute: node scripts/clean-and-import-with-check.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class CleanAndImportWithCheck {
  constructor() {
    this.stats = {
      totalRecords: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      startTime: Date.now()
    }
    this.batchSize = 50
    this.existingRecords = new Set() // Cache de registros já inseridos
  }

  async cleanTable() {
    console.log('🧹 Limpando tabela ocar_transbordo...')
    
    try {
      const { error } = await supabase
        .from('ocar_transbordo')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) {
        throw new Error(`Erro ao limpar tabela: ${error.message}`)
      }

      console.log('✅ Tabela limpa com sucesso!')
    } catch (error) {
      console.log(`❌ Erro ao limpar tabela: ${error.message}`)
      throw error
    }
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

  createRecordKey(marca, modelo, ano, codigoFipe) {
    return `${marca}|${modelo}|${ano}|${codigoFipe}`.toLowerCase()
  }

  async insertBatch(batchData) {
    const uniqueRecords = []
    
    // Filtrar duplicatas usando cache local
    for (const record of batchData) {
      const key = this.createRecordKey(record.marca, record.modelo, record.ano, record.codigo_fipe)
      
      if (this.existingRecords.has(key)) {
        this.stats.skipped++
        continue
      }
      
      this.existingRecords.add(key)
      uniqueRecords.push(record)
    }

    if (uniqueRecords.length === 0) {
      console.log(`         ⏭️  Lote pulado (todos duplicados)`)
      return true
    }

    try {
      const { error } = await supabase
        .from('ocar_transbordo')
        .insert(uniqueRecords)

      if (error) {
        throw new Error(error.message)
      }

      this.stats.inserted += uniqueRecords.length
      console.log(`         ✅ Lote inserido: ${uniqueRecords.length} registros únicos (${this.stats.skipped} duplicados pulados)`)
      return true
    } catch (error) {
      console.log(`         ❌ Erro no lote: ${error.message}`)
      this.stats.errors += uniqueRecords.length
      return false
    }
  }

  async processCsvFile(filePath) {
    console.log(`📁 Processando: ${filePath}`)
    
    return new Promise((resolve, reject) => {
      const records = []
      let batchCount = 0
      let lineCount = 0

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          lineCount++

          try {
            const marca = this.cleanString(row['Brand Value'] || '')
            const modelo = this.cleanString(row['Model Value'] || '')
            const yearValue = row['Year Value'] || ''
            const codigoFipe = this.cleanString(row['Fipe Code'] || '')
            const price = row['Price'] || ''
            const month = row['Month'] || ''

            const { year, fuel } = this.parseYearValue(yearValue)

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

            if (records.length >= this.batchSize) {
              batchCount++
              console.log(`🔄 Processando lote ${batchCount} (linha ${lineCount})`)
              await this.insertBatch([...records])
              records.length = 0
            }

          } catch (error) {
            console.log(`❌ Erro linha ${lineCount}: ${error.message}`)
            this.stats.errors++
          }
        })
        .on('end', async () => {
          try {
            if (records.length > 0) {
              batchCount++
              console.log(`🔄 Lote final (${records.length} registros)`)
              await this.insertBatch(records)
            }

            console.log(`✅ Processamento concluído!`)
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

  printStats() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60

    console.log('\n🎉 IMPORTAÇÃO CONCLUÍDA!')
    console.log(`⏱️  Tempo total: ${minutes}m ${seconds}s`)
    console.log(`📊 Total processado: ${this.stats.totalRecords}`)
    console.log(`✅ Registros inseridos: ${this.stats.inserted}`)
    console.log(`⏭️  Duplicados pulados: ${this.stats.skipped}`)
    console.log(`❌ Erros: ${this.stats.errors}`)
    console.log(`📈 Taxa de sucesso: ${((this.stats.inserted / this.stats.totalRecords) * 100).toFixed(2)}%`)
  }

  async verifyFinalCount() {
    try {
      const { count } = await supabase
        .from('ocar_transbordo')
        .select('*', { count: 'exact', head: true })
      
      console.log(`\n📈 Total de registros na tabela: ${count}`)
      
    } catch (error) {
      console.log('❌ Erro ao verificar contagem:', error.message)
    }
  }

  async run() {
    const csvFile = process.argv[2]
    if (!csvFile) {
      console.log('❌ Arquivo CSV não especificado!')
      console.log('   Uso: node scripts/clean-and-import-with-check.js <caminho-do-arquivo.csv>')
      return
    }

    try {
      // Limpar tabela
      await this.cleanTable()
      
      // Importar com verificação
      await this.processCsvFile(csvFile)
      
      this.printStats()
      await this.verifyFinalCount()
    } catch (error) {
      console.error('❌ Erro fatal:', error.message)
    }
  }
}

// Executar
const importer = new CleanAndImportWithCheck()
importer.run()
