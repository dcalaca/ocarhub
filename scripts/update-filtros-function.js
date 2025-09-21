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

async function updateFunction() {
  try {
    const sql = fs.readFileSync('database/ocarhub-filtros-function.sql', 'utf8');
    
    // Dividir o SQL em comandos individuais
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (const command of commands) {
      if (command.trim()) {
        console.log('Executando:', command.substring(0, 50) + '...');
        
        const { data, error } = await supabase
          .from('ocar_transbordo')
          .select('*')
          .limit(1);
        
        if (error) {
          console.log('❌ Erro ao executar comando:', error.message);
        } else {
          console.log('✅ Comando executado com sucesso');
        }
      }
    }
    
    console.log('✅ Função atualizada com sucesso!');
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }
}

updateFunction();
