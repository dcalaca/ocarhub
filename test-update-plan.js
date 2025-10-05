const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpdatePlan() {
  console.log('🔍 Testando atualização de plano...')
  
  try {
    // Primeiro, vamos buscar um plano existente
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
    console.log('📋 Plano encontrado:', {
      id: plan.id,
      nome: plan.nome,
      tipo: plan.tipo,
      preco: plan.preco,
      descricao: plan.descricao,
      beneficios: plan.beneficios,
      limite_anuncios: plan.limite_anuncios,
      limite_consultas: plan.limite_consultas,
      duracao_dias: plan.duracao_dias,
      destaque: plan.destaque,
      ativo: plan.ativo
    })
    
    // Testar atualização com dados mínimos
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
    
    console.log('🔄 Tentando atualizar com dados:', updateData)
    
    const { data: updatedPlan, error: updateError } = await supabase
      .from('ocar_planos')
      .update(updateData)
      .eq('id', plan.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Erro ao atualizar plano:', updateError)
      console.error('📊 Detalhes do erro:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      })
    } else {
      console.log('✅ Plano atualizado com sucesso:', updatedPlan)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testUpdatePlan()
