// Teste de conexão com Supabase
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    // Testar conexão básica
    const { data, error } = await supabase
      .from('ocar_usuarios')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão:', error)
    } else {
      console.log('✅ Conexão OK')
    }
    
    // Testar se a tabela existe
    const { data: tableData, error: tableError } = await supabase
      .from('ocar_usuarios')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Erro na tabela:', tableError)
    } else {
      console.log('✅ Tabela ocar_usuarios existe')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testConnection()
