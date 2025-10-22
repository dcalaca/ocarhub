const { createClient } = require('@supabase/supabase-js')

async function testarMercadoPagoTeste() {
  try {
    console.log('🧪 Testando credenciais do Mercado Pago (TESTE)...')
    
    // Credenciais de teste fornecidas
    const mpToken = 'APP_USR-4645131775783967-102121-662cfe8408046307b825a79edd594a15-2939896816'
    const mpPublicKey = 'APP_USR-f265542a-476e-4e51-91d3-9a5385001fb1'
    
    console.log('📋 Credenciais de teste:')
    console.log(`   Access Token: ${mpToken.substring(0, 20)}...`)
    console.log(`   Public Key: ${mpPublicKey.substring(0, 20)}...`)
    
    // Testar criação de preferência simples
    console.log('\n🧪 Testando criação de preferência...')
    
    const testPreference = {
      items: [
        {
          id: 'test_item',
          title: 'Teste de Pagamento (TESTE)',
          description: 'Teste com credenciais de teste do Mercado Pago',
          quantity: 1,
          unit_price: 1.00, // Valor baixo para teste
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
      
      console.log('\n🎯 INFORMAÇÕES PARA TESTE:')
      console.log('   • Use cartões de teste do Mercado Pago')
      console.log('   • Valores baixos funcionarão normalmente')
      console.log('   • Pagamentos serão simulados')
      console.log('   • Ideal para desenvolvimento e testes')
      
    } else {
      console.log('❌ Erro ao criar preferência:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Erro: ${JSON.stringify(result, null, 2)}`)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testarMercadoPagoTeste()
