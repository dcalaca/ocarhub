// Script para listar todos os veículos com informações dos proprietários
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function listAllVehicles() {
  try {
    console.log('🔍 Buscando todos os veículos com informações dos proprietários...')
    
    const { data: vehicles, error } = await supabase
      .from('ocar_vehicles')
      .select(`
        id,
        marca,
        modelo,
        ano,
        preco,
        cidade,
        estado,
        status,
        plano,
        created_at,
        dono_id,
        ocar_users!inner(
          id,
          nome,
          email,
          tipo_usuario
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar veículos:', error)
      return
    }

    console.log(`\n📊 TOTAL DE VEÍCULOS ENCONTRADOS: ${vehicles.length}`)
    console.log('=' .repeat(80))

    vehicles.forEach((vehicle, index) => {
      console.log(`\n${index + 1}. VEÍCULO ID: ${vehicle.id}`)
      console.log(`   📋 ${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}`)
      console.log(`   💰 R$ ${vehicle.preco.toLocaleString('pt-BR')}`)
      console.log(`   📍 ${vehicle.cidade}, ${vehicle.estado}`)
      console.log(`   📊 Status: ${vehicle.status} | Plano: ${vehicle.plano}`)
      console.log(`   📅 Criado em: ${new Date(vehicle.created_at).toLocaleString('pt-BR')}`)
      console.log(`   👤 PROPRIETÁRIO:`)
      console.log(`      • Nome: ${vehicle.ocar_users.nome}`)
      console.log(`      • Email: ${vehicle.ocar_users.email}`)
      console.log(`      • Tipo: ${vehicle.ocar_users.tipo_usuario}`)
      console.log(`      • ID: ${vehicle.dono_id}`)
      console.log('   ' + '-'.repeat(60))
    })

    // Estatísticas por proprietário
    const owners = {}
    vehicles.forEach(vehicle => {
      const ownerId = vehicle.dono_id
      if (!owners[ownerId]) {
        owners[ownerId] = {
          nome: vehicle.ocar_users.nome,
          email: vehicle.ocar_users.email,
          tipo: vehicle.ocar_users.tipo_usuario,
          veiculos: []
        }
      }
      owners[ownerId].veiculos.push(vehicle)
    })

    console.log('\n📈 ESTATÍSTICAS POR PROPRIETÁRIO:')
    console.log('=' .repeat(80))
    
    Object.entries(owners).forEach(([ownerId, owner]) => {
      console.log(`\n👤 ${owner.nome} (${owner.email})`)
      console.log(`   Tipo: ${owner.tipo}`)
      console.log(`   Total de veículos: ${owner.veiculos.length}`)
      console.log(`   Veículos:`)
      owner.veiculos.forEach(v => {
        console.log(`     • ${v.marca} ${v.modelo} ${v.ano} - ${v.status}`)
      })
    })

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar o script
listAllVehicles()
