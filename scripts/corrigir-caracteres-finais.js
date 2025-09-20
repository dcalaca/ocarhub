const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function corrigirCaracteres() {
  try {
    console.log('🔧 Corrigindo caracteres especiais nas tabelas...');
    
    // Buscar estados com caracteres problemáticos
    const { data: estados, error: errorEstados } = await supabase
      .from('ocar_estados')
      .select('*');
    
    if (errorEstados) {
      console.error('❌ Erro ao buscar estados:', errorEstados);
      return;
    }
    
    console.log(`📊 Encontrados ${estados.length} estados`);
    
    // Correções específicas
    const correcoes = {
      'Amap??': 'Amapá',
      'Cear??': 'Ceará',
      'Esp??rito Santo': 'Espírito Santo',
      'Goi??s': 'Goiás',
      'Maranh??o': 'Maranhão',
      'Par??': 'Pará',
      'Para??ba': 'Paraíba',
      'Paran??': 'Paraná',
      'Piau??': 'Piauí',
      'Rond??nia': 'Rondônia',
      'S??o Paulo': 'São Paulo'
    };
    
    // Corrigir estados
    for (const estado of estados) {
      const nomeCorrigido = correcoes[estado.nome] || estado.nome;
      
      if (nomeCorrigido !== estado.nome) {
        console.log(`🔧 Corrigindo: ${estado.nome} → ${nomeCorrigido}`);
        
        const { error } = await supabase
          .from('ocar_estados')
          .update({ nome: nomeCorrigido })
          .eq('id', estado.id);
        
        if (error) {
          console.error(`❌ Erro ao corrigir estado ${estado.nome}:`, error);
        } else {
          console.log(`✅ Estado corrigido: ${nomeCorrigido}`);
        }
      }
    }
    
    // Buscar municípios com caracteres problemáticos
    const { data: municipios, error: errorMunicipios } = await supabase
      .from('ocar_municipios')
      .select('*')
      .limit(1000);
    
    if (errorMunicipios) {
      console.error('❌ Erro ao buscar municípios:', errorMunicipios);
      return;
    }
    
    console.log(`📊 Verificando ${municipios.length} municípios...`);
    
    // Corrigir municípios
    let corrigidos = 0;
    for (const municipio of municipios) {
      let nomeCorrigido = municipio.nome;
      
      // Aplicar correções comuns
      nomeCorrigido = nomeCorrigido
        .replace(/Ã¡/g, 'á')
        .replace(/Ã /g, 'à')
        .replace(/Ã¢/g, 'â')
        .replace(/Ã£/g, 'ã')
        .replace(/Ã©/g, 'é')
        .replace(/Ãª/g, 'ê')
        .replace(/Ã­/g, 'í')
        .replace(/Ã³/g, 'ó')
        .replace(/Ã´/g, 'ô')
        .replace(/Ãµ/g, 'õ')
        .replace(/Ãº/g, 'ú')
        .replace(/Ã§/g, 'ç')
        .replace(/Ã/g, 'Á')
        .replace(/Ã‰/g, 'É')
        .replace(/ÃŠ/g, 'Ê')
        .replace(/ÃŒ/g, 'Í')
        .replace(/Ã"/g, 'Ó')
        .replace(/Ã"/g, 'Ô')
        .replace(/Ã•/g, 'Õ')
        .replace(/Ãš/g, 'Ú')
        .replace(/Ã‡/g, 'Ç');
      
      if (nomeCorrigido !== municipio.nome) {
        const { error } = await supabase
          .from('ocar_municipios')
          .update({ nome: nomeCorrigido })
          .eq('id', municipio.id);
        
        if (!error) {
          corrigidos++;
          if (corrigidos <= 10) {
            console.log(`🔧 Município: ${municipio.nome} → ${nomeCorrigido}`);
          }
        }
      }
    }
    
    console.log(`✅ Correção concluída!`);
    console.log(`📊 Estados corrigidos: ${Object.keys(correcoes).length}`);
    console.log(`📊 Municípios corrigidos: ${corrigidos}`);
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

corrigirCaracteres();
