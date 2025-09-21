// Script para sincronizar dados da FIPE com o banco local
// Execute: node scripts/sync-fipe.js

const { fipeSyncService } = require('../lib/fipe-sync-service')

async function main() {
  console.log('🚀 Iniciando sincronização da FIPE...')
  
  try {
    // Verificar se precisa sincronizar
    const needsSync = await fipeSyncService.needsSync()
    
    if (!needsSync) {
      console.log('✅ Dados já estão atualizados!')
      const stats = await fipeSyncService.getLocalStats()
      console.log('📊 Estatísticas atuais:', stats)
      return
    }

    // Executar sincronização
    console.log('🔄 Executando sincronização...')
    const stats = await fipeSyncService.fullSync()
    
    console.log('✅ Sincronização concluída!')
    console.log('📊 Estatísticas:')
    console.log(`  - Marcas: ${stats.brands}`)
    console.log(`  - Modelos: ${stats.models}`)
    console.log(`  - Anos/Versões: ${stats.years}`)
    console.log(`  - Erros: ${stats.errors.length}`)
    
    if (stats.errors.length > 0) {
      console.log('⚠️ Erros encontrados:')
      stats.errors.forEach(error => console.log(`  - ${error}`))
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    process.exit(1)
  }
}

main()
