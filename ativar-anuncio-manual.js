const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://kfsteismyqpekbaqwuez.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw'
)

async function ativarAnuncioManualmente() {
  try {
    console.log('🔧 Ativando anúncio manualmente...')
    
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

    if (veiculosPendentes.length === 0) {
      console.log('✅ Nenhum veículo pendente encontrado!')
      return
    }

    console.log(`\n🚗 ENCONTRADOS ${veiculosPendentes.length} VEÍCULOS PENDENTES:`)
    console.log('=' .repeat(60))

    veiculosPendentes.forEach((veiculo, i) => {
      console.log(`\n${i+1}. VEÍCULO ID: ${veiculo.id}`)
      console.log(`   🚗 ${veiculo.marca} ${veiculo.modelo}`)
      console.log(`   💰 R$ ${veiculo.preco}`)
      console.log(`   📅 Criado: ${new Date(veiculo.created_at).toLocaleString('pt-BR')}`)
      console.log(`   👤 Usuário: ${veiculo.dono_id}`)
    })

    // Ativar o mais recente
    const veiculoParaAtivar = veiculosPendentes[0]
    console.log(`\n🎯 Ativando veículo mais recente: ${veiculoParaAtivar.id}`)

    const { error: activateError } = await supabase
      .from('ocar_vehicles')
      .update({ 
        status: 'ativo',
        updated_at: new Date().toISOString()
      })
      .eq('id', veiculoParaAtivar.id)

    if (activateError) {
      console.error('❌ Erro ao ativar anúncio:', activateError)
    } else {
      console.log('✅ Anúncio ativado com sucesso!')
      console.log(`   🚗 ${veiculoParaAtivar.marca} ${veiculoParaAtivar.modelo}`)
      console.log(`   💰 R$ ${veiculoParaAtivar.preco}`)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

ativarAnuncioManualmente()
