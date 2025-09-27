import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, description } = await request.json()

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'userId e amount são obrigatórios' },
        { status: 400 }
      )
    }

    const valor = parseFloat(amount)
    if (valor <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Buscar saldo atual do usuário
    const { data: userData, error: userError } = await supabase
      .from('ocar_usuarios')
      .select('saldo')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Erro ao buscar usuário:', userError)
      return NextResponse.json(
        { error: 'Erro ao buscar dados do usuário' },
        { status: 500 }
      )
    }

    const saldoAtual = userData?.saldo || 0
    const novoSaldo = saldoAtual + valor

    // Atualizar saldo do usuário
    const { error: updateError } = await supabase
      .from('ocar_usuarios')
      .update({ saldo: novoSaldo })
      .eq('id', userId)

    if (updateError) {
      console.error('Erro ao atualizar saldo:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar saldo' },
        { status: 500 }
      )
    }

    // Registrar transação
    const { error: transacaoError } = await supabase
      .from('ocar_transacoes')
      .insert({
        usuario_id: userId,
        tipo: 'credito',
        valor: valor,
        descricao: description || `Saldo de teste adicionado - R$ ${valor.toFixed(2)}`,
        status: 'concluido',
        metodo_pagamento: 'teste',
        referencia: `TESTE_${Date.now()}`
      })

    if (transacaoError) {
      console.error('Erro ao registrar transação:', transacaoError)
      // Mesmo com erro na transação, o saldo foi atualizado
    }

    return NextResponse.json({
      success: true,
      message: 'Saldo adicionado com sucesso',
      saldo_anterior: saldoAtual,
      valor_adicionado: valor,
      novo_saldo: novoSaldo
    })

  } catch (error) {
    console.error('Erro na API de saldo de teste:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
