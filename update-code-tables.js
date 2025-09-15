// Script para atualizar referências de tabelas no código
// Execute este script para garantir que todo o código use tabelas com prefixo "ocar_"

const fs = require('fs');
const path = require('path');

// Mapeamento de tabelas antigas para novas
const tableMappings = {
  'users': 'ocar_usuarios',
  'vehicles': 'ocar_vehicles', 
  'favorites': 'ocar_favorites',
  'likes': 'ocar_likes',
  'messages': 'ocar_messages',
  'chats': 'ocar_chats',
  'transactions': 'ocar_transactions',
  'vehicle_history': 'ocar_vehicle_history'
};

// Função para atualizar um arquivo
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Atualizar cada mapeamento
    Object.entries(tableMappings).forEach(([oldTable, newTable]) => {
      const oldPattern = new RegExp(`\\.from\\(['"\`]${oldTable}['"\`]\\)`, 'g');
      const newPattern = `.from('${newTable}')`;
      
      if (content.match(oldPattern)) {
        content = content.replace(oldPattern, newPattern);
        updated = true;
        console.log(`✅ ${filePath}: ${oldTable} → ${newTable}`);
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

// Função para percorrer diretórios recursivamente
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      updateFile(filePath);
    }
  });
}

// Executar atualização
console.log('🔍 Procurando referências de tabelas para atualizar...\n');

walkDirectory('./');

console.log('\n✅ Atualização concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Execute o script organize-supabase-tables.sql no Supabase');
console.log('2. Execute o script check-tables-organization.sql para verificar');
console.log('3. Teste o sistema para garantir que tudo funciona');
