import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import csv from 'csv-parser'
import { Readable } from 'stream'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Configurações
const BATCH_SIZE = 1000
const REFERENCE_MONTH = 'outubro de 2025'

// Função para limpar e converter dados
function cleanData(row: any) {
  // Converter preço de "R$ 14.105,00" para número
  const priceStr = row.Price.replace('R$ ', '').replace('.', '').replace(',', '.')
  const price = parseFloat(priceStr)
  
  // Extrair ano do formato "1991-1" para apenas "1991"
  const year = parseInt(row['Year Code'].split('-')[0])
  
  return {
    marca: row['Brand Value'].trim(),
    modelo: row['Model Value'].trim(),
    ano: year,
    codigo_fipe: row['Fipe Code'].trim(),
    referencia_mes: REFERENCE_MONTH,
    preco: price,
    processado: false
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
            } else {
              errors += batch.length
            }
            
            batch = []
          }
          
          totalProcessed++
        } catch (error) {
          console.error('Erro ao processar linha:', error, row)
          errors++
        }
      })
      .on('end', async () => {
        // Processar último lote se houver dados restantes
        if (batch.length > 0) {
          const success = await insertBatch(batch)
          if (success) {
            totalInserted += batch.length
          } else {
            errors += batch.length
          }
        }
        
        resolve({
          totalProcessed,
          totalInserted,
          errors,
          successRate: ((totalInserted / totalProcessed) * 100).toFixed(2)
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

    // Validar tamanho do arquivo
    if (file.size > 50 * 1024 * 1024) { // 50MB
      return NextResponse.json(
        { error: 'Arquivo muito grande (máximo 50MB)' },
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
      successRate: result.successRate
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
