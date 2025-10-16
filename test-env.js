// Teste para verificar variáveis de ambiente
// Execute este código no console do navegador

console.log('🔍 Verificando variáveis de ambiente...')

// Testar se as variáveis estão disponíveis
const testEnvVars = async () => {
  try {
    const response = await fetch('/api/test-env', {
      method: 'GET'
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Variáveis de ambiente:', data)
    } else {
      console.log('❌ Endpoint de teste não encontrado')
    }
  } catch (error) {
    console.log('❌ Erro ao testar variáveis:', error)
  }
}

testEnvVars()
