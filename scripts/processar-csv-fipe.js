/**
 * Script para processar CSV de dados FIPE e normalizar automaticamente
 * Este script lê um arquivo CSV, converte para JSON e chama a função de processamento
 */

const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class FipeCsvProcessor {
  constructor() {
    this.csvData = [];
    this.stats = {
      totalRows: 0,
      processedRows: 0,
      errors: 0,
      brands: 0,
      models: 0,
      prices: 0
    };
  }

  /**
   * Lê arquivo CSV e converte para array de objetos
   */
  async readCsvFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      if (!fs.existsSync(filePath)) {
        reject(new Error(`Arquivo não encontrado: ${filePath}`));
        return;
      }

      console.log(`📁 Lendo arquivo CSV: ${filePath}`);
      
      fs.createReadStream(filePath)
        .pipe(csv({
          separator: ',', // ou ';' dependendo do CSV
          headers: true,
          skipEmptyLines: true
        }))
        .on('data', (data) => {
          // Normalizar dados do CSV para o formato esperado
          const normalizedData = this.normalizeCsvRow(data);
          if (normalizedData) {
            results.push(normalizedData);
          }
        })
        .on('end', () => {
          console.log(`✅ CSV lido com sucesso: ${results.length} registros`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('❌ Erro ao ler CSV:', error);
          reject(error);
        });
    });
  }

  /**
   * Normaliza uma linha do CSV para o formato esperado pela função SQL
   */
  normalizeCsvRow(row) {
    try {
      // Mapear colunas do CSV para o formato esperado
      // Ajuste os nomes das colunas conforme seu CSV
      const normalized = {
        brand_code: row.brand_code || row.codigo_marca || '',
        brand_name: row.brand_name || row.marca || row.Marca || '',
        model_code: row.model_code || row.codigo_modelo || '',
        model_name: row.model_name || row.modelo || row.Modelo || '',
        model_full_name: row.model_full_name || row.nome_completo || row['Nome Completo'] || '',
        year_code: row.year_code || row.codigo_ano || '',
        year_name: row.year_name || row.ano_nome || row['Ano Nome'] || '',
        year_number: parseInt(row.year_number || row.ano || row.Ano || '0'),
        fuel_type: row.fuel_type || row.combustivel || row.Combustivel || '',
        fipe_code: row.fipe_code || row.codigo_fipe || row['Código FIPE'] || '',
        reference_month: row.reference_month || row.referencia_mes || row['Referência Mês'] || new Date().toISOString().slice(0, 7),
        price: parseFloat(row.price || row.preco || row.Preço || '0')
      };

      // Validar dados obrigatórios
      if (!normalized.brand_name || !normalized.model_name || !normalized.fipe_code) {
        console.warn('⚠️ Linha ignorada - dados obrigatórios ausentes:', row);
        return null;
      }

      return normalized;
    } catch (error) {
      console.warn('⚠️ Erro ao normalizar linha:', error.message, row);
      return null;
    }
  }

  /**
   * Processa dados CSV no Supabase
   */
  async processCsvData(csvData) {
    try {
      console.log('🔄 Processando dados CSV no Supabase...');
      
      // Chamar função SQL para processar CSV
      const { data, error } = await supabase.rpc('processar_csv_fipe', {
        p_dados_csv: csvData
      });

      if (error) {
        throw new Error(`Erro ao processar CSV: ${error.message}`);
      }

      if (data && data.length > 0) {
        const result = data[0];
        this.stats = {
          totalRows: csvData.length,
          processedRows: result.registros_inseridos || 0,
          errors: 0,
          brands: result.marcas_novas || 0,
          models: result.modelos_novos || 0,
          prices: result.precos_atualizados || 0
        };
      }

      console.log('✅ Dados processados com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao processar dados:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Normaliza dados existentes da tabela transbordo
   */
  async normalizeExistingData() {
    try {
      console.log('🔄 Normalizando dados existentes da tabela transbordo...');
      
      const { data, error } = await supabase.rpc('normalizar_dados_fipe');

      if (error) {
        throw new Error(`Erro ao normalizar dados: ${error.message}`);
      }

      if (data && data.length > 0) {
        const result = data[0];
        console.log('✅ Dados normalizados:');
        console.log(`   📊 Marcas processadas: ${result.marcas_processadas}`);
        console.log(`   🚗 Modelos processados: ${result.modelos_processados}`);
        console.log(`   💰 Preços processados: ${result.precos_processados}`);
      }

      return true;

    } catch (error) {
      console.error('❌ Erro ao normalizar dados existentes:', error);
      return false;
    }
  }

  /**
   * Verifica estatísticas das tabelas
   */
  async checkStats() {
    try {
      console.log('📊 Verificando estatísticas das tabelas...');
      
      const { data: brandsData } = await supabase
        .from('ocar_fipe_brands')
        .select('id', { count: 'exact' });

      const { data: modelsData } = await supabase
        .from('ocar_fipe_models')
        .select('id', { count: 'exact' });

      const { data: pricesData } = await supabase
        .from('ocar_fipe_prices')
        .select('id', { count: 'exact' });

      const { data: transbordoData } = await supabase
        .from('ocar_transbordo')
        .select('id', { count: 'exact' });

      console.log('\n📈 ESTATÍSTICAS DAS TABELAS:');
      console.log(`   🏷️  Marcas: ${brandsData?.length || 0}`);
      console.log(`   🚗 Modelos: ${modelsData?.length || 0}`);
      console.log(`   💰 Preços: ${pricesData?.length || 0}`);
      console.log(`   📦 Transbordo: ${transbordoData?.length || 0}`);

      return true;

    } catch (error) {
      console.error('❌ Erro ao verificar estatísticas:', error);
      return false;
    }
  }

  /**
   * Testa consultas de exemplo
   */
  async testQueries() {
    try {
      console.log('🧪 Testando consultas de exemplo...');
      
      // Testar listar marcas
      const { data: marcas } = await supabase.rpc('listar_marcas');
      console.log(`\n🏷️  Primeiras 5 marcas:`, marcas?.slice(0, 5));

      // Testar buscar preço
      if (marcas && marcas.length > 0) {
        const marca = marcas[0].name;
        const { data: modelos } = await supabase.rpc('listar_modelos_por_marca', { p_marca: marca });
        
        if (modelos && modelos.length > 0) {
          const modelo = modelos[0].name;
          const { data: precos } = await supabase.rpc('buscar_preco_fipe', {
            p_marca: marca,
            p_modelo: modelo,
            p_ano: 2020
          });
          
          console.log(`💰 Preço exemplo (${marca} ${modelo} 2020):`, precos?.[0]);
        }
      }

      return true;

    } catch (error) {
      console.error('❌ Erro ao testar consultas:', error);
      return false;
    }
  }

  /**
   * Processa arquivo CSV completo
   */
  async processFile(filePath) {
    try {
      console.log('🚀 Iniciando processamento de CSV FIPE...\n');

      // 1. Ler arquivo CSV
      const csvData = await this.readCsvFile(filePath);
      
      if (csvData.length === 0) {
        console.log('⚠️ Nenhum dado encontrado no CSV');
        return false;
      }

      // 2. Processar dados
      const success = await this.processCsvData(csvData);
      
      if (!success) {
        return false;
      }

      // 3. Verificar estatísticas
      await this.checkStats();

      // 4. Testar consultas
      await this.testQueries();

      // 5. Mostrar resumo
      console.log('\n🎉 PROCESSAMENTO CONCLUÍDO!');
      console.log(`   📊 Total de registros: ${this.stats.totalRows}`);
      console.log(`   ✅ Processados: ${this.stats.processedRows}`);
      console.log(`   🏷️  Marcas novas: ${this.stats.brands}`);
      console.log(`   🚗 Modelos novos: ${this.stats.models}`);
      console.log(`   💰 Preços atualizados: ${this.stats.prices}`);
      console.log(`   ❌ Erros: ${this.stats.errors}`);

      return true;

    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      return false;
    }
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Uso: node processar-csv-fipe.js <caminho-do-csv> [--normalize-only]');
    console.log('');
    console.log('Exemplos:');
    console.log('  node processar-csv-fipe.js dados-fipe.csv');
    console.log('  node processar-csv-fipe.js dados-fipe.csv --normalize-only');
    console.log('');
    process.exit(1);
  }

  const csvPath = args[0];
  const normalizeOnly = args.includes('--normalize-only');
  
  const processor = new FipeCsvProcessor();

  try {
    if (normalizeOnly) {
      // Apenas normalizar dados existentes
      console.log('🔄 Modo: Normalizar dados existentes apenas');
      await processor.normalizeExistingData();
      await processor.checkStats();
    } else {
      // Processar arquivo CSV
      await processor.processFile(csvPath);
    }
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = FipeCsvProcessor;
