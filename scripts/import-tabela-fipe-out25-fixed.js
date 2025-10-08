const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
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

class TabelaFipeOut25ImporterFixed {
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
    if (!monthStr) return '2025-10'
    
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

  // Função para processar linha CSV manualmente (devido ao formato especial)
  parseCsvLine(line) {
    try {
      // Remove aspas externas e quebra em campos
      const cleanLine = line.trim()
      if (!cleanLine.startsWith('"') || !cleanLine.endsWith('"')) {
        throw new Error('Formato de linha inválido')
      }
      
      // Remove aspas externas
      const content = cleanLine.slice(1, -1)
      
      // Divide por vírgulas, mas precisa tratar aspas internas nos preços
      const fields = []
      let currentField = ''
      let inQuotes = false
      
      for (let i = 0; i < content.length; i++) {
        const char = content[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim())
          currentField = ''
        } else {
          currentField += char
        }
      }
      
      // Adicionar último campo
      fields.push(currentField.trim())
      
      // Verificar se temos pelo menos 12 campos
      if (fields.length < 12) {
        throw new Error(`Número insuficiente de campos: ${fields.length}`)
      }
      
      return {
        type: fields[0],
        brandCode: fields[1],
        brandValue: fields[2],
        modelCode: fields[3],
        modelValue: fields[4],
        yearCode: fields[5],
        yearValue: fields[6],
        fipeCode: fields[7],
        fuelLetter: fields[8],
        fuelType: fields[9],
        price: fields[10],
        month: fields[11]
      }
    } catch (error) {
      throw new Error(`Erro ao processar linha: ${error.message}`)
    }
  }

  // Função principal para processar o arquivo CSV
  async processCsvFile(filePath) {
    console.log(`📁 Processando arquivo: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`)
    }

    try {
      const records = []
      let batchCount = 0
      let lineNumber = 0

      const fileContent = fs.readFileSync(filePath, 'utf8')
      const lines = fileContent.split('\n')

      // Pular cabeçalho
      const dataLines = lines.slice(1).filter(line => line.trim())

      console.log(`📊 Total de linhas de dados: ${dataLines.length}`)

      // Processar todas as linhas
      for (const line of dataLines) {
        try {
          lineNumber++
          
          // Processar linha CSV manualmente
          const parsedLine = this.parseCsvLine(line)
          
          // Mapear para estrutura da tabela
          const marca = this.cleanString(parsedLine.brandValue)
          const modelo = this.cleanString(parsedLine.modelValue)
          const ano = this.parseYear(parsedLine.yearCode)
          const codigoFipe = this.cleanString(parsedLine.fipeCode)
          const preco = this.parsePrice(parsedLine.price)
          const referenciaMes = this.parseReferenceMonth(parsedLine.month)

          // Validar dados obrigatórios
          if (!marca || !modelo || !ano || !codigoFipe) {
            console.log(`   ⚠️  Linha ${lineNumber}: Dados obrigatórios ausentes - ${marca} ${modelo} ${ano} ${codigoFipe}`)
            this.stats.errors++
            this.stats.errorDetails.push(`Linha ${lineNumber}: Dados obrigatórios ausentes`)
            continue
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
      }

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

      return this.stats
    } catch (error) {
      console.error('❌ Erro no processamento:', error.message)
      throw error
    }
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
  console.log('🚀 Iniciando importação da Tabela FIPE Out25 (versão corrigida)...\n')

  const importer = new TabelaFipeOut25ImporterFixed()

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

module.exports = TabelaFipeOut25ImporterFixed
