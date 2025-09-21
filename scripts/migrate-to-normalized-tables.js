require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateToNormalizedTables() {
  try {
    console.log('🚀 Iniciando migração para tabelas normalizadas...');
    
    // 1. Buscar todos os dados da ocar_transbordo
    console.log('📊 Buscando dados da ocar_transbordo...');
    const { data: transbordoData, error: transbordoError } = await supabase
      .from('ocar_transbordo')
      .select('*')
      .eq('processado', false);
    
    if (transbordoError) {
      console.log('❌ Erro ao buscar dados:', transbordoError.message);
      return;
    }
    
    console.log(`✅ Encontrados ${transbordoData.length} registros`);
    
    // 2. Extrair marcas únicas
    const marcas = [...new Set(transbordoData.map(item => item.marca))];
    console.log(`📋 Encontradas ${marcas.length} marcas únicas`);
    
    // 3. Inserir marcas
    console.log('💾 Inserindo marcas...');
    const marcasToInsert = marcas.map(marca => ({ name: marca }));
    const { data: insertedBrands, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .upsert(marcasToInsert, { onConflict: 'name' })
      .select();
    
    if (brandsError) {
      console.log('❌ Erro ao inserir marcas:', brandsError.message);
      return;
    }
    
    console.log(`✅ Inseridas ${insertedBrands.length} marcas`);
    
    // 4. Criar mapa de marcas
    const brandMap = new Map();
    insertedBrands.forEach(brand => {
      brandMap.set(brand.name, brand.id);
    });
    
    // 5. Extrair modelos únicos por marca
    console.log('📊 Processando modelos...');
    const modelosMap = new Map();
    
    transbordoData.forEach(item => {
      const marca = item.marca;
      const modelo = item.modelo;
      
      // Extrair nome base do modelo (primeiro nome)
      const modeloBase = modelo.match(/^([A-Za-z]+)/)?.[1] || modelo;
      
      if (!modelosMap.has(marca)) {
        modelosMap.set(marca, new Set());
      }
      modelosMap.get(marca).add(modeloBase);
    });
    
    // 6. Inserir modelos
    console.log('💾 Inserindo modelos...');
    const modelosToInsert = [];
    
    for (const [marca, modelos] of modelosMap) {
      const brandId = brandMap.get(marca);
      if (brandId) {
        for (const modelo of modelos) {
          modelosToInsert.push({
            brand_id: brandId,
            name: modelo,
            full_name: null
          });
        }
      }
    }
    
    const { data: insertedModels, error: modelsError } = await supabase
      .from('ocar_fipe_models')
      .upsert(modelosToInsert, { onConflict: 'brand_id,name' })
      .select();
    
    if (modelsError) {
      console.log('❌ Erro ao inserir modelos:', modelsError.message);
      return;
    }
    
    console.log(`✅ Inseridos ${insertedModels.length} modelos`);
    
    // 7. Criar mapa de modelos
    const modelMap = new Map();
    insertedModels.forEach(model => {
      const key = `${model.brand_id}-${model.name}`;
      modelMap.set(key, model.id);
    });
    
    // 8. Inserir preços
    console.log('💾 Inserindo preços...');
    const pricesToInsert = [];
    
    for (const item of transbordoData) {
      const brandId = brandMap.get(item.marca);
      if (!brandId) continue;
      
      const modeloBase = item.modelo.match(/^([A-Za-z]+)/)?.[1] || item.modelo;
      const modelKey = `${brandId}-${modeloBase}`;
      const modelId = modelMap.get(modelKey);
      
      if (!modelId) continue;
      
      // Extrair versão (resto do nome do modelo)
      const versao = item.modelo.replace(/^[A-Za-z]+\s*/, '') || 'Base';
      
      pricesToInsert.push({
        model_id: modelId,
        version: versao,
        year: item.ano,
        fipe_code: item.codigo_fipe,
        reference_month: item.referencia_mes,
        price: item.preco
      });
    }
    
    // Inserir em lotes de 1000
    const batchSize = 1000;
    for (let i = 0; i < pricesToInsert.length; i += batchSize) {
      const batch = pricesToInsert.slice(i, i + batchSize);
      
      const { error: pricesError } = await supabase
        .from('ocar_fipe_prices')
        .upsert(batch, { onConflict: 'model_id,version,year,reference_month' });
      
      if (pricesError) {
        console.log(`❌ Erro ao inserir lote ${Math.floor(i/batchSize) + 1}:`, pricesError.message);
        continue;
      }
      
      console.log(`✅ Inserido lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(pricesToInsert.length/batchSize)}`);
    }
    
    console.log(`✅ Migração concluída!`);
    console.log(`📊 Resumo:`);
    console.log(`   - Marcas: ${insertedBrands.length}`);
    console.log(`   - Modelos: ${insertedModels.length}`);
    console.log(`   - Preços: ${pricesToInsert.length}`);
    
  } catch (err) {
    console.log('❌ Erro na migração:', err.message);
  }
}

migrateToNormalizedTables();
