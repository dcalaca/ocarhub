// Script para testar as APIs de filtros
const baseUrl = 'http://localhost:3000';

const apis = [
  '/api/filters/combustiveis',
  '/api/filters/cores',
  '/api/filters/carrocerias',
  '/api/filters/opcionais',
  '/api/filters/tipos-vendedor',
  '/api/filters/caracteristicas',
  '/api/filters/finais-placa',
  '/api/filters/blindagem',
  '/api/filters/leilao'
];

async function testApi(endpoint) {
  try {
    console.log(`\n🔍 Testando: ${endpoint}`);
    const response = await fetch(`${baseUrl}${endpoint}`);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Dados:`, Array.isArray(data) ? `${data.length} itens` : typeof data);
    
    if (data.error) {
      console.log(`❌ Erro:`, data.error);
    } else if (Array.isArray(data) && data.length > 0) {
      console.log(`📝 Primeiro item:`, data[0]);
    }
    
    return { success: response.ok, data };
  } catch (error) {
    console.log(`❌ Erro de rede:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testAllApis() {
  console.log('🚀 Iniciando teste das APIs de filtros...\n');
  
  const results = {};
  
  for (const api of apis) {
    const result = await testApi(api);
    results[api] = result;
  }
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('==================');
  
  Object.entries(results).forEach(([api, result]) => {
    const status = result.success ? '✅' : '❌';
    const dataType = Array.isArray(result.data) ? `Array(${result.data.length})` : typeof result.data;
    console.log(`${status} ${api}: ${dataType}`);
  });
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = apis.length;
  
  console.log(`\n🎯 Resultado: ${successCount}/${totalCount} APIs funcionando`);
  
  if (successCount === 0) {
    console.log('\n💡 SOLUÇÃO: Execute o SQL no Supabase SQL Editor:');
    console.log('   1. Acesse o Supabase Dashboard');
    console.log('   2. Vá para SQL Editor');
    console.log('   3. Execute o arquivo: database/opcionais-tables.sql');
  }
}

testAllApis().catch(console.error);
