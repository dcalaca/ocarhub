require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function installMigrationVarcharFix() {
  try {
    console.log('📦 Instalando script de migração SQL com correção VARCHAR...');
    
    const sql = fs.readFileSync('database/migrate-data-sql-varchar-fix.sql', 'utf8');
    
    console.log('📋 Execute este SQL no Supabase SQL Editor:');
    console.log('─'.repeat(50));
    console.log(sql);
    console.log('─'.repeat(50));
    
    console.log('✅ Após executar o SQL, execute o teste:');
    console.log('node scripts/test-migration.js');
    
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }
}

installMigrationVarcharFix();
