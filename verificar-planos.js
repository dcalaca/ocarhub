const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://kfsteismyqpekbaqwuez.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw'
)

async function verificarPlanos() {
  try {
    console.log('🔍 Verificando planos disponíveis...')
    
    // Buscar todos os planos
    const { data: planos, error: planosError } = await supabase
      .from('ocar_planos')
      .select('*')
      .eq('ativo', true)
      .order('preco', { ascending: true })

    if (planosError) {
      console.error('❌ Erro ao buscar planos:', planosError)
      return
    }

    console.log(`\n📋 PLANOS DISPONÍVEIS: ${planos.length}`)
    console.log('=' .repeat(60))

    planos.forEach((plano, i) => {
      console.log(`\n${i+1}. PLANO: ${plano.nome}`)
      console.log(`   💰 Preço: R$ ${plano.preco}`)
      console.log(`   📊 Tipo: ${plano.tipo}`)
      console.log(`   📝 Descrição: ${plano.descricao}`)
      console.log(`   🎯 Limite anúncios: ${plano.limite_anuncios}`)
      console.log(`   ⭐ Destaque: ${plano.destaque ? 'Sim' : 'Não'}`)
      console.log(`   🆔 ID: ${plano.id}`)
    })

    // Verificar se há plano gratuito
    const planoGratuito = planos.find(p => p.preco === 0)
    if (planoGratuito) {
      console.log('\n🆓 PLANO GRATUITO ENCONTRADO:')
      console.log(`   Nome: ${planoGratuito.nome}`)
      console.log(`   Preço: R$ ${planoGratuito.preco}`)
    } else {
      console.log('\n❌ NENHUM PLANO GRATUITO ENCONTRADO!')
      console.log('   • Todos os planos são pagos')
      console.log('   • Isso explica por que anúncios ficam ativos')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

verificarPlanos()
