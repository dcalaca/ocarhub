const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapeamento de caracteres malformados para corretos
const correcoesCaracteres = {
  'Rondnia': 'Rondônia',
  'Gois': 'Goiás', 
  'Par': 'Pará',
  'Amap': 'Amapá',
  'Maranho': 'Maranhão',
  'Piau': 'Piauí',
  'Paraba': 'Paraíba',
  'Cear': 'Ceará',
  'Pernambuco': 'Pernambuco',
  'Alagoas': 'Alagoas',
  'Sergipe': 'Sergipe',
  'Bahia': 'Bahia',
  'Minas Gerais': 'Minas Gerais',
  'Esprito Santo': 'Espírito Santo',
  'Rio de Janeiro': 'Rio de Janeiro',
  'So Paulo': 'São Paulo',
  'Paran': 'Paraná',
  'Santa Catarina': 'Santa Catarina',
  'Rio Grande do Sul': 'Rio Grande do Sul',
  'Mato Grosso': 'Mato Grosso',
  'Mato Grosso do Sul': 'Mato Grosso do Sul',
  'Distrito Federal': 'Distrito Federal'
};

async function corrigirCaracteresEstados() {
  try {
    console.log('🔧 Corrigindo caracteres especiais nos estados...');
    
    // Buscar todos os estados
    const { data: estados, error: fetchError } = await supabase
      .from('ocar_estados')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Erro ao buscar estados:', fetchError);
      return;
    }
    
    console.log(`📊 Encontrados ${estados.length} estados para corrigir`);
    
    // Corrigir cada estado
    for (const estado of estados) {
      const nomeOriginal = estado.nome;
      const nomeCorrigido = correcoesCaracteres[nomeOriginal] || nomeOriginal;
      
      if (nomeOriginal !== nomeCorrigido) {
        console.log(`🔄 Corrigindo: "${nomeOriginal}" → "${nomeCorrigido}"`);
        
        const { error: updateError } = await supabase
          .from('ocar_estados')
          .update({ nome: nomeCorrigido })
          .eq('id', estado.id);
        
        if (updateError) {
          console.error(`❌ Erro ao corrigir estado ${estado.id}:`, updateError);
        } else {
          console.log(`✅ Estado ${estado.id} corrigido com sucesso`);
        }
      }
    }
    
    console.log('✅ Correção de caracteres concluída!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  corrigirCaracteresEstados();
}

module.exports = { corrigirCaracteresEstados };
