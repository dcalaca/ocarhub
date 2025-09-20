require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateMonthlyPrices(csvFilePath, referenceMonth) {
  try {
    console.log(`🔄 Iniciando atualização mensal de preços para ${referenceMonth}...`);
    
    // 1. Buscar marcas e modelos existentes
    console.log('📊 Buscando marcas e modelos existentes...');
    const { data: brands, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .select('id, name');
    
    if (brandsError) {
      console.log('❌ Erro ao buscar marcas:', brandsError.message);
      return;
    }
    
    const { data: models, error: modelsError } = await supabase
      .from('ocar_fipe_models')
      .select('id, name, brand_id, ocar_fipe_brands(name)');
    
    if (modelsError) {
      console.log('❌ Erro ao buscar modelos:', modelsError.message);
      return;
    }
    
    // Criar mapas para busca rápida
    const brandMap = new Map();
    brands.forEach(brand => {
      brandMap.set(brand.name, brand.id);
    });
    
    const modelMap = new Map();
    models.forEach(model => {
      const key = `${model.ocar_fipe_brands.name}-${model.name}`;
      modelMap.set(key, model.id);
    });
    
    console.log(`✅ Encontradas ${brands.length} marcas e ${models.length} modelos`);
    
    // 2. Processar CSV
    console.log('📄 Processando arquivo CSV...');
    const csvData = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Adaptar conforme a estrutura do seu CSV
          csvData.push({
            marca: row.marca || row.Marca,
            modelo: row.modelo || row.Modelo,
            ano: parseInt(row.ano || row.Ano),
            codigo_fipe: row.codigo_fipe || row['Código FIPE'],
            preco: parseFloat(row.preco || row.Preço || row.Price),
            referencia_mes: referenceMonth
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`✅ Processados ${csvData.length} registros do CSV`);
    
    // 3. Processar e inserir/atualizar preços
    console.log('💾 Atualizando preços...');
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    
    for (const item of csvData) {
      try {
        // Extrair nome base do modelo
        const modeloBase = item.modelo.match(/^([A-Za-z]+)/)?.[1] || item.modelo;
        const versao = item.modelo.replace(/^[A-Za-z]+\s*/, '') || 'Base';
        
        // Buscar modelo
        const modelKey = `${item.marca}-${modeloBase}`;
        const modelId = modelMap.get(modelKey);
        
        if (!modelId) {
          console.log(`⚠️  Modelo não encontrado: ${modelKey}`);
          errors++;
          continue;
        }
        
        // Verificar se já existe
        const { data: existingPrice, error: checkError } = await supabase
          .from('ocar_fipe_prices')
          .select('id')
          .eq('model_id', modelId)
          .eq('version', versao)
          .eq('year', item.ano)
          .eq('reference_month', item.referencia_mes)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.log(`❌ Erro ao verificar preço existente:`, checkError.message);
          errors++;
          continue;
        }
        
        const priceData = {
          model_id: modelId,
          version: versao,
          year: item.ano,
          fipe_code: item.codigo_fipe,
          reference_month: item.referencia_mes,
          price: item.preco
        };
        
        if (existingPrice) {
          // Atualizar preço existente
          const { error: updateError } = await supabase
            .from('ocar_fipe_prices')
            .update({ price: item.preco, updated_at: new Date().toISOString() })
            .eq('id', existingPrice.id);
          
          if (updateError) {
            console.log(`❌ Erro ao atualizar preço:`, updateError.message);
            errors++;
          } else {
            updated++;
          }
        } else {
          // Inserir novo preço
          const { error: insertError } = await supabase
            .from('ocar_fipe_prices')
            .insert(priceData);
          
          if (insertError) {
            console.log(`❌ Erro ao inserir preço:`, insertError.message);
            errors++;
          } else {
            inserted++;
          }
        }
        
      } catch (err) {
        console.log(`❌ Erro ao processar item:`, err.message);
        errors++;
      }
    }
    
    console.log(`✅ Atualização concluída!`);
    console.log(`📊 Resumo:`);
    console.log(`   - Inseridos: ${inserted}`);
    console.log(`   - Atualizados: ${updated}`);
    console.log(`   - Erros: ${errors}`);
    
  } catch (err) {
    console.log('❌ Erro na atualização:', err.message);
  }
}

// Exemplo de uso
if (process.argv.length < 4) {
  console.log('Uso: node update-monthly-prices.js <caminho-do-csv> <mes-referencia>');
  console.log('Exemplo: node update-monthly-prices.js ./tabelafipe.csv 2025-10');
  process.exit(1);
}

const csvFilePath = process.argv[2];
const referenceMonth = process.argv[3];

updateMonthlyPrices(csvFilePath, referenceMonth);
