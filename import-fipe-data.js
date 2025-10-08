const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurações
const CSV_FILE_PATH = './TabelaFipe/tabela-fipe-out25.csv';
const BATCH_SIZE = 1000; // Processar em lotes para evitar timeout
const REFERENCE_MONTH = 'outubro de 2025';

// Função para limpar e converter dados
function cleanData(row) {
  // Converter preço de "R$ 14.105,00" para número
  const priceStr = row.Price.replace('R$ ', '').replace('.', '').replace(',', '.');
  const price = parseFloat(priceStr);
  
  // Extrair ano do formato "1991-1" para apenas "1991"
  const year = parseInt(row['Year Code'].split('-')[0]);
  
  return {
    marca: row['Brand Value'].trim(),
    modelo: row['Model Value'].trim(),
    ano: year,
    codigo_fipe: row['Fipe Code'].trim(),
    referencia_mes: REFERENCE_MONTH,
    preco: price,
    processado: false
  };
}

// Função para inserir dados em lotes
async function insertBatch(data) {
  try {
    const { data: result, error } = await supabase
      .from('ocar_transbordo')
      .insert(data);
    
    if (error) {
      console.error('Erro ao inserir lote:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro na inserção:', error);
    return false;
  }
}

// Função principal
async function importFipeData() {
  console.log('🚀 Iniciando importação da tabela FIPE...');
  console.log(`📁 Arquivo: ${CSV_FILE_PATH}`);
  console.log(`📅 Mês de referência: ${REFERENCE_MONTH}`);
  console.log(`📦 Tamanho do lote: ${BATCH_SIZE}`);
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error('❌ Arquivo CSV não encontrado:', CSV_FILE_PATH);
    return;
  }
  
  let batch = [];
  let totalProcessed = 0;
  let totalInserted = 0;
  let errors = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          const cleanRow = cleanData(row);
          batch.push(cleanRow);
          
          // Processar lote quando atingir o tamanho definido
          if (batch.length >= BATCH_SIZE) {
            const success = await insertBatch([...batch]);
            if (success) {
              totalInserted += batch.length;
              console.log(`✅ Lote inserido: ${batch.length} registros (Total: ${totalInserted})`);
            } else {
              errors += batch.length;
              console.log(`❌ Erro no lote: ${batch.length} registros`);
            }
            
            batch = [];
          }
          
          totalProcessed++;
          
          // Log de progresso a cada 5000 registros
          if (totalProcessed % 5000 === 0) {
            console.log(`📊 Progresso: ${totalProcessed} registros processados`);
          }
        } catch (error) {
          console.error('Erro ao processar linha:', error, row);
          errors++;
        }
      })
      .on('end', async () => {
        // Processar último lote se houver dados restantes
        if (batch.length > 0) {
          const success = await insertBatch(batch);
          if (success) {
            totalInserted += batch.length;
            console.log(`✅ Último lote inserido: ${batch.length} registros`);
          } else {
            errors += batch.length;
            console.log(`❌ Erro no último lote: ${batch.length} registros`);
          }
        }
        
        console.log('\n🎉 Importação concluída!');
        console.log(`📊 Estatísticas:`);
        console.log(`   - Total processado: ${totalProcessed}`);
        console.log(`   - Total inserido: ${totalInserted}`);
        console.log(`   - Erros: ${errors}`);
        console.log(`   - Taxa de sucesso: ${((totalInserted / totalProcessed) * 100).toFixed(2)}%`);
        
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Erro ao ler arquivo CSV:', error);
        reject(error);
      });
  });
}

// Executar importação
if (require.main === module) {
  importFipeData()
    .then(() => {
      console.log('✅ Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { importFipeData };
