// Teste simples para verificar se a API createPreference está funcionando
// Execute este código no console do navegador na página de conta

async function testCreatePreference() {
  console.log('🧪 Testando API createPreference...')
  
  try {
    const response = await fetch('/api/createPreference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valor: 25,
        userId: '091ef3dc-923b-467a-a4f6-a9660281494a', // ID do usuário admin
        descricao: 'Teste de pagamento'
      })
    })

    const data = await response.json()
    
    console.log('📊 Resposta da API:', {
      status: response.status,
      ok: response.ok,
      data: data
    })

    if (response.ok) {
      console.log('✅ API funcionando! Link de pagamento:', data.initPoint)
    } else {
      console.error('❌ Erro na API:', data.error)
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error)
  }
}

// Executar o teste
testCreatePreference()
