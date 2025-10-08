import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import csv from 'csv-parser'
import { Readable } from 'stream'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Configurações
const BATCH_SIZE = 500 // Reduzido para evitar timeout
const REFERENCE_MONTH = 'outubro de 2025'

// Função para limpar e converter dados
function cleanData(row: any) {
  try {
    // Verificar se as colunas necessárias existem
    if (!row['Brand Value'] || !row['Model Value'] || !row['Year Code'] || !row['Fipe Code'] || !row['Price']) {
      throw new Error('Colunas obrigatórias ausentes')
    }

    // Converter preço de "R$ 14.105,00" para número
    let priceStr = row['Price'].toString().trim()
    if (!priceStr.startsWith('R$')) {
      throw new Error('Formato de preço inválido')
    }
    
    priceStr = priceStr.replace('R$ ', '').replace('.', '').replace(',', '.')
    const price = parseFloat(priceStr)
    
    if (isNaN(price) || price <= 0) {
      throw new Error('Preço inválido')
    }
    
    // Extrair ano do formato "1991-1" para apenas "1991"
    const yearCode = row['Year Code'].toString().trim()
    if (!yearCode.includes('-')) {
      throw new Error('Formato de ano inválido')
    }
    
    const year = parseInt(yearCode.split('-')[0])
    if (isNaN(year) || year < 1900 || year > 2030) {
      throw new Error('Ano inválido')
    }
    
    return {
      marca: row['Brand Value'].toString().trim(),
      modelo: row['Model Value'].toString().trim(),
      ano: year,
      codigo_fipe: row['Fipe Code'].toString().trim(),
      referencia_mes: REFERENCE_MONTH,
      preco: price,
      processado: false
    }
  } catch (error: any) {
    console.error('Erro ao limpar dados:', error.message, row)
    throw error
  }
}

// Função para inserir dados em lotes
async function insertBatch(data: any[]) {
  try {
    const { data: result, error } = await supabase
      .from('ocar_transbordo')
      .insert(data)
    
    if (error) {
      console.error('Erro ao inserir lote:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro na inserção:', error)
    return false
  }
}

// Função para processar CSV
async function processCsvFile(file: File) {
  return new Promise((resolve, reject) => {
    let batch: any[] = []
    let totalProcessed = 0
    let totalInserted = 0
    let errors = 0
    let errorDetails: string[] = []

    const stream = Readable.fromWeb(file.stream() as any)
    
    stream
      .pipe(csv())
      .on('data', async (row) => {
        try {
          const cleanRow = cleanData(row)
          batch.push(cleanRow)
          
          // Processar lote quando atingir o tamanho definido
          if (batch.length >= BATCH_SIZE) {
            const success = await insertBatch([...batch])
            if (success) {
              totalInserted += batch.length
              console.log(`✅ Lote inserido: ${batch.length} registros`)
            } else {
              errors += batch.length
              console.log(`❌ Erro no lote: ${batch.length} registros`)
            }
            
            batch = []
          }
          
          totalProcessed++
        } catch (error: any) {
          errors++
          errorDetails.push(`Linha ${totalProcessed + 1}: ${error.message}`)
          console.error(`Erro na linha ${totalProcessed + 1}:`, error.message)
        }
      })
      .on('end', async () => {
        // Processar último lote se houver dados restantes
        if (batch.length > 0) {
          const success = await insertBatch(batch)
          if (success) {
            totalInserted += batch.length
            console.log(`✅ Último lote inserido: ${batch.length} registros`)
          } else {
            errors += batch.length
            console.log(`❌ Erro no último lote: ${batch.length} registros`)
          }
        }
        
        console.log('🎉 Processamento concluído!')
        console.log(`📊 Total processado: ${totalProcessed}`)
        console.log(`✅ Total inserido: ${totalInserted}`)
        console.log(`❌ Total erros: ${errors}`)
        
        resolve({
          totalProcessed,
          totalInserted,
          errors,
          successRate: totalProcessed > 0 ? ((totalInserted / totalProcessed) * 100).toFixed(2) : '0',
          errorDetails: errorDetails.slice(0, 10) // Primeiros 10 erros para debug
        })
      })
      .on('error', (error) => {
        console.error('Erro ao processar CSV:', error)
        reject(error)
      })
  })
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se é admin (opcional - pode ser removido se já verificado no middleware)
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Arquivo deve ser CSV' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo (reduzido para evitar erro 413)
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json(
        { error: 'Arquivo muito grande (máximo 10MB). Use o script de terminal para arquivos maiores.' },
        { status: 400 }
      )
    }

    console.log(`🚀 Iniciando processamento do arquivo: ${file.name}`)
    console.log(`📁 Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB`)

    // Processar arquivo CSV
    const result = await processCsvFile(file) as any

    console.log('🎉 Processamento concluído!')
    console.log(`📊 Estatísticas:`, result)

    return NextResponse.json({
      success: true,
      message: 'Importação concluída com sucesso',
      totalRecords: result.totalProcessed,
      processedRecords: result.totalInserted,
      errors: result.errors,
      successRate: result.successRate,
      errorDetails: result.errorDetails
    })

  } catch (error: any) {
    console.error('❌ Erro na API de upload:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
