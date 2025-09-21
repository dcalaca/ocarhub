import { readFileSync } from 'fs'

async function installETLSystem() {
  console.log('🚀 Instalando sistema ETL completo...\n')

  try {
    // Ler o SQL
    const sql = readFileSync('database/etl-complete-system.sql', 'utf8')
    
    console.log('📝 SQL para executar no Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    
    console.log('\n✅ Execute o SQL acima no Supabase SQL Editor!')
    console.log('   URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql')
    
    console.log('\n🚀 Este sistema ETL completo inclui:')
    console.log('   • DDL das 3 tabelas normalizadas com chaves únicas')
    console.log('   • Função de UPSERT que processa dados em lote')
    console.log('   • Trigger que dispara após INSERT/UPDATE no transbordo')
    console.log('   • Migração inicial dos dados existentes')
    console.log('   • Funções auxiliares para consulta')
    console.log('   • Índices para performance')
    console.log('   • Documentação completa')
    
    console.log('\n✨ BENEFÍCIOS:')
    console.log('   • Processamento automático em lote')
    console.log('   • Deduplicação automática')
    console.log('   • Atualização de preços por mês/código')
    console.log('   • Performance otimizada com índices')
    console.log('   • Sistema robusto e escalável')
    
    console.log('\n⚠️ IMPORTANTE:')
    console.log('   • A tabela ocar_transbordo NÃO será limpa')
    console.log('   • Apenas os dados serão migrados para as tabelas normalizadas')
    console.log('   • O trigger manterá tudo sincronizado automaticamente')
    console.log('   • Futuras importações de CSV serão processadas automaticamente')
    
  } catch (error) {
    console.error('Erro ao ler arquivo SQL:', error.message)
  }
}

installETLSystem()
