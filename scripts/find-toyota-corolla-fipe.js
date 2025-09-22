const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function findToyotaCorollaFipe() {
  try {
    console.log('🔍 Buscando dados FIPE para Toyota Corolla 2022...')
    
    // Buscar em todas as tabelas possíveis
    const tables = [
      'fipe_marcas',
      'fipe_modelos', 
      'fipe_anos',
      'fipe_valores',
      'fipe_vehicles',
      'fipe_data',
      'fipe_tabela',
      'fipe_precos'
    ]
    
    for (const table of tables) {
      try {
        console.log(`\n🔍 Verificando tabela: ${table}`)
        
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(3)
        
        if (!error && data) {
          console.log(`✅ Tabela ${table} existe!`)
          console.log(`📊 Estrutura:`, Object.keys(data[0] || {}))
          console.log(`📊 Exemplo:`, data[0])
          
          // Se for uma tabela de valores, buscar especificamente por Toyota Corolla
          if (table.includes('valor') || table.includes('preco') || table.includes('data')) {
            const { data: toyotaData, error: toyotaError } = await supabase
              .from(table)
              .select('*')
              .or('marca.ilike.%Toyota%,modelo.ilike.%Corolla%')
              .limit(5)
            
            if (!toyotaError && toyotaData && toyotaData.length > 0) {
              console.log(`🎯 Dados Toyota Corolla encontrados em ${table}:`)
              console.log(toyotaData)
            }
          }
        } else {
          console.log(`❌ Tabela ${table} não existe ou erro:`, error?.message)
        }
      } catch (e) {
        console.log(`❌ Erro ao acessar ${table}:`, e.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

findToyotaCorollaFipe()
