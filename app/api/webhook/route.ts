import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabase } from '@/lib/supabase'

// Configuração de região para evitar IAD1 (incidente Vercel)
export const runtime = 'nodejs'
export const preferredRegion = ['gru1', 'sfo1']

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature')
    
    console.log('🔔 Webhook recebido:', {
      signature: signature?.substring(0, 20) + '...',
      bodyLength: body.length,
      timestamp: new Date().toISOString()
    })

    // Validar assinatura HMAC
    const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET
    if (!MP_WEBHOOK_SECRET) {
      console.error('❌ MP_WEBHOOK_SECRET não configurado')
      return NextResponse.json(
        { error: 'Configuração de webhook não disponível' },
        { status: 500 }
      )
    }

    if (!signature) {
      console.error('❌ Assinatura não encontrada no header x-signature')
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 400 }
      )
    }

    // Calcular HMAC
    const expectedSignature = createHmac('sha256', MP_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    // Verificar se a assinatura é válida
    const isValidSignature = signature.includes(expectedSignature)
    
    if (!isValidSignature) {
      console.error('❌ Assinatura inválida:', {
        received: signature.substring(0, 20) + '...',
        expected: expectedSignature.substring(0, 20) + '...'
      })
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 401 }
      )
    }

    console.log('✅ Assinatura válida, processando webhook...')

    // Parse do body
    const webhookData = JSON.parse(body)
    console.log('📊 Dados do webhook:', {
      type: webhookData.type,
      action: webhookData.action,
      data: webhookData.data
    })

    // Processar apenas notificações de pagamento
    if (webhookData.type === 'payment') {
      const paymentId = webhookData.data?.id
      
      if (!paymentId) {
        console.error('❌ ID do pagamento não encontrado')
        return NextResponse.json(
          { error: 'ID do pagamento não encontrado' },
          { status: 400 }
        )
      }

      // Consultar pagamento na API do Mercado Pago
      const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
      if (!MP_ACCESS_TOKEN) {
        console.error('❌ MP_ACCESS_TOKEN não configurado')
        return NextResponse.json(
          { error: 'Configuração de pagamento não disponível' },
          { status: 500 }
        )
      }

      console.log('🔍 Consultando pagamento:', paymentId)
      
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.text()
        console.error('❌ Erro ao consultar pagamento:', {
          status: paymentResponse.status,
          statusText: paymentResponse.statusText,
          error: errorData
        })
        return NextResponse.json(
          { error: 'Erro ao consultar pagamento' },
          { status: 500 }
        )
      }

      const payment = await paymentResponse.json()
      
      console.log('💰 Dados do pagamento:', {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        external_reference: payment.external_reference,
        metadata: payment.metadata
      })

      // Processar apenas pagamentos aprovados
      if (payment.status === 'approved') {
        console.log('✅ Pagamento aprovado, processando...')
        
        const externalReference = payment.external_reference
        const userId = payment.metadata?.userId
        const valor = parseFloat(payment.metadata?.valor || payment.transaction_amount.toString())
        
        if (!userId) {
          console.error('❌ userId não encontrado no metadata')
          return NextResponse.json(
            { error: 'userId não encontrado' },
            { status: 400 }
          )
        }

        // Verificar se já processamos este pagamento
        const { data: existingTransaction } = await supabase
          .from('ocar_transacoes')
          .select('id')
          .eq('referencia_id', payment.id.toString())
          .single()

        if (existingTransaction) {
          console.log('⚠️ Pagamento já processado:', payment.id)
          return NextResponse.json({ success: true, message: 'Pagamento já processado' })
        }

        // Buscar usuário atual
        const { data: user, error: userError } = await supabase
          .from('ocar_usuarios')
          .select('saldo')
          .eq('id', userId)
          .single()

        if (userError || !user) {
          console.error('❌ Usuário não encontrado:', userId)
          return NextResponse.json(
            { error: 'Usuário não encontrado' },
            { status: 404 }
          )
        }

        const saldoAnterior = user.saldo || 0
        const novoSaldo = saldoAnterior + valor

        // Atualizar saldo do usuário
        const { error: saldoError } = await supabase
          .from('ocar_usuarios')
          .update({ 
            saldo: novoSaldo,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (saldoError) {
          console.error('❌ Erro ao atualizar saldo:', saldoError)
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
            valor: valor,
            descricao: `Recarga de saldo via Mercado Pago - ${payment.id}`,
            tipo: 'deposito',
            metodo_pagamento: 'mercadopago',
            status: 'aprovado',
            referencia_id: payment.id.toString(),
            saldo_anterior: saldoAnterior,
            saldo_posterior: novoSaldo,
            metadata: {
              payment_id: payment.id,
              external_reference: externalReference,
              transaction_amount: payment.transaction_amount
            }
          })

        if (transacaoError) {
          console.error('❌ Erro ao registrar transação:', transacaoError)
          // Reverter saldo se falhar ao registrar transação
          await supabase
            .from('ocar_usuarios')
            .update({ 
              saldo: saldoAnterior,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
          
          return NextResponse.json(
            { error: 'Erro ao registrar transação' },
            { status: 500 }
          )
        }

        // Verificar se há um anúncio pendente para ativar
        if (externalReference) {
          console.log('🔍 Verificando anúncio pendente para ativar...')
          
          // Buscar veículo com status pausado para este usuário (temporário)
          const { data: pendingVehicle, error: vehicleError } = await supabase
            .from('ocar_vehicles')
            .select('id, marca, modelo, preco, plano')
            .eq('dono_id', userId)
            .eq('status', 'pausado')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (pendingVehicle && !vehicleError) {
            console.log('🚗 Anúncio pendente encontrado:', pendingVehicle)
            
            // Ativar o anúncio
            const { error: activateError } = await supabase
              .from('ocar_vehicles')
              .update({ 
                status: 'ativo',
                updated_at: new Date().toISOString()
              })
              .eq('id', pendingVehicle.id)

            if (activateError) {
              console.error('❌ Erro ao ativar anúncio:', activateError)
            } else {
              console.log('✅ Anúncio ativado com sucesso:', pendingVehicle.id)
            }
          } else {
            console.log('ℹ️ Nenhum anúncio pendente encontrado para ativar')
          }
        }

        console.log('✅ Saldo atualizado com sucesso:', {
          userId,
          valor,
          saldoAnterior,
          novoSaldo,
          paymentId: payment.id
        })

        return NextResponse.json({ 
          success: true, 
          message: 'Pagamento processado com sucesso',
          data: {
            userId,
            valor,
            novoSaldo,
            paymentId: payment.id
          }
        })
      } else {
        console.log('ℹ️ Pagamento não aprovado:', {
          status: payment.status,
          status_detail: payment.status_detail
        })
        return NextResponse.json({ 
          success: true, 
          message: 'Pagamento não aprovado',
          status: payment.status
        })
      }
    }

    console.log('ℹ️ Tipo de webhook não processado:', webhookData.type)
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook recebido mas não processado' 
    })

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
