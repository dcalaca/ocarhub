require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateExistingStructure() {
  try {
    console.log('🚀 Iniciando migração para estrutura existente...');
    
    // 1. Buscar todas as marcas únicas da ocar_transbordo
    console.log('📊 Buscando marcas únicas...');
    const { data: marcasData, error: marcasError } = await supabase
      .from('ocar_transbordo')
      .select('marca')
      .eq('processado', false);
    
    if (marcasError) {
      console.log('❌ Erro ao buscar marcas:', marcasError.message);
      return;
    }
    
    const marcasUnicas = [...new Set(marcasData.map(item => item.marca))];
    console.log(`✅ Encontradas ${marcasUnicas.length} marcas únicas`);
    
    // 2. Inserir marcas na ocar_fipe_brands
    console.log('💾 Inserindo marcas...');
    const marcasToInsert = marcasUnicas.map(marca => ({
      name: marca,
      code: marca.toLowerCase().replace(/\s+/g, '-'),
      active: true
    }));
    
    const { data: insertedBrands, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .upsert(marcasToInsert, { onConflict: 'name' })
      .select();
    
    if (brandsError) {
      console.log('❌ Erro ao inserir marcas:', brandsError.message);
      return;
    }
    
    console.log(`✅ Inseridas ${insertedBrands.length} marcas`);
    
    // 3. Criar mapa de marcas
    const brandMap = new Map();
    insertedBrands.forEach(brand => {
      brandMap.set(brand.name, brand.code);
    });
    
    // 4. Buscar todos os modelos únicos por marca
    console.log('📊 Processando modelos...');
    const modelosMap = new Map();
    
    for (const marca of marcasUnicas) {
      const { data: modelosData, error: modelosError } = await supabase
        .from('ocar_transbordo')
        .select('modelo')
        .eq('marca', marca)
        .eq('processado', false);
      
      if (modelosError) {
        console.log(`❌ Erro ao buscar modelos para ${marca}:`, modelosError.message);
        continue;
      }
      
      const modelosUnicos = [...new Set(modelosData.map(item => item.modelo))];
      modelosMap.set(marca, modelosUnicos);
      console.log(`📋 ${marca}: ${modelosUnicos.length} modelos únicos`);
    }
    
    // 5. Inserir modelos na ocar_fipe_models
    console.log('💾 Inserindo modelos...');
    const modelosToInsert = [];
    
    for (const [marca, modelos] of modelosMap) {
      const brandCode = brandMap.get(marca);
      if (brandCode) {
        for (const modelo of modelos) {
          modelosToInsert.push({
            brand_code: brandCode,
            name: modelo,
            code: `${brandCode}-${modelo.toLowerCase().replace(/\s+/g, '-')}`,
            active: true
          });
        }
      }
    }
    
    // Inserir em lotes de 1000
    const batchSize = 1000;
    let totalInserted = 0;
    
    for (let i = 0; i < modelosToInsert.length; i += batchSize) {
      const batch = modelosToInsert.slice(i, i + batchSize);
      
      const { data: insertedModels, error: modelsError } = await supabase
        .from('ocar_fipe_models')
        .upsert(batch, { onConflict: 'code' })
        .select();
      
      if (modelsError) {
        console.log(`❌ Erro ao inserir lote ${Math.floor(i/batchSize) + 1}:`, modelsError.message);
        continue;
      }
      
      totalInserted += insertedModels.length;
      console.log(`✅ Inserido lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(modelosToInsert.length/batchSize)} (${insertedModels.length} modelos)`);
    }
    
    console.log(`✅ Total de modelos inseridos: ${totalInserted}`);
    
    // 6. Inserir preços na ocar_fipe_prices
    console.log('💾 Inserindo preços...');
    
    // Buscar todos os registros da ocar_transbordo
    const { data: transbordoData, error: transbordoError } = await supabase
      .from('ocar_transbordo')
      .select('*')
      .eq('processado', false);
    
    if (transbordoError) {
      console.log('❌ Erro ao buscar dados da ocar_transbordo:', transbordoError.message);
      return;
    }
    
    // Buscar modelos para criar mapa
    const { data: allModels, error: allModelsError } = await supabase
      .from('ocar_fipe_models')
      .select('id, code, brand_code, name');
    
    if (allModelsError) {
      console.log('❌ Erro ao buscar modelos:', allModelsError.message);
      return;
    }
    
    const modelMap = new Map();
    allModels.forEach(model => {
      const key = `${model.brand_code}-${model.name.toLowerCase().replace(/\s+/g, '-')}`;
      modelMap.set(key, model.id);
    });
    
    // Processar preços
    const pricesToInsert = [];
    
    for (const item of transbordoData) {
      const brandCode = brandMap.get(item.marca);
      if (!brandCode) continue;
      
      const modelKey = `${brandCode}-${item.modelo.toLowerCase().replace(/\s+/g, '-')}`;
      const modelId = modelMap.get(modelKey);
      
      if (!modelId) continue;
      
      pricesToInsert.push({
        model_id: modelId,
        version: item.modelo, // Usar o modelo completo como versão
        year: item.ano,
        fipe_code: item.codigo_fipe,
        reference_month: item.referencia_mes,
        price: item.preco
      });
    }
    
    // Inserir preços em lotes
    let totalPricesInserted = 0;
    
    for (let i = 0; i < pricesToInsert.length; i += batchSize) {
      const batch = pricesToInsert.slice(i, i + batchSize);
      
      const { error: pricesError } = await supabase
        .from('ocar_fipe_prices')
        .upsert(batch, { onConflict: 'model_id,version,year,reference_month' });
      
      if (pricesError) {
        console.log(`❌ Erro ao inserir lote de preços ${Math.floor(i/batchSize) + 1}:`, pricesError.message);
        continue;
      }
      
      totalPricesInserted += batch.length;
      console.log(`✅ Inserido lote de preços ${Math.floor(i/batchSize) + 1}/${Math.ceil(pricesToInsert.length/batchSize)} (${batch.length} preços)`);
    }
    
    console.log(`✅ Total de preços inseridos: ${totalPricesInserted}`);
    
    console.log(`🎉 Migração concluída!`);
    console.log(`📊 Resumo:`);
    console.log(`   - Marcas: ${insertedBrands.length}`);
    console.log(`   - Modelos: ${totalInserted}`);
    console.log(`   - Preços: ${totalPricesInserted}`);
    
  } catch (err) {
    console.log('❌ Erro na migração:', err.message);
  }
}

migrateExistingStructure();
