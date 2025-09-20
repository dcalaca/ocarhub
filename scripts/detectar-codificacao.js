const fs = require('fs');

function detectarCodificacao() {
  try {
    console.log('🔍 Detectando codificação do arquivo CSV...');
    
    // Tentar diferentes codificações
    const codificacoes = ['utf8', 'latin1', 'windows-1252', 'iso-8859-1'];
    
    for (const codificacao of codificacoes) {
      try {
        console.log(`\n📖 Tentando codificação: ${codificacao}`);
        const content = fs.readFileSync('municipios.csv', codificacao);
        const lines = content.split('\n').slice(0, 5);
        
        console.log('📋 Primeiras 5 linhas:');
        lines.forEach((line, index) => {
          console.log(`  ${index + 1}: ${line.substring(0, 100)}...`);
        });
        
        // Verificar se contém caracteres problemáticos
        const temCaracteresProblematicos = content.includes('Ã') || content.includes('');
        console.log(`❓ Contém caracteres problemáticos: ${temCaracteresProblematicos ? 'SIM' : 'NÃO'}`);
        
        if (!temCaracteresProblematicos) {
          console.log(`✅ Codificação ${codificacao} parece correta!`);
          return codificacao;
        }
        
      } catch (error) {
        console.log(`❌ Erro com codificação ${codificacao}: ${error.message}`);
      }
    }
    
    console.log('\n⚠️ Nenhuma codificação perfeita encontrada. Usando UTF-8...');
    return 'utf8';
    
  } catch (error) {
    console.error('❌ Erro ao detectar codificação:', error);
    return 'utf8';
  }
}

const codificacao = detectarCodificacao();
console.log(`\n🎯 Codificação recomendada: ${codificacao}`);
