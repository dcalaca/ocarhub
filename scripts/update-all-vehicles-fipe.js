const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateAllVehiclesFipe() {
  try {
    console.log('🔍 Buscando todos os veículos sem valor FIPE...')
    
    const { data: vehicles, error } = await supabase
      .from('ocar_vehicles')
      .select('*')
      .is('fipe', null)
      .eq('status', 'ativo')
    
    if (error) {
      console.error('❌ Erro ao buscar veículos:', error)
      return
    }
    
    if (!vehicles || vehicles.length === 0) {
      console.log('✅ Todos os veículos já têm valor FIPE definido')
      return
    }
    
    console.log(`📊 Encontrados ${vehicles.length} veículos sem valor FIPE`)
    
    // Valores estimados por marca e ano
    const estimatedPrices = {
      'Toyota': {
        2020: 80000,
        2021: 85000,
        2022: 90000,
        2023: 95000,
        2024: 100000
      },
      'Chevrolet': {
        2020: 70000,
        2021: 75000,
        2022: 80000,
        2023: 85000,
        2024: 90000
      },
      'Volkswagen': {
        2020: 75000,
        2021: 80000,
        2022: 85000,
        2023: 90000,
        2024: 95000
      },
      'Ford': {
        2020: 70000,
        2021: 75000,
        2022: 80000,
        2023: 85000,
        2024: 90000
      },
      'Honda': {
        2020: 80000,
        2021: 85000,
        2022: 90000,
        2023: 95000,
        2024: 100000
      },
      'Fiat': {
        2020: 60000,
        2021: 65000,
        2022: 70000,
        2023: 75000,
        2024: 80000
      }
    }
    
    for (const vehicle of vehicles) {
      try {
        console.log(`\n🔄 Atualizando ${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}...`)
        
        // Buscar valor estimado baseado na marca e ano
        const marcaPrices = estimatedPrices[vehicle.marca] || estimatedPrices['Toyota']
        const estimatedPrice = marcaPrices[vehicle.ano] || marcaPrices[2022] || 80000
        
        console.log(`💰 Valor FIPE estimado: R$ ${estimatedPrice.toFixed(2)}`)
        
        // Atualizar veículo
        const { error: updateError } = await supabase
          .from('ocar_vehicles')
          .update({ 
            fipe: estimatedPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', vehicle.id)
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar ${vehicle.marca} ${vehicle.modelo}:`, updateError)
        } else {
          console.log(`✅ ${vehicle.marca} ${vehicle.modelo} atualizado com sucesso!`)
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${vehicle.marca} ${vehicle.modelo}:`, error)
      }
    }
    
    console.log('\n✅ Processo de atualização concluído!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

updateAllVehiclesFipe()
