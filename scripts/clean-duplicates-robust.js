// Script robusto para limpar duplicatas da tabela ocar_transbordo
// Execute: node scripts/clean-duplicates-robust.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanDuplicatesRobust() {
  try {
    console.log('🧹 Iniciando limpeza robusta de duplicatas...')
    
    // Primeiro, vamos ver quantos registros temos
    const { count: totalCount, error: countError } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log('❌ Erro ao contar registros:', countError.message)
      return
    }

    console.log(`📊 Total de registros antes da limpeza: ${totalCount}`)

    // Buscar registros em lotes para evitar limitação de memória
    const batchSize = 1000
    const seen = new Map()
    const toDelete = []
    let processedCount = 0

    console.log('🔍 Processando registros em lotes...')

    for (let offset = 0; offset < totalCount; offset += batchSize) {
      console.log(`📦 Processando lote ${Math.floor(offset/batchSize) + 1} (${offset + 1} a ${Math.min(offset + batchSize, totalCount)})`)
      
      const { data: batch, error: fetchError } = await supabase
        .from('ocar_transbordo')
        .select('id, marca, modelo, ano, codigo_fipe, created_at')
        .order('created_at', { ascending: true })
        .range(offset, offset + batchSize - 1)

      if (fetchError) {
        console.log(`❌ Erro ao buscar lote:`, fetchError.message)
        continue
      }

      if (!batch || batch.length === 0) {
        break
      }

      // Processar registros do lote
      for (const record of batch) {
        const key = `${record.marca}|${record.modelo}|${record.ano}|${record.codigo_fipe}`.toLowerCase()
        
        if (seen.has(key)) {
          // Este é um duplicado, marcar para deletar
          toDelete.push(record.id)
        } else {
          // Primeira ocorrência, manter
          seen.set(key, record.id)
        }
        processedCount++
      }

      console.log(`   ✅ Lote processado: ${batch.length} registros`)
    }

    console.log(`📊 Total processado: ${processedCount} registros`)
    console.log(`⚠️  Encontradas ${toDelete.length} duplicatas para remover`)

    if (toDelete.length === 0) {
      console.log('✅ Nenhuma duplicata encontrada!')
      return
    }

    // Deletar duplicatas em lotes
    const deleteBatchSize = 100
    let deletedCount = 0

    console.log('🗑️  Removendo duplicatas...')

    for (let i = 0; i < toDelete.length; i += deleteBatchSize) {
      const batch = toDelete.slice(i, i + deleteBatchSize)
      
      const { error: deleteError } = await supabase
        .from('ocar_transbordo')
        .delete()
        .in('id', batch)

      if (deleteError) {
        console.log(`❌ Erro ao deletar lote ${Math.floor(i/deleteBatchSize) + 1}:`, deleteError.message)
      } else {
        deletedCount += batch.length
        console.log(`✅ Lote ${Math.floor(i/deleteBatchSize) + 1} deletado: ${batch.length} registros`)
      }
    }

    console.log(`✅ ${deletedCount} duplicatas removidas`)

    // Verificar resultado final
    const { count: finalCount } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Total de registros após limpeza: ${finalCount}`)
    console.log(`🗑️  Registros removidos: ${totalCount - finalCount}`)

  } catch (error) {
    console.log('❌ Erro fatal:', error.message)
  }
}

// Executar
cleanDuplicatesRobust()
