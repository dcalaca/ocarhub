const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function processarMunicipios() {
  try {
    console.log('🚀 Processando municípios com codificação LATIN1...');
    
    // Ler arquivo CSV com latin1
    console.log('📖 Lendo arquivo CSV com codificação latin1...');
    const csvContent = fs.readFileSync('municipios.csv', 'latin1');
    console.log('✅ Arquivo lido com codificação latin1');
    
    // Processar linhas
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log(`📊 Total de linhas: ${lines.length}`);
    
    const estados = new Map();
    const municipios = [];
    
    // Processar cada linha (pular cabeçalho)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(';');
      if (columns.length < 6) {
        console.log(`⚠️ Linha ${i + 1} com dados incompletos, pulando...`);
        continue;
      }
      
      const codigoMunicipio = columns[1]?.trim();
      const nomeMunicipio = columns[3]?.trim();
      const uf = columns[4]?.trim();
      const nomeEstado = columns[5]?.trim();
      
      if (!codigoMunicipio || !nomeMunicipio || !uf || !nomeEstado) {
        console.log(`⚠️ Linha ${i + 1} com dados obrigatórios ausentes, pulando...`);
        continue;
      }
      
      // Adicionar estado se não existir
      if (!estados.has(uf)) {
        estados.set(uf, {
          codigo_ibge: codigoMunicipio.substring(0, 2),
          nome: nomeEstado,
          sigla: uf,
          regiao: getRegiao(uf)
        });
      }
      
      // Adicionar município
      municipios.push({
        codigo_ibge: codigoMunicipio,
        nome: nomeMunicipio,
        estado_sigla: uf,
        latitude: null,
        longitude: null
      });
      
      if (i % 1000 === 0) {
        console.log(`📊 Processados: ${i} registros...`);
      }
    }
    
    console.log(`✅ Processamento concluído!`);
    console.log(`📊 Estados: ${estados.size}`);
    console.log(`📊 Municípios: ${municipios.length}`);
    
    // Mostrar exemplos
    console.log('📋 Exemplos de estados:');
    Array.from(estados.values()).slice(0, 5).forEach(estado => {
      console.log(`  - ${estado.nome} (${estado.sigla}) - ${estado.regiao}`);
    });
    
    // Inserir estados
    console.log('🗄️ Inserindo estados...');
    const estadosArray = Array.from(estados.values());
    
    for (const estado of estadosArray) {
      const { data, error } = await supabase
        .from('ocar_estados')
        .insert(estado)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Erro ao inserir estado ${estado.nome}:`, error);
      } else {
        console.log(`✅ Estado inserido: ${estado.nome}`);
        // Armazenar ID do estado para os municípios
        estado.id = data.id;
      }
    }
    
    // Inserir municípios
    console.log('🗄️ Inserindo municípios...');
    const batchSize = 100;
    
    for (let i = 0; i < municipios.length; i += batchSize) {
      const batch = municipios.slice(i, i + batchSize);
      
      // Adicionar estado_id para cada município
      const municipiosComEstado = batch.map(municipio => {
        const estado = estadosArray.find(e => e.sigla === municipio.estado_sigla);
        return {
          codigo_ibge: municipio.codigo_ibge,
          nome: municipio.nome,
          estado_id: estado?.id,
          latitude: municipio.latitude,
          longitude: municipio.longitude
        };
      });
      
      const { error } = await supabase
        .from('ocar_municipios')
        .insert(municipiosComEstado);
      
      if (error) {
        console.error(`❌ Erro ao inserir lote de municípios:`, error);
      } else {
        console.log(`📊 Inseridos: ${i + batch.length} municípios...`);
      }
    }
    
    console.log('✅ Processamento concluído!');
    console.log(`📈 Estatísticas finais:`);
    console.log(`  - Estados: ${estados.size}`);
    console.log(`  - Municípios: ${municipios.length}`);
    
  } catch (error) {
    console.error('❌ Erro durante o processamento:', error);
  }
}

function getRegiao(uf) {
  const regioes = {
    'AC': 'Norte', 'AM': 'Norte', 'AP': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
    'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
    'DF': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste',
    'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
    'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul'
  };
  return regioes[uf] || 'N/A';
}

processarMunicipios();
