// Script para limpar tudo e importar dados frescos
// Execute: node scripts/clean-and-import-fresh.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class CleanAndImportFresh {
  constructor() {
    this.stats = {
      totalRecords: 0,
      inserted: 0,
      errors: 0,
      startTime: Date.now()
    }
    this.batchSize = 100 // Lotes maiores para importação limpa
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async cleanTable() {
    console.log('🧹 Limpando tabela ocar_transbordo completamente...')
    
    try {
      const { error } = await supabase
        .from('ocar_transbordo')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar tudo

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

  async insertBatch(batchData) {
    try {
      const { error } = await supabase
        .from('ocar_transbordo')
        .insert(batchData)

      if (error) {
        throw new Error(error.message)
      }

      this.stats.inserted += batchData.length
      console.log(`         ✅ Lote inserido: ${batchData.length} registros`)
      return true
    } catch (error) {
      console.log(`         ❌ Erro ao inserir lote: ${error.message}`)
      this.stats.errors += batchData.length
      return false
    }
  }

  async processCsvFile(filePath) {
    console.log(`📁 Processando arquivo tabelafipe.csv: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`)
    }

    return new Promise((resolve, reject) => {
      const records = []
      let batchCount = 0
      let lineCount = 0

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
              console.log(`         ⚠️  Registro inválido ignorado (linha ${lineCount}): ${marca} ${modelo} ${year} ${codigoFipe}`)
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
              console.log(`   🔄 Processando lote ${batchCount} (${records.length} registros) - Linha ${lineCount}`)
              await this.insertBatch([...records])
              records.length = 0
              
              // Pausa entre lotes
              await this.sleep(200)
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

    console.log('\n🎉 IMPORTAÇÃO FRESCA CONCLUÍDA!')
    console.log('\n📊 RELATÓRIO FINAL:')
    console.log(`  - Tempo total: ${minutes}m ${seconds}s`)
    console.log(`  - Total de registros processados: ${this.stats.totalRecords}`)
    console.log(`  - Registros inseridos: ${this.stats.inserted}`)
    console.log(`  - Erros: ${this.stats.errors}`)

    if (this.stats.errors > 0) {
      console.log('\n⚠️  Alguns erros ocorreram durante a importação.')
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
      console.log('   Uso: node scripts/clean-and-import-fresh.js <caminho-do-arquivo.csv>')
      console.log('   Exemplo: node scripts/clean-and-import-fresh.js "C:\\Users\\dougl\\Downloads\\tabelafipe.csv"')
      return
    }

    try {
      // Primeiro limpar a tabela
      await this.cleanTable()
      
      // Depois importar todos os dados
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
  const importer = new CleanAndImportFresh()
  await importer.run()
}

main()
