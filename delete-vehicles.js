const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabase = createClient(
  'https://kfsteismyqpekbaqwuez.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw'
)

async function listAndDeleteVehicles() {
  try {
    console.log('🔍 Buscando todos os veículos...')
    
    const { data: vehicles, error } = await supabase
      .from('ocar_vehicles')
      .select(`
        id,
        marca,
        modelo,
        ano,
        preco,
        cidade,
        dono_id,
        ocar_usuarios!inner(nome, email)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro:', error)
      return
    }

    console.log(`\n📊 TOTAL: ${vehicles.length} veículos`)
    console.log('=' .repeat(60))

    vehicles.forEach((v, i) => {
      console.log(`${i+1}. ${v.marca} ${v.modelo} ${v.ano} - R$ ${v.preco.toLocaleString()}`)
      console.log(`   👤 ${v.ocar_usuarios.nome} (${v.ocar_usuarios.email})`)
      console.log(`   🆔 ID: ${v.id}`)
      console.log('')
    })

    // Perguntar quais excluir
    console.log('\n❓ Digite os IDs dos veículos que quer excluir (separados por vírgula):')
    console.log('   Exemplo: 123,456,789')
    console.log('   Ou digite "todos" para excluir todos')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

listAndDeleteVehicles()
