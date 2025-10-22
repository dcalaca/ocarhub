const { createClient } = require('@supabase/supabase-js')

async function testarMercadoPagoVercel() {
  try {
    console.log('🧪 Testando Mercado Pago no Vercel...')
    
    // Testar API de criação de preferência
    console.log('\n🔍 Testando API createPreference...')
    
    const response = await fetch('https://ocarhub.com/api/createPreference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valor: 1.00,
        userId: 'test-user-id',
        descricao: 'Teste de pagamento via Vercel'
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ API createPreference funcionando!')
      console.log(`   Status: ${response.status}`)
      console.log(`   Resultado: ${JSON.stringify(result, null, 2)}`)
      
      if (result.initPoint) {
        console.log('\n🎯 PREFERÊNCIA CRIADA:')
        console.log(`   URL: ${result.initPoint}`)
        console.log(`   ID: ${result.id}`)
        
        console.log('\n🧪 TESTE DE PAGAMENTO:')
        console.log('   1. Acesse a URL acima')
        console.log('   2. Use cartão de teste: 4509 9535 6623 3704')
        console.log('   3. CVV: 123')
        console.log('   4. Data: Qualquer data futura')
        console.log('   5. Verifique se o botão "Pagar" está habilitado')
        
      } else {
        console.log('❌ initPoint não encontrado na resposta')
      }
      
    } else {
      console.log('❌ Erro na API createPreference:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Erro: ${JSON.stringify(result, null, 2)}`)
    }
    
    // Testar API de teste de ambiente
    console.log('\n🔍 Testando API test-env...')
    
    const envResponse = await fetch('https://ocarhub.com/api/test-env')
    const envResult = await envResponse.json()
    
    if (envResponse.ok) {
      console.log('✅ API test-env funcionando!')
      console.log(`   Variáveis: ${JSON.stringify(envResult.environment, null, 2)}`)
    } else {
      console.log('❌ Erro na API test-env:')
      console.log(`   Status: ${envResponse.status}`)
      console.log(`   Erro: ${JSON.stringify(envResult, null, 2)}`)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testarMercadoPagoVercel()
