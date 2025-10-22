const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://kfsteismyqpekbaqwuez.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw'
)

async function registrarTransacaoManual() {
  try {
    console.log('🔧 Registrando transação manualmente...')
    
    // Dados da transação confirmada
    const transacaoData = {
      usuario_id: 'f5af33d9-2487-4420-a3de-672ae672e216', // ID do usuário que fez o pagamento
      valor: 20.00,
      descricao: 'Recarga de saldo via Mercado Pago - Transação 130249037513',
      tipo: 'deposito',
      metodo_pagamento: 'pix',
      status: 'aprovado',
      referencia_id: '130249037513',
      saldo_anterior: 0, // Será atualizado
      saldo_posterior: 20.00, // Será atualizado
      metadata: {
        payment_id: '130249037513',
        external_reference: 'saldo_f5af33d9-2487-4420-a3de-672ae672e216',
        transaction_amount: 20.00,
        payment_method: 'pix',
        client_email: 'tatianag.calaca@gmail.com'
      }
    }

    // Buscar saldo atual do usuário
    const { data: user, error: userError } = await supabase
      .from('ocar_usuarios')
      .select('saldo')
      .eq('id', transacaoData.usuario_id)
      .single()

    if (userError || !user) {
      console.error('❌ Usuário não encontrado:', transacaoData.usuario_id)
      return
    }

    const saldoAnterior = user.saldo || 0
    const novoSaldo = saldoAnterior + transacaoData.valor

    // Atualizar saldo do usuário
    const { error: saldoError } = await supabase
      .from('ocar_usuarios')
      .update({ 
        saldo: novoSaldo,
        updated_at: new Date().toISOString()
      })
      .eq('id', transacaoData.usuario_id)

    if (saldoError) {
      console.error('❌ Erro ao atualizar saldo:', saldoError)
      return
    }

    // Registrar transação
    const { error: transacaoError } = await supabase
      .from('ocar_transacoes')
      .insert({
        usuario_id: transacaoData.usuario_id,
        valor: transacaoData.valor,
        descricao: transacaoData.descricao,
        tipo: transacaoData.tipo,
        metodo_pagamento: transacaoData.metodo_pagamento,
        status: transacaoData.status,
        referencia_id: transacaoData.referencia_id,
        saldo_anterior: saldoAnterior,
        saldo_posterior: novoSaldo
      })

    if (transacaoError) {
      console.error('❌ Erro ao registrar transação:', transacaoError)
      return
    }

    console.log('✅ Transação registrada com sucesso!')
    console.log(`   💰 Valor: R$ ${transacaoData.valor}`)
    console.log(`   📊 Saldo anterior: R$ ${saldoAnterior}`)
    console.log(`   📊 Saldo posterior: R$ ${novoSaldo}`)
    console.log(`   🆔 Referência: ${transacaoData.referencia_id}`)

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

registrarTransacaoManual()
