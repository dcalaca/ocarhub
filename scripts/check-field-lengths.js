require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFieldLengths() {
  try {
    console.log('🔍 Verificando tamanhos dos campos...');
    
    // Verificar dados da ocar_transbordo que podem ser muito longos
    const { data: transbordoData, error: transbordoError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, codigo_fipe, referencia_mes')
      .eq('processado', false)
      .limit(10);
    
    if (transbordoError) {
      console.log('❌ Erro ao buscar dados:', transbordoError.message);
      return;
    }
    
    console.log('📋 Amostra de dados da ocar_transbordo:');
    transbordoData.forEach((item, index) => {
      console.log(`${index + 1}. Marca: ${item.marca} (length: ${item.marca?.length || 0})`);
      console.log(`   Modelo: ${item.modelo} (length: ${item.modelo?.length || 0})`);
      console.log(`   Código FIPE: ${item.codigo_fipe} (length: ${item.codigo_fipe?.length || 0})`);
      console.log(`   Referência: ${item.referencia_mes} (length: ${item.referencia_mes?.length || 0})`);
      console.log('---');
    });
    
    // Verificar campos que podem ser muito longos
    const longMarcas = transbordoData.filter(item => item.marca && item.marca.length > 10);
    const longModelos = transbordoData.filter(item => item.modelo && item.modelo.length > 200);
    const longCodigos = transbordoData.filter(item => item.codigo_fipe && item.codigo_fipe.length > 10);
    const longReferencias = transbordoData.filter(item => item.referencia_mes && item.referencia_mes.length > 10);
    
    console.log('⚠️ Campos que podem ser muito longos:');
    console.log(`   - Marcas > 10 chars: ${longMarcas.length}`);
    console.log(`   - Modelos > 200 chars: ${longModelos.length}`);
    console.log(`   - Códigos FIPE > 10 chars: ${longCodigos.length}`);
    console.log(`   - Referências > 10 chars: ${longReferencias.length}`);
    
    // Verificar o campo que está causando problema
    if (longCodigos.length > 0) {
      console.log('🔍 Códigos FIPE longos:');
      longCodigos.forEach(item => {
        console.log(`   - ${item.codigo_fipe} (${item.codigo_fipe.length} chars)`);
      });
    }
    
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }
}

checkFieldLengths();
