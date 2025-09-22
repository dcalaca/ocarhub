const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateCruzeFipe() {
  try {
    const vehicleId = 'bccb4ca6-0804-4184-a9b8-f1c033c06220'
    
    console.log('🔍 Atualizando Chevrolet Cruze 2022 com valor FIPE...')
    
    // Valores estimados para Chevrolet Cruze por ano
    const estimatedPrices = {
      2020: 75000,
      2021: 80000,
      2022: 85000,
      2023: 90000,
      2024: 95000
    }
    
    const estimatedPrice = estimatedPrices[2022] || 85000
    
    console.log(`💰 Usando valor FIPE estimado: R$ ${estimatedPrice.toFixed(2)}`)
    
    // Atualizar veículo com valor FIPE estimado
    const { error: updateError } = await supabase
      .from('ocar_vehicles')
      .update({ 
        fipe: estimatedPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId)
    
    if (updateError) {
      console.error('❌ Erro ao atualizar veículo:', updateError)
    } else {
      console.log('✅ Veículo atualizado com sucesso!')
      console.log(`💰 Valor FIPE estimado: R$ ${estimatedPrice.toFixed(2)}`)
      
      // Verificar se foi atualizado
      const { data: updatedVehicle, error: checkError } = await supabase
        .from('ocar_vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single()
      
      if (!checkError && updatedVehicle) {
        console.log('\n✅ Verificação - Veículo atualizado:')
        console.log(`   Marca: ${updatedVehicle.marca}`)
        console.log(`   Modelo: ${updatedVehicle.modelo}`)
        console.log(`   Ano: ${updatedVehicle.ano}`)
        console.log(`   Preço: R$ ${(updatedVehicle.preco || 0).toFixed(2)}`)
        console.log(`   FIPE: R$ ${(updatedVehicle.fipe || 0).toFixed(2)}`)
        
        const diferenca = updatedVehicle.preco - updatedVehicle.fipe
        const percentual = ((diferenca / updatedVehicle.fipe) * 100).toFixed(1)
        
        console.log('\n📊 Análise de preços:')
        console.log(`   Preço anunciado: R$ ${updatedVehicle.preco.toFixed(2)}`)
        console.log(`   Valor FIPE: R$ ${updatedVehicle.fipe.toFixed(2)}`)
        console.log(`   Diferença: R$ ${diferenca.toFixed(2)} (${percentual > 0 ? '+' : ''}${percentual}%)`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

updateCruzeFipe()
