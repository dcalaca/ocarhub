const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRLSAndPermissions() {
  console.log('🔍 Testando RLS e permissões...')
  
  try {
    // Verificar se conseguimos ler os planos
    const { data: plans, error: fetchError } = await supabase
      .from('ocar_planos')
      .select('*')
    
    if (fetchError) {
      console.error('❌ Erro ao buscar planos:', fetchError)
      return
    }
    
    console.log('✅ Conseguiu ler planos:', plans?.length || 0, 'planos encontrados')
    
    if (plans && plans.length > 0) {
      const plan = plans[0]
      console.log('📋 Primeiro plano:', {
        id: plan.id,
        nome: plan.nome,
        tipo: plan.tipo
      })
      
      // Tentar atualização simples apenas do nome
      const { data: updatedPlan, error: updateError } = await supabase
        .from('ocar_planos')
        .update({ nome: plan.nome + ' (Teste)' })
        .eq('id', plan.id)
        .select()
      
      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError)
      } else {
        console.log('✅ Atualização simples funcionou:', updatedPlan)
        
        // Reverter a mudança
        await supabase
          .from('ocar_planos')
          .update({ nome: plan.nome })
          .eq('id', plan.id)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testRLSAndPermissions()
