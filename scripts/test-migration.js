require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMigration() {
  try {
    console.log('🔍 Testando migração...');
    
    // Verificar contagem de registros
    const { count: brandsCount } = await supabase
      .from('ocar_fipe_brands')
      .select('*', { count: 'exact', head: true });
    
    const { count: modelsCount } = await supabase
      .from('ocar_fipe_models')
      .select('*', { count: 'exact', head: true });
    
    const { count: pricesCount } = await supabase
      .from('ocar_fipe_prices')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Contagem de registros:');
    console.log(`   - Marcas: ${brandsCount}`);
    console.log(`   - Modelos: ${modelsCount}`);
    console.log(`   - Preços: ${pricesCount}`);
    
    // Testar função de filtros
    console.log('🧪 Testando função de filtros...');
    const { data: testData, error: testError } = await supabase.rpc('ocar_filtros_existing', {
      p_marca: 'Honda'
    });
    
    if (testError) {
      console.log('❌ Erro ao testar função:', testError.message);
    } else {
      console.log('✅ Função funcionando!');
      console.log('📋 Modelos Honda encontrados:', testData.modelos?.length || 0);
      console.log('📋 Primeiros 5 modelos:', testData.modelos?.slice(0, 5));
    }
    
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }
}

testMigration();
