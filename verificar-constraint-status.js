const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://kfsteismyqpekbaqwuez.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw'
)

async function verificarConstraintStatus() {
  try {
    console.log('🔍 Verificando constraint de status na tabela ocar_vehicles...')
    
    // Tentar inserir com diferentes status para ver qual é aceito
    const statusPossiveis = ['ativo', 'pausado', 'expirado', 'pendente_pagamento']
    
    for (const status of statusPossiveis) {
      try {
        console.log(`\n🧪 Testando status: ${status}`)
        
        const { data, error } = await supabase
          .from('ocar_vehicles')
          .insert({
            dono_id: '091ef3dc-923b-467a-a4f6-a9660281494a',
            marca: 'Teste',
            modelo: 'Teste',
            versao: 'Teste',
            ano: 2024,
            cor: 'Teste',
            quilometragem: 1000,
            motor: 'Teste',
            combustivel: ['Gasolina'],
            cambio: 'Manual',
            preco: 1000,
            plano: 'gratuito',
            cidade: 'São Paulo',
            estado: 'SP',
            status: status,
            verificado: false,
            views: 0,
            likes: 0,
            shares: 0
          })
          .select()
          .single()
        
        if (error) {
          console.log(`   ❌ Status "${status}" REJEITADO: ${error.message}`)
        } else {
          console.log(`   ✅ Status "${status}" ACEITO!`)
          
          // Deletar o registro de teste
          await supabase
            .from('ocar_vehicles')
            .delete()
            .eq('id', data.id)
        }
        
      } catch (testError) {
        console.log(`   ❌ Erro ao testar "${status}": ${testError.message}`)
      }
    }
    
    console.log('\n🔧 SOLUÇÕES POSSÍVEIS:')
    console.log('   1. Atualizar constraint no banco para aceitar "pendente_pagamento"')
    console.log('   2. Usar status existente temporariamente')
    console.log('   3. Criar nova constraint no Supabase')
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

verificarConstraintStatus()
