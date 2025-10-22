const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://kfsteismyqpekbaqwuez.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw'
)

async function verificarStatusPagamento() {
  try {
    console.log('🔍 Verificando status do pagamento...')
    
    // Buscar transações recentes
    const { data: transacoes, error: transError } = await supabase
      .from('ocar_transacoes')
      .select('*')
      .eq('metodo_pagamento', 'mercadopago')
      .order('created_at', { ascending: false })
      .limit(5)

    if (transError) {
      console.error('❌ Erro ao buscar transações:', transError)
      return
    }

    console.log(`\n📊 ÚLTIMAS ${transacoes.length} TRANSAÇÕES MERCADO PAGO:`)
    console.log('=' .repeat(60))

    transacoes.forEach((trans, i) => {
      console.log(`\n${i+1}. TRANSAÇÃO ID: ${trans.id}`)
      console.log(`   💰 Valor: R$ ${trans.valor}`)
      console.log(`   📊 Status: ${trans.status}`)
      console.log(`   📅 Data: ${new Date(trans.created_at).toLocaleString('pt-BR')}`)
      console.log(`   📝 Descrição: ${trans.descricao}`)
      console.log(`   🆔 Referência: ${trans.referencia_id}`)
      console.log(`   👤 Usuário: ${trans.usuario_id}`)
    })

    // Buscar veículos pendentes
    const { data: veiculosPendentes, error: veicError } = await supabase
      .from('ocar_vehicles')
      .select('id, marca, modelo, preco, status, created_at, dono_id')
      .eq('status', 'pendente_pagamento')
      .order('created_at', { ascending: false })

    if (veicError) {
      console.error('❌ Erro ao buscar veículos:', veicError)
      return
    }

    console.log(`\n🚗 VEÍCULOS PENDENTES DE PAGAMENTO: ${veiculosPendentes.length}`)
    console.log('=' .repeat(60))

    veiculosPendentes.forEach((veiculo, i) => {
      console.log(`\n${i+1}. VEÍCULO ID: ${veiculo.id}`)
      console.log(`   🚗 ${veiculo.marca} ${veiculo.modelo}`)
      console.log(`   💰 R$ ${veiculo.preco}`)
      console.log(`   📊 Status: ${veiculo.status}`)
      console.log(`   📅 Criado: ${new Date(veiculo.created_at).toLocaleString('pt-BR')}`)
      console.log(`   👤 Usuário: ${veiculo.dono_id}`)
    })

    // Verificar se há inconsistências
    if (transacoes.length > 0 && veiculosPendentes.length > 0) {
      console.log('\n⚠️ POSSÍVEL PROBLEMA:')
      console.log('   • Há transações aprovadas')
      console.log('   • Mas ainda há veículos pendentes')
      console.log('   • Webhook pode não estar funcionando')
    }

    if (transacoes.length === 0) {
      console.log('\n❌ PROBLEMA IDENTIFICADO:')
      console.log('   • Nenhuma transação encontrada')
      console.log('   • Webhook não está sendo chamado')
      console.log('   • Verificar configuração do webhook')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

verificarStatusPagamento()
