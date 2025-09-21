require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBothFunctions() {
  try {
    console.log('🔍 Testando função original ocarhub_filtros...');
    
    const { data: data1, error: error1 } = await supabase.rpc('ocarhub_filtros', {
      p_marca: 'Honda'
    });
    
    if (error1) {
      console.log('❌ Erro na função original:', error1.message);
    } else {
      console.log('✅ Função original funcionando');
      console.log('📋 Modelos (original):', data1.modelos?.slice(0, 5));
    }
    
    console.log('\n🔍 Testando função nova ocarhub_filtros_v2...');
    
    const { data: data2, error: error2 } = await supabase.rpc('ocarhub_filtros_v2', {
      p_marca: 'Honda'
    });
    
    if (error2) {
      console.log('❌ Erro na função nova:', error2.message);
    } else {
      console.log('✅ Função nova funcionando');
      console.log('📋 Modelos (nova):', data2.modelos?.slice(0, 5));
    }
    
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }
}

testBothFunctions();
