const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Função para obter o mês de referência mais recente
async function getLatestReferenceMonth() {
  try {
    const { data, error } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .order('referencia_mes', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Erro ao buscar mês mais recente:', error)
      return null
    }

    return data?.referencia_mes
  } catch (error) {
    console.error('Erro na consulta:', error)
    return null
  }
}

// Função para verificar quantos registros existem por mês
async function getReferenceMonthStats() {
  try {
    const { data, error } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .order('referencia_mes', { ascending: false })

    if (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return null
    }

    // Contar registros por mês
    const stats = {}
    data?.forEach(item => {
      const month = item.referencia_mes
      stats[month] = (stats[month] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error('Erro na consulta:', error)
    return null
  }
}

// Função principal
async function main() {
  console.log('🔍 Verificando mês de referência mais recente...\n')

  try {
    // 1. Obter mês mais recente
    const latestMonth = await getLatestReferenceMonth()
    console.log(`📅 Mês de referência mais recente: ${latestMonth}`)

    // 2. Obter estatísticas por mês
    const stats = await getReferenceMonthStats()
    if (stats) {
      console.log('\n📊 Estatísticas por mês de referência:')
      Object.entries(stats)
        .sort(([a], [b]) => b.localeCompare(a)) // Ordenar por mês (mais recente primeiro)
        .forEach(([month, count]) => {
          const isLatest = month === latestMonth
          const indicator = isLatest ? '🆕' : '📋'
          console.log(`   ${indicator} ${month}: ${count.toLocaleString()} registros`)
        })
    }

    // 3. Verificar se há dados de outubro de 2025
    if (latestMonth === '2025-10') {
      console.log('\n✅ Dados de outubro de 2025 encontrados!')
      console.log('🎯 A consulta FIPE agora mostrará o mês de referência correto.')
    } else {
      console.log('\n⚠️  Mês de referência não é outubro de 2025')
      console.log('🔧 Verifique se a importação foi feita corretamente.')
    }

  } catch (error) {
    console.error('❌ Erro na verificação:', error.message)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { getLatestReferenceMonth, getReferenceMonthStats }
