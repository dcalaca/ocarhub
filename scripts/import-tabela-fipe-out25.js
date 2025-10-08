const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  console.error('Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

class TabelaFipeOut25Importer {
  constructor() {
    this.stats = {
      totalRecords: 0,
      insertedRecords: 0,
      errors: 0,
      errorDetails: []
    }
    this.batchSize = 1000
  }

  // Função para limpar strings
  cleanString(str) {
    if (!str) return ''
    return str.toString().trim().replace(/"/g, '')
  }

  // Função para converter preço de "R$ 14.105,00" para número
  parsePrice(priceStr) {
    if (!priceStr) return null
    
    try {
      // Remove "R$ " e converte formato brasileiro para decimal
      let cleanPrice = priceStr.toString().trim()
      cleanPrice = cleanPrice.replace('R$ ', '').replace(/\./g, '').replace(',', '.')
      
      const price = parseFloat(cleanPrice)
      return isNaN(price) ? null : price
    } catch (error) {
      return null
    }
  }

  // Função para extrair ano do formato "1991-1"
  parseYear(yearCode) {
    if (!yearCode) return null
    
    try {
      const yearStr = yearCode.toString().split('-')[0]
      const year = parseInt(yearStr)
      return (year >= 1900 && year <= 2030) ? year : null
    } catch (error) {
      return null
    }
  }

  // Função para processar mês de referência
  parseReferenceMonth(monthStr) {
    if (!monthStr) return 'outubro de 2025'
    
    // Mapear meses em português para formato YYYY-MM
    const monthMap = {
      'janeiro': '01',
      'fevereiro': '02', 
      'março': '03',
      'abril': '04',
      'maio': '05',
      'junho': '06',
      'julho': '07',
      'agosto': '08',
      'setembro': '09',
      'outubro': '10',
      'novembro': '11',
      'dezembro': '12'
    }
    
    const monthLower = monthStr.toLowerCase()
    for (const [monthName, monthNum] of Object.entries(monthMap)) {
      if (monthLower.includes(monthName)) {
        return `2025-${monthNum}`
      }
    }
    
    return '2025-10' // Default para outubro de 2025
  }

  // Função para inserir dados em lotes
  async insertBatch(batchData) {
    try {
      console.log(`   🔄 Inserindo lote de ${batchData.length} registros...`)
      
      const { data, error } = await supabase
        .from('ocar_transbordo')
        .insert(batchData)
        .select('id')

      if (error) {
        console.error(`   ❌ Erro ao inserir lote:`, error.message)
        this.stats.errors += batchData.length
        this.stats.errorDetails.push(`Erro no lote: ${error.message}`)
        return false
      }

      this.stats.insertedRecords += batchData.length
      console.log(`   ✅ Lote inserido com sucesso: ${batchData.length} registros`)
      return true

    } catch (error) {
      console.error(`   ❌ Erro na inserção:`, error.message)
      this.stats.errors += batchData.length
      this.stats.errorDetails.push(`Erro na inserção: ${error.message}`)
      return false
    }
  }

  // Função principal para processar o arquivo CSV
  async processCsvFile(filePath) {
    console.log(`📁 Processando arquivo: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`)
    }

    return new Promise((resolve, reject) => {
      const records = []
      let batchCount = 0
      let lineNumber = 0

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            lineNumber++
            
            // Mapear colunas do CSV para estrutura da tabela
            const marca = this.cleanString(row['Brand Value'])
            const modelo = this.cleanString(row['Model Value'])
            const ano = this.parseYear(row['Year Code'])
            const codigoFipe = this.cleanString(row['Fipe Code'])
            const preco = this.parsePrice(row['Price'])
            const referenciaMes = this.parseReferenceMonth(row['Month'])

            // Validar dados obrigatórios
            if (!marca || !modelo || !ano || !codigoFipe) {
              console.log(`   ⚠️  Linha ${lineNumber}: Dados obrigatórios ausentes - ${marca} ${modelo} ${ano} ${codigoFipe}`)
              this.stats.errors++
              this.stats.errorDetails.push(`Linha ${lineNumber}: Dados obrigatórios ausentes`)
              return
            }

            const record = {
              marca: marca,
              modelo: modelo,
              ano: ano,
              codigo_fipe: codigoFipe,
              referencia_mes: referenciaMes,
              preco: preco,
              processado: false
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
            console.error(`   ❌ Erro na linha ${lineNumber}:`, error.message)
            this.stats.errors++
            this.stats.errorDetails.push(`Linha ${lineNumber}: ${error.message}`)
          }
        })
        .on('end', async () => {
          try {
            // Processar último lote se houver dados restantes
            if (records.length > 0) {
              batchCount++
              console.log(`   🔄 Processando último lote ${batchCount} (${records.length} registros)`)
              await this.insertBatch([...records])
            }

            console.log('\n🎉 Processamento concluído!')
            console.log(`📊 Estatísticas:`)
            console.log(`   Total processado: ${this.stats.totalRecords}`)
            console.log(`   Importados: ${this.stats.insertedRecords}`)
            console.log(`   Erros: ${this.stats.errors}`)
            console.log(`   Taxa de sucesso: ${((this.stats.insertedRecords / this.stats.totalRecords) * 100).toFixed(2)}%`)

            if (this.stats.errorDetails.length > 0) {
              console.log(`\n❌ Primeiros erros encontrados:`)
              this.stats.errorDetails.slice(0, 10).forEach(error => {
                console.log(`   ${error}`)
              })
            }

            resolve(this.stats)

          } catch (error) {
            console.error('❌ Erro no final do processamento:', error.message)
            reject(error)
          }
        })
        .on('error', (error) => {
          console.error('❌ Erro ao ler arquivo:', error.message)
          reject(error)
        })
    })
  }

  // Função para verificar se a tabela existe
  async checkTable() {
    try {
      const { data, error } = await supabase
        .from('ocar_transbordo')
        .select('count')
        .limit(1)

      if (error) {
        console.error('❌ Erro ao verificar tabela:', error.message)
        return false
      }

      console.log('✅ Tabela ocar_transbordo encontrada')
      return true
    } catch (error) {
      console.error('❌ Erro na verificação:', error.message)
      return false
    }
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando importação da Tabela FIPE Out25...\n')

  const importer = new TabelaFipeOut25Importer()

  try {
    // Verificar se a tabela existe
    console.log('1️⃣ Verificando tabela ocar_transbordo...')
    const tableExists = await importer.checkTable()
    if (!tableExists) {
      console.error('❌ Tabela ocar_transbordo não encontrada!')
      console.error('Execute primeiro o script de criação da tabela.')
      process.exit(1)
    }

    // Processar arquivo CSV
    console.log('\n2️⃣ Processando arquivo CSV...')
    const filePath = 'TabelaFipe/tabela-fipe-out25.csv'
    const result = await importer.processCsvFile(filePath)

    console.log('\n🎉 Importação concluída com sucesso!')
    console.log(`📊 Resultado final:`)
    console.log(`   Total processado: ${result.totalRecords}`)
    console.log(`   Importados: ${result.insertedRecords}`)
    console.log(`   Erros: ${result.errors}`)
    console.log(`   Taxa de sucesso: ${((result.insertedRecords / result.totalRecords) * 100).toFixed(2)}%`)

  } catch (error) {
    console.error('❌ Erro na importação:', error.message)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = TabelaFipeOut25Importer
