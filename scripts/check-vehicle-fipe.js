const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkVehicleFipe() {
  try {
    const vehicleId = '0144ea53-bd9d-4908-a325-13deeec718d2'
    
    console.log('🔍 Verificando dados do veículo:', vehicleId)
    
    const { data: vehicle, error } = await supabase
      .from('ocar_vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single()
    
    if (error) {
      console.error('❌ Erro ao buscar veículo:', error)
      return
    }
    
    if (!vehicle) {
      console.log('❌ Veículo não encontrado')
      return
    }
    
    console.log('✅ Veículo encontrado:')
    console.log(`   Marca: ${vehicle.marca}`)
    console.log(`   Modelo: ${vehicle.modelo}`)
    console.log(`   Ano: ${vehicle.ano}`)
    console.log(`   Preço: R$ ${(vehicle.preco || 0).toFixed(2)}`)
    console.log(`   FIPE: ${vehicle.fipe ? `R$ ${vehicle.fipe.toFixed(2)}` : 'NÃO DEFINIDO'}`)
    console.log(`   Versão: ${vehicle.versao || 'NÃO DEFINIDO'}`)
    console.log(`   Status: ${vehicle.status}`)
    console.log(`   Plano: ${vehicle.plano}`)
    
    // Verificar se tem dados FIPE relacionados
    console.log('\n🔍 Verificando dados FIPE relacionados...')
    
    if (vehicle.marca && vehicle.modelo && vehicle.ano) {
      // Buscar na tabela de dados FIPE
      const { data: fipeData, error: fipeError } = await supabase
        .from('fipe_vehicles')
        .select('*')
        .eq('marca', vehicle.marca)
        .eq('modelo', vehicle.modelo)
        .eq('ano', vehicle.ano)
        .limit(1)
      
      if (fipeError) {
        console.error('❌ Erro ao buscar dados FIPE:', fipeError)
      } else if (fipeData && fipeData.length > 0) {
        console.log('✅ Dados FIPE encontrados:')
        console.log(`   Valor FIPE: R$ ${fipeData[0].preco.toFixed(2)}`)
        console.log(`   Código FIPE: ${fipeData[0].codigo_fipe}`)
        
        // Atualizar o veículo com o valor FIPE
        console.log('\n🔄 Atualizando veículo com valor FIPE...')
        const { error: updateError } = await supabase
          .from('ocar_vehicles')
          .update({ 
            fipe: fipeData[0].preco,
            updated_at: new Date().toISOString()
          })
          .eq('id', vehicleId)
        
        if (updateError) {
          console.error('❌ Erro ao atualizar veículo:', updateError)
        } else {
          console.log('✅ Veículo atualizado com valor FIPE!')
        }
      } else {
        console.log('❌ Nenhum dado FIPE encontrado para este veículo')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkVehicleFipe()
