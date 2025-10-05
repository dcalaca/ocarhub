const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testNewUpdatePlan() {
  console.log('🔍 Testando nova implementação de atualização...')
  
  try {
    // Buscar um plano existente
    const { data: plans, error: fetchError } = await supabase
      .from('ocar_planos')
      .select('*')
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Erro ao buscar planos:', fetchError)
      return
    }
    
    if (!plans || plans.length === 0) {
      console.error('❌ Nenhum plano encontrado')
      return
    }
    
    const plan = plans[0]
    console.log('📋 Plano encontrado:', plan.nome)
    
    // Testar atualização com a nova abordagem
    const updateData = {
      nome: plan.nome + ' (Teste)',
      tipo: plan.tipo,
      preco: plan.preco,
      descricao: plan.descricao,
      beneficios: Array.isArray(plan.beneficios) ? plan.beneficios : [],
      limite_anuncios: plan.limite_anuncios || 0,
      limite_consultas: plan.limite_consultas || 0,
      duracao_dias: plan.duracao_dias,
      destaque: plan.destaque || false,
      ativo: plan.ativo
    }
    
    console.log('🔄 Tentando atualizar...')
    
    // Primeiro, fazer a atualização sem select
    const { error: updateError } = await supabase
      .from('ocar_planos')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', plan.id)
    
    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError)
      return
    }
    
    console.log('✅ Atualização executada com sucesso')
    
    // Depois, buscar o plano atualizado
    const { data: updatedPlan, error: fetchError2 } = await supabase
      .from('ocar_planos')
      .select('*')
      .eq('id', plan.id)
      .single()
    
    if (fetchError2) {
      console.error('❌ Erro ao buscar plano atualizado:', fetchError2)
    } else {
      console.log('✅ Plano atualizado encontrado:', updatedPlan.nome)
    }
    
    // Reverter a mudança
    await supabase
      .from('ocar_planos')
      .update({ nome: plan.nome })
      .eq('id', plan.id)
    
    console.log('🔄 Mudança revertida')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testNewUpdatePlan()
