const fs = require('fs');
const path = require('path');

async function converterCSVParaUTF8() {
  try {
    console.log('🔄 Convertendo CSV para UTF-8...');
    
    const csvPath = path.join(process.cwd(), 'municipios.csv');
    const csvPathUTF8 = path.join(process.cwd(), 'municipios-utf8.csv');
    
    // Ler arquivo com diferentes codificações
    const encodings = ['latin1', 'windows-1252', 'utf8'];
    let csvContent;
    let encodingUsado = '';
    
    for (const encoding of encodings) {
      try {
        csvContent = fs.readFileSync(csvPath, encoding);
        
        // Verificar se tem caracteres malformados
        if (csvContent.includes('')) {
          console.log(`❌ ${encoding} tem caracteres malformados`);
          continue;
        }
        
        // Verificar se tem acentos corretos
        if (csvContent.includes('Rondônia') || csvContent.includes('Goiás') || csvContent.includes('Pará')) {
          console.log(`✅ ${encoding} tem acentos corretos`);
          encodingUsado = encoding;
          break;
        }
        
        console.log(`⚠️ ${encoding} lido, mas sem acentos visíveis`);
        encodingUsado = encoding;
        
      } catch (error) {
        console.log(`❌ Erro ao ler com ${encoding}: ${error.message}`);
      }
    }
    
    if (!csvContent) {
      console.error('❌ Não foi possível ler o arquivo');
      return;
    }
    
    console.log(`📖 Arquivo lido com codificação: ${encodingUsado}`);
    
    // Se não tem acentos corretos, tentar corrigir
    if (!csvContent.includes('Rondônia')) {
      console.log('🔧 Aplicando correções de caracteres...');
      
      const correcoes = {
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
        'Paran': 'Paraná'
      };
      
      for (const [errado, correto] of Object.entries(correcoes)) {
        csvContent = csvContent.replace(new RegExp(errado, 'g'), correto);
      }
    }
    
    // Salvar como UTF-8
    fs.writeFileSync(csvPathUTF8, csvContent, 'utf8');
    
    console.log(`✅ CSV convertido para UTF-8: ${csvPathUTF8}`);
    console.log(`📊 Tamanho: ${fs.statSync(csvPathUTF8).size} bytes`);
    
    // Verificar algumas linhas
    const lines = csvContent.split('\n').slice(0, 5);
    console.log('📋 Primeiras linhas:');
    lines.forEach((line, i) => {
      console.log(`  ${i + 1}: ${line.substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  converterCSVParaUTF8();
}

module.exports = { converterCSVParaUTF8 };
