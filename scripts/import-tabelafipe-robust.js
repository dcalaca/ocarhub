// Script robusto para importar tabelafipe.csv com retry e controle de memória
// Execute: node scripts/import-tabelafipe-robust.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class RobustTabelaFipeImporter {
  constructor() {
    this.stats = {
      totalRecords: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      startTime: Date.now(),
      lastProcessedLine: 0
    }
    this.batchSize = 50 // Lotes menores para evitar problemas de memória
    this.maxRetries = 3
    this.retryDelay = 2000 // 2 segundos
    this.progressFile = 'import-progress.json'
  }

  async loadProgress() {
    try {
      if (fs.existsSync(this.progressFile)) {
        const data = fs.readFileSync(this.progressFile, 'utf8')
        const progress = JSON.parse(data)
        this.stats = { ...this.stats, ...progress }
        console.log(`📂 Progresso carregado: linha ${this.stats.lastProcessedLine}`)
        return true
      }
    } catch (error) {
      console.log('⚠️  Erro ao carregar progresso:', error.message)
    }
    return false
  }

  async saveProgress() {
    try {
      const progress = {
        totalRecords: this.stats.totalRecords,
        inserted: this.stats.inserted,
        skipped: this.stats.skipped,
        errors: this.stats.errors,
        lastProcessedLine: this.stats.lastProcessedLine,
        startTime: this.stats.startTime
      }
      fs.writeFileSync(this.progressFile, JSON.stringify(progress, null, 2))
    } catch (error) {
      console.log('⚠️  Erro ao salvar progresso:', error.message)
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async retryOperation(operation, maxRetries = this.maxRetries) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }
        console.log(`         🔄 Tentativa ${attempt} falhou, tentando novamente em ${this.retryDelay}ms...`)
        await this.sleep(this.retryDelay)
      }
    }
  }

  async checkDuplicate(marca, modelo, ano, codigo_fipe) {
    return await this.retryOperation(async () => {
      const { data, error } = await supabase
        .from('ocar_transbordo')
        .select('id')
        .eq('marca', marca)
        .eq('modelo', modelo)
        .eq('ano', ano)
        .eq('codigo_fipe', codigo_fipe)
        .limit(1)

      if (error) {
        throw new Error(`Erro ao verificar duplicidade: ${error.message}`)
      }

      return data && data.length > 0
    })
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
        await this.retryOperation(async () => {
          const { error } = await supabase
            .from('ocar_transbordo')
            .insert(record)

          if (error) {
            throw new Error(error.message)
          }
        })

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
    console.log(`📁 Processando arquivo tabelafipe.csv: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`)
    }

    // Carregar progresso anterior se existir
    await this.loadProgress()

    return new Promise((resolve, reject) => {
      const records = []
      let batchCount = 0
      let lineCount = 0

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          lineCount++
          
          // Pular linhas já processadas
          if (lineCount <= this.stats.lastProcessedLine) {
            return
          }

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

            // Processar em lotes menores
            if (records.length >= this.batchSize) {
              batchCount++
              console.log(`   🔄 Processando lote ${batchCount} (${records.length} registros) - Linha ${lineCount}`)
              await this.insertBatch([...records])
              records.length = 0
              
              // Salvar progresso a cada lote
              this.stats.lastProcessedLine = lineCount
              await this.saveProgress()
              
              // Pequena pausa para evitar sobrecarga
              await this.sleep(100)
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

            // Marcar como concluído
            this.stats.lastProcessedLine = lineCount
            await this.saveProgress()

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

    console.log('\n🎉 IMPORTAÇÃO TABELAFIPE.CSV CONCLUÍDA!')
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
    console.log(`   - Máximo de tentativas: ${this.maxRetries}`)
    console.log(`   - Delay entre tentativas: ${this.retryDelay}ms`)
    console.log(`   - URL Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado'}`)
    console.log('')

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('⚠️  ATENÇÃO: Supabase não configurado!')
      return
    }

    const csvFile = process.argv[2]
    if (!csvFile) {
      console.log('❌ Arquivo CSV não especificado!')
      console.log('   Uso: node scripts/import-tabelafipe-robust.js <caminho-do-arquivo.csv>')
      console.log('   Exemplo: node scripts/import-tabelafipe-robust.js "C:\\Users\\dougl\\Downloads\\tabelafipe.csv"')
      return
    }

    try {
      await this.processCsvFile(csvFile)
      this.printFinalStats()
      
      // Limpar arquivo de progresso após conclusão
      if (fs.existsSync(this.progressFile)) {
        fs.unlinkSync(this.progressFile)
        console.log('\n🧹 Arquivo de progresso removido.')
      }
    } catch (error) {
      console.error('❌ Erro fatal:', error.message)
      this.stats.errors++
      console.log('\n💾 Progresso salvo. Execute novamente para continuar de onde parou.')
    }
  }
}

// Executar script
async function main() {
  const importer = new RobustTabelaFipeImporter()
  await importer.run()
}

main()

