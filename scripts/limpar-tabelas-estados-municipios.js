const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function limparTabelasEstadosMunicipios() {
  try {
    console.log('🗑️ Limpando tabelas de estados e municípios...');
    
    // Limpar municípios primeiro (devido à FK)
    console.log('🗑️ Removendo municípios...');
    const { error: errorMunicipios } = await supabase
      .from('ocar_municipios')
      .delete()
      .neq('id', 0);
    
    if (errorMunicipios) {
      console.error('❌ Erro ao limpar municípios:', errorMunicipios);
    } else {
      console.log('✅ Municípios removidos com sucesso');
    }
    
    // Limpar estados
    console.log('🗑️ Removendo estados...');
    const { error: errorEstados } = await supabase
      .from('ocar_estados')
      .delete()
      .neq('id', 0);
    
    if (errorEstados) {
      console.error('❌ Erro ao limpar estados:', errorEstados);
    } else {
      console.log('✅ Estados removidos com sucesso');
    }
    
    // Resetar sequências
    console.log('🔄 Resetando sequências...');
    
    // Resetar sequência de municípios
    const { error: errorSeqMunicipios } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER SEQUENCE ocar_municipios_id_seq RESTART WITH 1;' 
      });
    
    if (errorSeqMunicipios) {
      console.log('⚠️ Não foi possível resetar sequência de municípios (normal se não existir)');
    } else {
      console.log('✅ Sequência de municípios resetada');
    }
    
    // Resetar sequência de estados
    const { error: errorSeqEstados } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER SEQUENCE ocar_estados_id_seq RESTART WITH 1;' 
      });
    
    if (errorSeqEstados) {
      console.log('⚠️ Não foi possível resetar sequência de estados (normal se não existir)');
    } else {
      console.log('✅ Sequência de estados resetada');
    }
    
    // Verificar se as tabelas estão vazias
    console.log('🔍 Verificando se as tabelas estão vazias...');
    
    const { data: countEstados, error: errorCountEstados } = await supabase
      .from('ocar_estados')
      .select('id', { count: 'exact', head: true });
    
    const { data: countMunicipios, error: errorCountMunicipios } = await supabase
      .from('ocar_municipios')
      .select('id', { count: 'exact', head: true });
    
    if (errorCountEstados) {
      console.error('❌ Erro ao contar estados:', errorCountEstados);
    } else {
      console.log(`📊 Estados restantes: ${countEstados || 0}`);
    }
    
    if (errorCountMunicipios) {
      console.error('❌ Erro ao contar municípios:', errorCountMunicipios);
    } else {
      console.log(`📊 Municípios restantes: ${countMunicipios || 0}`);
    }
    
    if ((countEstados || 0) === 0 && (countMunicipios || 0) === 0) {
      console.log('✅ Tabelas limpas com sucesso!');
      console.log('🚀 Pronto para reprocessar os dados');
    } else {
      console.log('⚠️ Ainda há dados nas tabelas');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  limparTabelasEstadosMunicipios();
}

module.exports = { limparTabelasEstadosMunicipios };
