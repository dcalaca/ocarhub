require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function installFunction() {
  try {
    console.log('📦 Instalando função ocar_filtros_existing...');
    
    const sql = fs.readFileSync('database/filtros-existing-structure.sql', 'utf8');
    
    // Testar se a função existe
    const { data, error } = await supabase.rpc('ocar_filtros_existing');
    
    if (error) {
      console.log('❌ Função não encontrada. Execute o SQL manualmente no Supabase:');
      console.log('📋 Copie e cole este SQL no Supabase SQL Editor:');
      console.log('─'.repeat(50));
      console.log(sql);
      console.log('─'.repeat(50));
    } else {
      console.log('✅ Função já existe! Testando...');
      
      // Testar a função
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
    }
    
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }
}

installFunction();
