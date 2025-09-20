// Script para importar dados de CSV para tabela ocar_transbordo
// Evita duplicidades - insere apenas registros que não existem
// Execute: node scripts/import-csv-to-transbordo.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class CsvTransbordoImporter {
  constructor() {
    this.stats = {
      totalRecords: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      startTime: Date.now()
    }
    this.batchSize = 100 // Processar em lotes
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
    console.log(`📁 Processando arquivo CSV: ${filePath}`)
    
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
            // Mapear colunas do CSV para estrutura da tabela
            // Ajuste os nomes das colunas conforme seu CSV
            const record = {
              marca: this.cleanString(row.marca || row.Marca || row.MARCA || ''),
              modelo: this.cleanString(row.modelo || row.Modelo || row.MODELO || ''),
              ano: parseInt(row.ano || row.Ano || row.ANO || row.year || row.Year || 0),
              codigo_fipe: this.cleanString(row.codigo_fipe || row.codigoFipe || row.codigo || row.CodigoFipe || row.CODIGO_FIPE || ''),
              referencia_mes: row.referencia_mes || row.referencia || row.Referencia || new Date().toISOString().slice(0, 7),
              preco: parseFloat((row.preco || row.Preco || row.PRECO || row.price || row.Price || 0).toString().replace(/[^\d,.-]/g, '').replace(',', '.')),
              processado: false
            }

            // Validar dados obrigatórios
            if (!record.marca || !record.modelo || !record.ano || !record.codigo_fipe) {
              console.log(`         ⚠️  Registro inválido ignorado: ${JSON.stringify(row)}`)
              return
            }

            records.push(record)
            this.stats.totalRecords++

            // Processar em lotes
            if (records.length >= this.batchSize) {
              batchCount++
              console.log(`   🔄 Processando lote ${batchCount} (${records.length} registros)`)
              await this.insertBatch([...records])
              records.length = 0 // Limpar array
            }

          } catch (error) {
            console.log(`         ❌ Erro ao processar linha: ${error.message}`)
            this.stats.errors++
          }
        })
        .on('end', async () => {
          try {
            // Processar último lote se houver registros restantes
            if (records.length > 0) {
              batchCount++
              console.log(`   🔄 Processando lote final ${batchCount} (${records.length} registros)`)
              await this.insertBatch(records)
            }

            console.log(`✅ Arquivo CSV processado com sucesso!`)
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

    console.log('\n🎉 IMPORTAÇÃO CSV CONCLUÍDA!')
    console.log('\n📊 RELATÓRIO FINAL:')
    console.log(`  - Tempo total: ${minutes}m ${seconds}s`)
    console.log(`  - Total de registros no CSV: ${this.stats.totalRecords}`)
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
      console.log('   Configure as variáveis no arquivo .env.local')
      return
    }

    // Verificar se o arquivo CSV foi fornecido
    const csvFile = process.argv[2]
    if (!csvFile) {
      console.log('❌ Arquivo CSV não especificado!')
      console.log('   Uso: node scripts/import-csv-to-transbordo.js <caminho-do-arquivo.csv>')
      console.log('   Exemplo: node scripts/import-csv-to-transbordo.js dados/carros.csv')
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
  const importer = new CsvTransbordoImporter()
  await importer.run()
}

main()
