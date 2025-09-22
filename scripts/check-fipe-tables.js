const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkFipeTables() {
  try {
    console.log('🔍 Verificando tabelas FIPE disponíveis...')
    
    // Listar todas as tabelas que começam com 'fipe'
    const { data: tables, error } = await supabase
      .rpc('get_table_names')
      .like('table_name', 'fipe%')
    
    if (error) {
      console.log('❌ Erro ao listar tabelas:', error)
      
      // Tentar buscar diretamente nas tabelas conhecidas
      console.log('\n🔍 Tentando buscar em tabelas conhecidas...')
      
      // Verificar tabela fipe_marcas
      try {
        const { data: marcas, error: marcasError } = await supabase
          .from('fipe_marcas')
          .select('*')
          .limit(5)
        
        if (!marcasError) {
          console.log('✅ Tabela fipe_marcas encontrada')
          console.log('📊 Exemplo de dados:', marcas)
        }
      } catch (e) {
        console.log('❌ Tabela fipe_marcas não encontrada')
      }
      
      // Verificar tabela fipe_modelos
      try {
        const { data: modelos, error: modelosError } = await supabase
          .from('fipe_modelos')
          .select('*')
          .limit(5)
        
        if (!modelosError) {
          console.log('✅ Tabela fipe_modelos encontrada')
          console.log('📊 Exemplo de dados:', modelos)
        }
      } catch (e) {
        console.log('❌ Tabela fipe_modelos não encontrada')
      }
      
      // Verificar tabela fipe_anos
      try {
        const { data: anos, error: anosError } = await supabase
          .from('fipe_anos')
          .select('*')
          .limit(5)
        
        if (!anosError) {
          console.log('✅ Tabela fipe_anos encontrada')
          console.log('📊 Exemplo de dados:', anos)
        }
      } catch (e) {
        console.log('❌ Tabela fipe_anos não encontrada')
      }
      
      // Verificar tabela fipe_valores
      try {
        const { data: valores, error: valoresError } = await supabase
          .from('fipe_valores')
          .select('*')
          .limit(5)
        
        if (!valoresError) {
          console.log('✅ Tabela fipe_valores encontrada')
          console.log('📊 Exemplo de dados:', valores)
        }
      } catch (e) {
        console.log('❌ Tabela fipe_valores não encontrada')
      }
      
    } else {
      console.log('✅ Tabelas FIPE encontradas:', tables)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkFipeTables()