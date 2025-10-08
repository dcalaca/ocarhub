const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para limpar tabela (OPCIONAL - use com cuidado!)
async function clearTable() {
  console.log('⚠️  ATENÇÃO: Esta operação irá DELETAR todos os dados da tabela ocar_transbordo!');
  console.log('⚠️  Certifique-se de que você tem backup dos dados antes de continuar.');
  
  try {
    const { data, error } = await supabase
      .from('ocar_transbordo')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos os registros
    
    if (error) {
      console.error('❌ Erro ao limpar tabela:', error);
      return false;
    }
    
    console.log('✅ Tabela limpa com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    return false;
  }
}

// Função para verificar dados na tabela
async function checkTableData() {
  try {
    const { data, error, count } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro ao verificar tabela:', error);
      return;
    }
    
    console.log(`📊 Total de registros na tabela ocar_transbordo: ${count}`);
    
    // Verificar alguns registros de exemplo
    const { data: sampleData, error: sampleError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, ano, referencia_mes, preco')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Erro ao buscar amostra:', sampleError);
      return;
    }
    
    console.log('\n📋 Amostra dos dados:');
    sampleData.forEach((row, index) => {
      console.log(`${index + 1}. ${row.marca} ${row.modelo} ${row.ano} - ${row.referencia_mes} - R$ ${row.preco}`);
    });
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Função para verificar referência de mês
async function checkMonthReference() {
  try {
    const { data, error } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao verificar referência:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`📅 Mês de referência atual: ${data[0].referencia_mes}`);
    } else {
      console.log('📅 Tabela vazia - nenhuma referência encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação de referência:', error);
  }
}

// Função principal
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'clear':
      await clearTable();
      break;
    case 'check':
      await checkTableData();
      break;
    case 'month':
      await checkMonthReference();
      break;
    default:
      console.log('🔧 Script de gerenciamento da tabela FIPE');
      console.log('');
      console.log('Comandos disponíveis:');
      console.log('  node manage-fipe-table.js clear  - Limpar tabela (CUIDADO!)');
      console.log('  node manage-fipe-table.js check - Verificar dados na tabela');
      console.log('  node manage-fipe-table.js month  - Verificar mês de referência');
      break;
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Script finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { clearTable, checkTableData, checkMonthReference };
