require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFunction() {
  try {
    console.log('🔍 Testando função ocarhub_filtros...');
    
    // Testar sem filtros (deve retornar marcas)
    const { data: data1, error: error1 } = await supabase
      .rpc('ocarhub_filtros');
    
    if (error1) {
      console.log('❌ Erro ao buscar marcas:', error1.message);
      return;
    }
    
    console.log('✅ Marcas encontradas:', data1.marcas?.length || 0);
    console.log('📋 Primeiras 5 marcas:', data1.marcas?.slice(0, 5));
    
    // Testar com marca Honda
    const { data: data2, error: error2 } = await supabase
      .rpc('ocarhub_filtros', { p_marca: 'Honda' });
    
    if (error2) {
      console.log('❌ Erro ao buscar modelos Honda:', error2.message);
      return;
    }
    
    console.log('✅ Modelos Honda encontrados:', data2.modelos?.length || 0);
    console.log('📋 Primeiros 10 modelos:', data2.modelos?.slice(0, 10));
    
    // Testar com marca e modelo
    if (data2.modelos && data2.modelos.length > 0) {
      const { data: data3, error: error3 } = await supabase
        .rpc('ocarhub_filtros', { 
          p_marca: 'Honda', 
          p_modelo_base: data2.modelos[0] 
        });
      
      if (error3) {
        console.log('❌ Erro ao buscar versões:', error3.message);
        return;
      }
      
      console.log('✅ Versões encontradas:', data3.versoes?.length || 0);
      console.log('📋 Primeiras 5 versões:', data3.versoes?.slice(0, 5));
    }
    
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }
}

testFunction();
