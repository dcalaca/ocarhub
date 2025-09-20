require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateSimple() {
  try {
    console.log('🚀 Iniciando migração simples...');
    
    // 1. Buscar marcas únicas da ocar_transbordo
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
    console.log(`✅ Encontradas ${marcasUnicas.length} marcas únicas:`, marcasUnicas);
    
    // 2. Inserir marcas uma por uma
    console.log('💾 Inserindo marcas...');
    const brandMap = new Map();
    
    for (const marca of marcasUnicas) {
      try {
        const { data: existingBrand, error: checkError } = await supabase
          .from('ocar_fipe_brands')
          .select('id, code')
          .eq('name', marca)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.log(`❌ Erro ao verificar marca ${marca}:`, checkError.message);
          continue;
        }
        
        if (existingBrand) {
          console.log(`✅ Marca ${marca} já existe`);
          brandMap.set(marca, existingBrand.code);
        } else {
          const { data: newBrand, error: insertError } = await supabase
            .from('ocar_fipe_brands')
            .insert({
              name: marca,
              code: marca.toLowerCase().replace(/\s+/g, '-'),
              active: true
            })
            .select();
          
          if (insertError) {
            console.log(`❌ Erro ao inserir marca ${marca}:`, insertError.message);
            continue;
          }
          
          console.log(`✅ Marca ${marca} inserida`);
          brandMap.set(marca, newBrand[0].code);
        }
      } catch (err) {
        console.log(`❌ Erro ao processar marca ${marca}:`, err.message);
      }
    }
    
    console.log(`✅ Processadas ${brandMap.size} marcas`);
    
    // 3. Buscar modelos únicos por marca
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
    
    // 4. Inserir modelos
    console.log('💾 Inserindo modelos...');
    let totalModels = 0;
    
    for (const [marca, modelos] of modelosMap) {
      const brandCode = brandMap.get(marca);
      if (!brandCode) continue;
      
      for (const modelo of modelos) {
        try {
          const { data: existingModel, error: checkError } = await supabase
            .from('ocar_fipe_models')
            .select('id')
            .eq('brand_code', brandCode)
            .eq('name', modelo)
            .single();
          
          if (checkError && checkError.code !== 'PGRST116') {
            console.log(`❌ Erro ao verificar modelo ${modelo}:`, checkError.message);
            continue;
          }
          
          if (!existingModel) {
            const { error: insertError } = await supabase
              .from('ocar_fipe_models')
              .insert({
                brand_code: brandCode,
                name: modelo,
                code: `${brandCode}-${modelo.toLowerCase().replace(/\s+/g, '-')}`,
                active: true
              });
            
            if (insertError) {
              console.log(`❌ Erro ao inserir modelo ${modelo}:`, insertError.message);
              continue;
            }
            
            totalModels++;
            if (totalModels % 100 === 0) {
              console.log(`✅ Inseridos ${totalModels} modelos...`);
            }
          }
        } catch (err) {
          console.log(`❌ Erro ao processar modelo ${modelo}:`, err.message);
        }
      }
    }
    
    console.log(`✅ Total de modelos inseridos: ${totalModels}`);
    
    // 5. Verificar contagem final
    console.log('📊 Verificando contagem final...');
    
    const { count: finalBrandsCount } = await supabase
      .from('ocar_fipe_brands')
      .select('*', { count: 'exact', head: true });
    
    const { count: finalModelsCount } = await supabase
      .from('ocar_fipe_models')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Contagem final:`);
    console.log(`   - Marcas: ${finalBrandsCount}`);
    console.log(`   - Modelos: ${finalModelsCount}`);
    
    console.log('🎉 Migração concluída!');
    
  } catch (err) {
    console.log('❌ Erro na migração:', err.message);
  }
}

migrateSimple();
