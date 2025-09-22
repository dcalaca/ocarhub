const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkCurrentVehicle() {
  try {
    const vehicleId = 'bccb4ca6-0804-4184-a9b8-f1c033c06220' // ID do veículo que está sendo exibido
    
    console.log('🔍 Verificando veículo atual:', vehicleId)
    
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
    console.log(`   Versão: ${vehicle.versao}`)
    console.log(`   Preço: R$ ${(vehicle.preco || 0).toFixed(2)}`)
    console.log(`   FIPE: ${vehicle.fipe ? `R$ ${vehicle.fipe.toFixed(2)}` : 'NÃO DEFINIDO'}`)
    console.log(`   Status: ${vehicle.status}`)
    console.log(`   Plano: ${vehicle.plano}`)
    
    // Se não tem FIPE, buscar e atualizar
    if (!vehicle.fipe) {
      console.log('\n🔍 Buscando valor FIPE para Chevrolet Cruze 2022...')
      
      try {
        // Buscar marcas
        const brandsResponse = await fetch('https://fipe.parallelum.com.br/api/v2/cars/brands')
        const brands = await brandsResponse.json()
        
        // Encontrar Chevrolet
        const chevrolet = brands.find(b => 
          b.name.toLowerCase().includes('chevrolet')
        )
        
        if (!chevrolet) {
          console.log('❌ Chevrolet não encontrada')
          return
        }
        
        console.log('✅ Chevrolet encontrada:', chevrolet)
        
        // Buscar modelos da Chevrolet
        const modelsResponse = await fetch(`https://fipe.parallelum.com.br/api/v2/cars/brands/${chevrolet.code}/models`)
        const models = await modelsResponse.json()
        
        // Encontrar Cruze
        const cruze = models.find(m => 
          m.name.toLowerCase().includes('cruze')
        )
        
        if (!cruze) {
          console.log('❌ Cruze não encontrado')
          return
        }
        
        console.log('✅ Cruze encontrado:', cruze)
        
        // Buscar anos do Cruze
        const yearsResponse = await fetch(`https://fipe.parallelum.com.br/api/v2/cars/brands/${chevrolet.code}/models/${cruze.code}/years`)
        const years = await yearsResponse.json()
        
        // Encontrar ano 2022
        const year2022 = years.find(y => {
          const yearFromCode = parseInt(y.code.split('-')[0])
          return yearFromCode === 2022
        })
        
        if (!year2022) {
          console.log('❌ Ano 2022 não encontrado para Cruze')
          return
        }
        
        console.log('✅ Ano 2022 encontrado:', year2022)
        
        // Buscar valor FIPE
        const priceResponse = await fetch(`https://fipe.parallelum.com.br/api/v2/cars/brands/${chevrolet.code}/models/${cruze.code}/years/${year2022.code}`)
        const priceData = await priceResponse.json()
        
        console.log('✅ Dados FIPE encontrados:', priceData)
        
        // Extrair preço
        const priceString = priceData.price.replace('R$ ', '').replace('.', '').replace(',', '.')
        const fipePrice = parseFloat(priceString)
        
        console.log('💰 Valor FIPE:', fipePrice)
        
        // Atualizar veículo com valor FIPE
        console.log('🔄 Atualizando veículo com valor FIPE...')
        
        const { error: updateError } = await supabase
          .from('ocar_vehicles')
          .update({ 
            fipe: fipePrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', vehicleId)
        
        if (updateError) {
          console.error('❌ Erro ao atualizar veículo:', updateError)
        } else {
          console.log('✅ Veículo atualizado com sucesso!')
          console.log(`💰 Valor FIPE: R$ ${fipePrice.toFixed(2)}`)
        }
        
      } catch (apiError) {
        console.error('❌ Erro na API FIPE:', apiError)
        
        // Usar valor estimado como fallback
        console.log('🔄 Usando valor estimado como fallback...')
        const estimatedPrice = 85000 // Valor estimado para Cruze 2022
        
        const { error: updateError } = await supabase
          .from('ocar_vehicles')
          .update({ 
            fipe: estimatedPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', vehicleId)
        
        if (updateError) {
          console.error('❌ Erro ao atualizar com valor estimado:', updateError)
        } else {
          console.log('✅ Veículo atualizado com valor estimado!')
          console.log(`💰 Valor FIPE estimado: R$ ${estimatedPrice.toFixed(2)}`)
        }
      }
    } else {
      console.log('✅ Veículo já tem valor FIPE definido')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkCurrentVehicle()
