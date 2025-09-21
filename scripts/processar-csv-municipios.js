const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
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

// Mapeamento de siglas por código IBGE
const siglasPorCodigo = {
  '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
  '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE', '29': 'BA',
  '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP',
  '41': 'PR', '42': 'SC', '43': 'RS',
  '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF'
};

async function processarCSVMunicipios() {
  try {
    console.log('🚀 Iniciando processamento do CSV de municípios...');
    
    // Caminho do arquivo CSV
    const csvPath = path.join(process.cwd(), 'municipios.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Arquivo municipios.csv não encontrado!');
      console.log('📁 Coloque o arquivo na raiz do projeto e tente novamente.');
      return;
    }
    
    // Ler arquivo CSV com diferentes codificações
    console.log('📖 Lendo arquivo CSV...');
    let csvContent;
    
    try {
      // Tentar UTF-8 primeiro
      csvContent = fs.readFileSync(csvPath, 'utf8');
    } catch (error) {
      try {
        // Tentar Latin1 se UTF-8 falhar
        csvContent = fs.readFileSync(csvPath, 'latin1');
      } catch (error2) {
        // Tentar Windows-1252
        csvContent = fs.readFileSync(csvPath, 'windows-1252');
      }
    }
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    console.log(`📊 Total de linhas encontradas: ${lines.length}`);
    
    // Processar cabeçalho (usando ponto e vírgula como separador)
    const header = lines[0].split(';').map(h => h.trim().replace(/"/g, ''));
    console.log('📋 Cabeçalho:', header);
    
    // Determinar índices das colunas baseado na estrutura real
    // Baseado no cabeçalho: ['CÓDIGO DO MUNICÍPIO - TOM', 'CÓDIGO DO MUNICÍPIO - IBGE', 'MUNICÍPIO - TOM', 'MUNICÍPIO - IBGE', 'UF', 'ESTADO']
    const codigoMunicipioIndex = 1; // 'CÓDIGO DO MUNICÍPIO - IBGE'
    const nomeMunicipioIndex = 3; // 'MUNICÍPIO - IBGE'
    const codigoEstadoIndex = -1; // Não há código de estado no CSV
    const nomeEstadoIndex = 5; // 'ESTADO'
    const ufIndex = 4; // 'UF'
    const latitudeIndex = -1; // Não há coordenadas no CSV
    const longitudeIndex = -1; // Não há coordenadas no CSV
    
    console.log('🔍 Índices das colunas:');
    console.log(`  - Código Município: ${codigoMunicipioIndex}`);
    console.log(`  - Nome Município: ${nomeMunicipioIndex}`);
    console.log(`  - UF: ${ufIndex}`);
    console.log(`  - Nome Estado: ${nomeEstadoIndex}`);
    console.log(`  - Latitude: ${latitudeIndex} (não disponível)`);
    console.log(`  - Longitude: ${longitudeIndex} (não disponível)`);
    
    if (codigoMunicipioIndex === -1 || nomeMunicipioIndex === -1 || ufIndex === -1) {
      console.error('❌ Colunas obrigatórias não encontradas no CSV!');
      return;
    }
    
    // Processar dados
    const estados = new Map();
    const municipios = [];
    let processados = 0;
    let erros = 0;
    
    console.log('🔄 Processando dados...');
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Dividir linha por ponto e vírgula
        const values = line.split(';').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length < Math.max(codigoMunicipioIndex, nomeMunicipioIndex, ufIndex) + 1) {
          console.warn(`⚠️ Linha ${i + 1} com poucas colunas, pulando...`);
          continue;
        }
        
        const codigoMunicipio = values[codigoMunicipioIndex]?.trim();
        const nomeMunicipio = values[nomeMunicipioIndex]?.trim();
        const uf = values[ufIndex]?.trim();
        const nomeEstado = nomeEstadoIndex !== -1 ? values[nomeEstadoIndex]?.trim() : '';
        
        if (!codigoMunicipio || !nomeMunicipio || !uf) {
          console.warn(`⚠️ Linha ${i + 1} com dados incompletos, pulando...`);
          continue;
        }
        
        // Extrair código do estado dos primeiros 2 dígitos do código do município
        const codigoEstado = codigoMunicipio.substring(0, 2);
        
        // Adicionar estado se não existir
        if (!estados.has(codigoEstado)) {
          const sigla = uf;
          const regiao = regioesPorEstado[sigla] || 'Desconhecida';
          estados.set(codigoEstado, {
            codigo_ibge: codigoEstado,
            nome: nomeEstado || `Estado ${codigoEstado}`,
            sigla: sigla,
            regiao: regiao
          });
        }
        
        // Adicionar município
        municipios.push({
          codigo_ibge: codigoMunicipio,
          nome: nomeMunicipio,
          estado_codigo: codigoEstado,
          latitude: null, // Não disponível no CSV
          longitude: null // Não disponível no CSV
        });
        
        processados++;
        
        if (processados % 1000 === 0) {
          console.log(`📊 Processados: ${processados} registros...`);
        }
        
      } catch (error) {
        console.error(`❌ Erro na linha ${i + 1}:`, error.message);
        erros++;
      }
    }
    
    console.log(`✅ Processamento concluído!`);
    console.log(`📊 Estados encontrados: ${estados.size}`);
    console.log(`📊 Municípios encontrados: ${municipios.length}`);
    console.log(`❌ Erros: ${erros}`);
    
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
    
    console.log('✅ Inserção concluída!');
    
    // Verificar estatísticas
    console.log('📊 Verificando estatísticas...');
    const { data: stats, error: statsError } = await supabase.rpc('estatisticas_estados_municipios');
    
    if (statsError) {
      console.error('❌ Erro ao buscar estatísticas:', statsError.message);
    } else {
      console.log('📈 Estatísticas finais:');
      console.log(`  - Total de estados: ${stats[0]?.total_estados || 0}`);
      console.log(`  - Total de municípios: ${stats[0]?.total_municipios || 0}`);
      console.log(`  - Estado com mais municípios: ${stats[0]?.estado_mais_municipios || 'N/A'}`);
      console.log(`  - Região com mais municípios: ${stats[0]?.regiao_mais_municipios || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Função para dividir linha CSV considerando aspas
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// Executar se chamado diretamente
if (require.main === module) {
  processarCSVMunicipios();
}

module.exports = { processarCSVMunicipios };
