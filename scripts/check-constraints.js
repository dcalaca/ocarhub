require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraints() {
  try {
    console.log('🔍 Verificando constraints das tabelas...');
    
    // Verificar constraints da tabela ocar_fipe_brands
    const { data: brandsConstraints, error: brandsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'ocar_fipe_brands')
      .eq('table_schema', 'public');
    
    if (brandsError) {
      console.log('❌ Erro ao buscar constraints de brands:', brandsError.message);
    } else {
      console.log('📋 Constraints de ocar_fipe_brands:');
      brandsConstraints.forEach(c => console.log(`   - ${c.constraint_name}: ${c.constraint_type}`));
    }
    
    // Verificar constraints da tabela ocar_fipe_models
    const { data: modelsConstraints, error: modelsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'ocar_fipe_models')
      .eq('table_schema', 'public');
    
    if (modelsError) {
      console.log('❌ Erro ao buscar constraints de models:', modelsError.message);
    } else {
      console.log('📋 Constraints de ocar_fipe_models:');
      modelsConstraints.forEach(c => console.log(`   - ${c.constraint_name}: ${c.constraint_type}`));
    }
    
    // Verificar constraints da tabela ocar_fipe_prices
    const { data: pricesConstraints, error: pricesError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'ocar_fipe_prices')
      .eq('table_schema', 'public');
    
    if (pricesError) {
      console.log('❌ Erro ao buscar constraints de prices:', pricesError.message);
    } else {
      console.log('📋 Constraints de ocar_fipe_prices:');
      pricesConstraints.forEach(c => console.log(`   - ${c.constraint_name}: ${c.constraint_type}`));
    }
    
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }
}

checkConstraints();
