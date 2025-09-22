const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyVehicleFipe() {
  try {
    const vehicleId = '0144ea53-bd9d-4908-a325-13deeec718d2'
    
    console.log('🔍 Verificando dados atualizados do veículo...')
    
    const { data: vehicle, error } = await supabase
      .from('ocar_vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single()
    
    if (error) {
      console.error('❌ Erro ao buscar veículo:', error)
      return
    }
    
    console.log('✅ Dados do veículo:')
    console.log(`   Marca: ${vehicle.marca}`)
    console.log(`   Modelo: ${vehicle.modelo}`)
    console.log(`   Ano: ${vehicle.ano}`)
    console.log(`   Versão: ${vehicle.versao}`)
    console.log(`   Preço: R$ ${(vehicle.preco || 0).toFixed(2)}`)
    console.log(`   FIPE: ${vehicle.fipe ? `R$ ${vehicle.fipe.toFixed(2)}` : 'NÃO DEFINIDO'}`)
    console.log(`   Status: ${vehicle.status}`)
    console.log(`   Plano: ${vehicle.plano}`)
    
    if (vehicle.fipe) {
      const diferenca = vehicle.preco - vehicle.fipe
      const percentual = ((diferenca / vehicle.fipe) * 100).toFixed(1)
      
      console.log('\n📊 Análise de preços:')
      console.log(`   Preço anunciado: R$ ${vehicle.preco.toFixed(2)}`)
      console.log(`   Valor FIPE: R$ ${vehicle.fipe.toFixed(2)}`)
      console.log(`   Diferença: R$ ${diferenca.toFixed(2)} (${percentual > 0 ? '+' : ''}${percentual}%)`)
      
      if (diferenca > 0) {
        console.log('   📈 Preço acima da FIPE')
      } else if (diferenca < 0) {
        console.log('   📉 Preço abaixo da FIPE')
      } else {
        console.log('   ⚖️ Preço igual à FIPE')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

verifyVehicleFipe()
