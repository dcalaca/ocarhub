const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://kfsteismyqpekbaqwuez.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw'
)

async function verificarTodosVeiculos() {
  try {
    console.log('🔍 Verificando todos os veículos...')
    
    // Buscar todos os veículos
    const { data: veiculos, error: veicError } = await supabase
      .from('ocar_vehicles')
      .select('id, marca, modelo, preco, status, created_at, dono_id')
      .order('created_at', { ascending: false })

    if (veicError) {
      console.error('❌ Erro ao buscar veículos:', veicError)
      return
    }

    console.log(`\n🚗 TOTAL DE VEÍCULOS: ${veiculos.length}`)
    console.log('=' .repeat(60))

    if (veiculos.length === 0) {
      console.log('❌ Nenhum veículo encontrado!')
      console.log('   • Sistema está vazio')
      console.log('   • Anúncio pode não ter sido criado')
      return
    }

    veiculos.forEach((veiculo, i) => {
      console.log(`\n${i+1}. VEÍCULO ID: ${veiculo.id}`)
      console.log(`   🚗 ${veiculo.marca} ${veiculo.modelo}`)
      console.log(`   💰 R$ ${veiculo.preco}`)
      console.log(`   📊 Status: ${veiculo.status}`)
      console.log(`   📅 Criado: ${new Date(veiculo.created_at).toLocaleString('pt-BR')}`)
      console.log(`   👤 Usuário: ${veiculo.dono_id}`)
    })

    // Estatísticas por status
    const statusCount = {}
    veiculos.forEach(v => {
      statusCount[v.status] = (statusCount[v.status] || 0) + 1
    })

    console.log('\n📊 ESTATÍSTICAS POR STATUS:')
    console.log('=' .repeat(60))
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} veículo(s)`)
    })

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

verificarTodosVeiculos()
