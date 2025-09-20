import { readFileSync } from 'fs'

async function installETLMigrationOnly() {
  console.log('🚀 Instalando sistema ETL - Apenas migração inicial...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/etl-migration-only.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🚀 Este sistema ETL (migração inicial) inclui:')
    console.log('   • DDL das 3 tabelas normalizadas com chaves únicas')
    console.log('   • Migração dos dados existentes da ocar_transbordo')
    console.log('   • Funções auxiliares para consulta')
    console.log('   • Índices para performance')
    console.log('   • Verificação e amostra de dados')
    
    console.log('\n✨ BENEFÍCIOS:')
    console.log('   • Processa dados já existentes na ocar_transbordo')
    console.log('   • Cria estrutura normalizada para consultas')
    console.log('   • Funções prontas para o frontend')
    console.log('   • Performance otimizada com índices')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela ocar_transbordo NÃO será limpa')
    console.log('   • Apenas os dados serão migrados para as tabelas normalizadas')
    console.log('   • Próximo mês você pode importar o CSV de outubro')
    console.log('   • O sistema estará pronto para futuras importações')
    
    console.log('\n📅 PRÓXIMOS PASSOS:')
    console.log('   • Execute este SQL agora para migrar dados existentes')
    console.log('   • Em outubro, importe o novo CSV na ocar_transbordo')
    console.log('   • O sistema estará pronto para processar automaticamente')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installETLMigrationOnly()
