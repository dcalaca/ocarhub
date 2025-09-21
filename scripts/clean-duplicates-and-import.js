// Script para limpar duplicatas e importar apenas registros únicos
// Execute: node scripts/clean-duplicates-and-import.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class CleanAndImport {
  constructor() {
    this.stats = {
      duplicatesRemoved: 0,
      totalRecords: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      startTime: Date.now()
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async cleanDuplicates() {
    console.log('🧹 Limpando duplicatas existentes...')
    
    try {
      // Buscar duplicatas baseadas em marca, modelo, ano e codigo_fipe
      const { data: duplicates, error: findError } = await supabase
        .from('ocar_transbordo')
        .select('marca, modelo, ano, codigo_fipe, id, created_at')
        .order('marca, modelo, ano, codigo_fipe, created_at')

      if (findError) {
        throw new Error(`Erro ao buscar duplicatas: ${findError.message}`)
      }

      if (!duplicates || duplicates.length === 0) {
        console.log('✅ Nenhuma duplicata encontrada.')
        return
      }

      // Agrupar por chave única (marca, modelo, ano, codigo_fipe)
      const groups = {}
      duplicates.forEach(record => {
        const key = `${record.marca}|${record.modelo}|${record.ano}|${record.codigo_fipe}`
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(record)
      })

      // Para cada grupo, manter apenas o primeiro registro (mais antigo)
      let duplicatesToRemove = []
      Object.values(groups).forEach(group => {
        if (group.length > 1) {
          // Ordenar por created_at e manter apenas o primeiro
          group.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          // Adicionar os demais para remoção
          duplicatesToRemove.push(...group.slice(1))
        }
      })

      console.log(`📊 Encontradas ${duplicatesToRemove.length} duplicatas para remoção`)

      // Remover duplicatas em lotes
      const batchSize = 100
      for (let i = 0; i < duplicatesToRemove.length; i += batchSize) {
        const batch = duplicatesToRemove.slice(i, i + batchSize)
        const ids = batch.map(record => record.id)
        
        const { error: deleteError } = await supabase
          .from('ocar_transbordo')
          .delete()
          .in('id', ids)

        if (deleteError) {
          console.log(`⚠️  Erro ao remover lote de duplicatas: ${deleteError.message}`)
        } else {
          console.log(`   ✅ Removidas ${batch.length} duplicatas (${i + 1}-${Math.min(i + batchSize, duplicatesToRemove.length)})`)
        }

        await this.sleep(200) // Pausa entre lotes
      }

      this.stats.duplicatesRemoved = duplicatesToRemove.length
      console.log(`✅ Limpeza concluída! ${duplicatesToRemove.length} duplicatas removidas.`)

    } catch (error) {
      console.log(`❌ Erro ao limpar duplicatas: ${error.message}`)
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

  async checkIfExists(marca, modelo, ano, codigo_fipe) {
    try {
      const { data, error } = await supabase
        .from('ocar_transbordo')
        .select('id')
        .eq('marca', marca)
        .eq('modelo', modelo)
        .eq('ano', ano)
        .eq('codigo_fipe', codigo_fipe)
        .limit(1)

      if (error) {
        throw new Error(`Erro ao verificar existência: ${error.message}`)
      }

      return data && data.length > 0
    } catch (error) {
      console.log(`⚠️  Erro ao verificar existência: ${error.message}`)
      return false
    }
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

            // Verificar se já existe
            const exists = await this.checkIfExists(marca, modelo, year, codigoFipe)
            if (exists) {
              this.stats.skipped++
              if (this.stats.skipped % 100 === 0) {
                console.log(`   ⏭️  ${this.stats.skipped} registros já existem...`)
              }
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

            await this.insertRecord(record)
            this.stats.inserted++
            this.stats.totalRecords++

            if (this.stats.inserted % 50 === 0) {
              console.log(`   ✅ ${this.stats.inserted} registros inseridos...`)
            }

            // Pequena pausa para evitar sobrecarga
            await this.sleep(50)

          } catch (error) {
            console.log(`         ❌ Erro ao processar linha ${lineCount}: ${error.message}`)
            this.stats.errors++
          }
        })
        .on('end', async () => {
          try {
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

    console.log('\n🎉 PROCESSO CONCLUÍDO!')
    console.log('\n📊 RELATÓRIO FINAL:')
    console.log(`  - Tempo total: ${minutes}m ${seconds}s`)
    console.log(`  - Duplicatas removidas: ${this.stats.duplicatesRemoved}`)
    console.log(`  - Total de registros processados: ${this.stats.totalRecords}`)
    console.log(`  - Registros inseridos: ${this.stats.inserted}`)
    console.log(`  - Registros já existentes (pulados): ${this.stats.skipped}`)
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
    console.log(`   - URL Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado'}`)
    console.log('')

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('⚠️  ATENÇÃO: Supabase não configurado!')
      return
    }

    const csvFile = process.argv[2]
    if (!csvFile) {
      console.log('❌ Arquivo CSV não especificado!')
      console.log('   Uso: node scripts/clean-duplicates-and-import.js <caminho-do-arquivo.csv>')
      return
    }

    try {
      // Primeiro limpar duplicatas
      await this.cleanDuplicates()
      
      // Depois importar registros únicos
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
  const importer = new CleanAndImport()
  await importer.run()
}

main()
