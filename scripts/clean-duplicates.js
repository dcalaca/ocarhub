// Script para limpar duplicatas da tabela ocar_transbordo
// Execute: node scripts/clean-duplicates.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanDuplicates() {
  try {
    console.log('🧹 Iniciando limpeza de duplicatas...')
    
    // Primeiro, vamos ver quantos registros temos
    const { count: totalCount, error: countError } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log('❌ Erro ao contar registros:', countError.message)
      return
    }

    console.log(`📊 Total de registros antes da limpeza: ${totalCount}`)

    // Buscar duplicatas usando uma query SQL
    console.log('🔍 Identificando duplicatas...')
    
    const { data: duplicates, error: dupError } = await supabase
      .rpc('find_duplicates')

    if (dupError) {
      console.log('❌ Erro ao buscar duplicatas:', dupError.message)
      console.log('🔄 Tentando método alternativo...')
      
      // Método alternativo: buscar duplicatas manualmente
      await cleanDuplicatesManual()
      return
    }

    if (!duplicates || duplicates.length === 0) {
      console.log('✅ Nenhuma duplicata encontrada!')
      return
    }

    console.log(`⚠️  Encontradas ${duplicates.length} duplicatas`)

    // Deletar duplicatas (manter apenas o primeiro de cada grupo)
    let deletedCount = 0
    for (const duplicate of duplicates) {
      const { error: deleteError } = await supabase
        .from('ocar_transbordo')
        .delete()
        .eq('id', duplicate.id)

      if (deleteError) {
        console.log(`❌ Erro ao deletar registro ${duplicate.id}:`, deleteError.message)
      } else {
        deletedCount++
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

async function cleanDuplicatesManual() {
  try {
    console.log('🔄 Usando método manual para limpar duplicatas...')
    
    // Buscar todos os registros
    const { data: allRecords, error: fetchError } = await supabase
      .from('ocar_transbordo')
      .select('id, marca, modelo, ano, codigo_fipe')
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.log('❌ Erro ao buscar registros:', fetchError.message)
      return
    }

    console.log(`📊 Processando ${allRecords.length} registros...`)

    // Agrupar por chave única (marca + modelo + ano + codigo_fipe)
    const seen = new Map()
    const toDelete = []

    for (const record of allRecords) {
      const key = `${record.marca}|${record.modelo}|${record.ano}|${record.codigo_fipe}`.toLowerCase()
      
      if (seen.has(key)) {
        // Este é um duplicado, marcar para deletar
        toDelete.push(record.id)
      } else {
        // Primeira ocorrência, manter
        seen.set(key, record.id)
      }
    }

    console.log(`⚠️  Encontradas ${toDelete.length} duplicatas para remover`)

    if (toDelete.length === 0) {
      console.log('✅ Nenhuma duplicata encontrada!')
      return
    }

    // Deletar duplicatas em lotes
    const batchSize = 100
    let deletedCount = 0

    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize)
      
      const { error: deleteError } = await supabase
        .from('ocar_transbordo')
        .delete()
        .in('id', batch)

      if (deleteError) {
        console.log(`❌ Erro ao deletar lote ${Math.floor(i/batchSize) + 1}:`, deleteError.message)
      } else {
        deletedCount += batch.length
        console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} deletado: ${batch.length} registros`)
      }
    }

    console.log(`✅ ${deletedCount} duplicatas removidas`)

    // Verificar resultado final
    const { count: finalCount } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Total de registros após limpeza: ${finalCount}`)

  } catch (error) {
    console.log('❌ Erro no método manual:', error.message)
  }
}

// Executar
cleanDuplicates()
