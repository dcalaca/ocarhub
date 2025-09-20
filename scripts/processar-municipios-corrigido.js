const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapeamento de regiões por estado
const regioesPorEstado = {
  'AC': 'Norte', 'AM': 'Norte', 'AP': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
  'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 
  'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
  'DF': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste',
  'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
  'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul'
};

// Correções de caracteres específicas
const correcoesCaracteres = {
  'Rondnia': 'Rondônia',
  'Gois': 'Goiás',
  'Par': 'Pará',
  'Amap': 'Amapá',
  'Maranho': 'Maranhão',
  'Piau': 'Piauí',
  'Paraba': 'Paraíba',
  'Cear': 'Ceará',
  'Esprito Santo': 'Espírito Santo',
  'So Paulo': 'São Paulo',
  'Paran': 'Paraná',
  'GUAJAR-MIRIM': 'GUAJARÁ-MIRIM',
  'Guajar-Mirim': 'Guajará-Mirim',
  'ALTO ALEGRE DOS PARECIS': 'ALTO ALEGRE DOS PARECIS',
  'Alto Alegre dos Parecis': 'Alto Alegre dos Parecis'
};

function corrigirCaracteres(texto) {
  let textoCorrigido = texto;
  
  for (const [errado, correto] of Object.entries(correcoesCaracteres)) {
    textoCorrigido = textoCorrigido.replace(new RegExp(errado, 'g'), correto);
  }
  
  return textoCorrigido;
}

async function processarMunicipiosCorrigido() {
  try {
    console.log('🚀 Processando municípios com correção de caracteres...');
    
    // Limpar dados existentes
    console.log('🗑️ Limpando dados existentes...');
    await supabase.from('ocar_municipios').delete().neq('id', 0);
    await supabase.from('ocar_estados').delete().neq('id', 0);
    
    // Ler arquivo CSV
    const csvPath = path.join(process.cwd(), 'municipios.csv');
    console.log('📖 Lendo arquivo CSV...');
    
    // Tentar diferentes codificações
    let csvContent;
    const encodings = ['utf8', 'latin1'];
    
    for (const encoding of encodings) {
      try {
        csvContent = fs.readFileSync(csvPath, encoding);
        console.log(`✅ Arquivo lido com codificação: ${encoding}`);
        break;
      } catch (error) {
        console.log(`❌ Falha ao ler com ${encoding}: ${error.message}`);
      }
    }
    
    if (!csvContent) {
      console.error('❌ Não foi possível ler o arquivo');
      return;
    }
    
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log(`📊 Total de linhas: ${lines.length}`);
    
    // Processar dados
    const estados = new Map();
    const municipios = [];
    let processados = 0;
    
    console.log('🔄 Processando dados...');
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const values = line.split(';').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length < 6) {
          console.warn(`⚠️ Linha ${i + 1} com poucas colunas, pulando...`);
          continue;
        }
        
        const codigoMunicipio = values[1]?.trim();
        const nomeMunicipio = corrigirCaracteres(values[3]?.trim());
        const uf = values[4]?.trim();
        const nomeEstado = corrigirCaracteres(values[5]?.trim());
        
        if (!codigoMunicipio || !nomeMunicipio || !uf) {
          console.warn(`⚠️ Linha ${i + 1} com dados incompletos, pulando...`);
          continue;
        }
        
        const codigoEstado = codigoMunicipio.substring(0, 2);
        
        // Adicionar estado se não existir
        if (!estados.has(codigoEstado)) {
          const regiao = regioesPorEstado[uf] || 'Desconhecida';
          estados.set(codigoEstado, {
            codigo_ibge: codigoEstado,
            nome: nomeEstado,
            sigla: uf,
            regiao: regiao
          });
        }
        
        // Adicionar município
        municipios.push({
          codigo_ibge: codigoMunicipio,
          nome: nomeMunicipio,
          estado_codigo: codigoEstado,
          latitude: null,
          longitude: null
        });
        
        processados++;
        
        if (processados % 1000 === 0) {
          console.log(`📊 Processados: ${processados} registros...`);
        }
        
      } catch (error) {
        console.error(`❌ Erro na linha ${i + 1}:`, error.message);
      }
    }
    
    console.log(`✅ Processamento concluído!`);
    console.log(`📊 Estados: ${estados.size}`);
    console.log(`📊 Municípios: ${municipios.length}`);
    
    // Mostrar alguns exemplos de estados
    console.log('📋 Exemplos de estados:');
    Array.from(estados.values()).slice(0, 5).forEach(estado => {
      console.log(`  - ${estado.nome} (${estado.sigla}) - ${estado.regiao}`);
    });
    
    // Inserir estados
    console.log('🗄️ Inserindo estados...');
    const estadosArray = Array.from(estados.values());
    
    for (const estado of estadosArray) {
      try {
        const { data, error } = await supabase.rpc('inserir_estado', {
          p_codigo_ibge: estado.codigo_ibge,
          p_nome: estado.nome,
          p_sigla: estado.sigla,
          p_regiao: estado.regiao
        });
        
        if (error) {
          console.error(`❌ Erro ao inserir estado ${estado.nome}:`, error.message);
        } else {
          console.log(`✅ Estado inserido: ${estado.nome}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao inserir estado ${estado.nome}:`, error.message);
      }
    }
    
    // Inserir municípios em lotes
    console.log('🗄️ Inserindo municípios...');
    const batchSize = 100;
    
    for (let i = 0; i < municipios.length; i += batchSize) {
      const batch = municipios.slice(i, i + batchSize);
      
      for (const municipio of batch) {
        try {
          const { data, error } = await supabase.rpc('inserir_municipio', {
            p_codigo_ibge: municipio.codigo_ibge,
            p_nome: municipio.nome,
            p_estado_codigo: municipio.estado_codigo,
            p_latitude: municipio.latitude,
            p_longitude: municipio.longitude
          });
          
          if (error) {
            console.error(`❌ Erro ao inserir município ${municipio.nome}:`, error.message);
          }
        } catch (error) {
          console.error(`❌ Erro ao inserir município ${municipio.nome}:`, error.message);
        }
      }
      
      if ((i + batchSize) % 1000 === 0) {
        console.log(`📊 Inseridos: ${Math.min(i + batchSize, municipios.length)} municípios...`);
      }
    }
    
    console.log('✅ Processamento concluído!');
    
    // Verificar resultado
    const { data: stats } = await supabase.rpc('estatisticas_estados_municipios');
    if (stats && stats[0]) {
      console.log('📈 Estatísticas finais:');
      console.log(`  - Estados: ${stats[0].total_estados}`);
      console.log(`  - Municípios: ${stats[0].total_municipios}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  processarMunicipiosCorrigido();
}

module.exports = { processarMunicipiosCorrigido };
