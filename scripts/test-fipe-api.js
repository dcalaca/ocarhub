const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Simular a consulta FIPE que será feita pela API
async function testarConsultaFipe() {
  console.log('🧪 Testando consulta FIPE com mês mais recente...\n')

  try {
    // 1. Obter mês mais recente
    const { data: latestMonthData } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .order('referencia_mes', { ascending: false })
      .limit(1)
      .single()

    const latestMonth = latestMonthData?.referencia_mes
    console.log(`📅 Mês mais recente: ${latestMonth}`)

    // 2. Testar consulta para Honda Civic 2007
    const { data, error } = await supabase
      .from('ocar_transbordo')
      .select(`
        marca,
        modelo,
        ano,
        codigo_fipe,
        referencia_mes,
        preco
      `)
      .eq('marca', 'Honda')
      .ilike('modelo', '%Civic%')
      .eq('ano', 2007)
      .eq('referencia_mes', latestMonth)
      .limit(1)

    if (error) {
      console.error('❌ Erro na consulta:', error)
      return
    }

    if (!data || data.length === 0) {
      console.log('⚠️  Nenhum resultado encontrado')
      return
    }

    // 3. Formatar resultado como a API retornará
    const resultado = data.map(item => ({
      marca: item.marca,
      modelo: item.modelo,
      ano: item.ano,
      fipe_code: item.codigo_fipe,
      reference_month: item.referencia_mes,
      price: item.preco,
      status: 'ATUAL'
    }))

    console.log('\n✅ Resultado da consulta FIPE:')
    console.log(JSON.stringify(resultado[0], null, 2))

    // 4. Verificar se o mês está correto
    if (resultado[0].reference_month === '2025-10') {
      console.log('\n🎉 SUCESSO! A consulta está retornando outubro de 2025!')
      console.log('🌐 O site agora mostrará "Referência: 2025-10" em vez de "2025-09"')
    } else {
      console.log(`\n⚠️  Atenção: Mês de referência é ${resultado[0].reference_month}`)
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

// Executar teste
testarConsultaFipe()
