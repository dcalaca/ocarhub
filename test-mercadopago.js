const { createClient } = require('@supabase/supabase-js')

async function testMercadoPago() {
  try {
    console.log('🔍 Testando configurações do Mercado Pago...')
    
    // Usar token de teste (substitua pelo seu token real)
    const mpToken = 'TEST-1234567890-abcdefghijklmnopqrstuvwxyz-12345678'
    
    console.log('📋 Testando com token de exemplo...')
    console.log(`   Token: ${mpToken.substring(0, 20)}...`)
    
    // Testar criação de preferência simples
    console.log('\n🧪 Testando criação de preferência...')
    
    const testPreference = {
      items: [
        {
          id: 'test_item',
          title: 'Teste de Pagamento',
          description: 'Teste para verificar configuração',
          quantity: 1,
          unit_price: 20.00,
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: 'https://ocarhub.com/success',
        failure: 'https://ocarhub.com/failure',
        pending: 'https://ocarhub.com/pending'
      },
      auto_return: 'approved',
      external_reference: `test_${Date.now()}`,
      payment_methods: {
        installments: 12,
        default_installments: 1,
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments_default: 1
      }
    }
    
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPreference)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Preferência criada com sucesso!')
      console.log(`   ID: ${result.id}`)
      console.log(`   URL: ${result.init_point}`)
      console.log(`   Status: ${result.status}`)
      
      if (result.payment_methods) {
        console.log('💳 Configurações de pagamento:')
        console.log(`   Parcelas máximas: ${result.payment_methods.installments}`)
        console.log(`   Parcelas padrão: ${result.payment_methods.default_installments}`)
      }
    } else {
      console.log('❌ Erro ao criar preferência:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Erro: ${JSON.stringify(result, null, 2)}`)
      
      // Análise do erro
      if (result.message) {
        console.log('\n🔍 Análise do erro:')
        if (result.message.includes('Invalid access token')) {
          console.log('   • Token de acesso inválido')
          console.log('   • Verifique se está usando token de produção')
        }
        if (result.message.includes('sandbox')) {
          console.log('   • Conta em modo sandbox/teste')
          console.log('   • Limitações podem estar ativas')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testMercadoPago()
