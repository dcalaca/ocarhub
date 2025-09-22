// Script para forçar atualização dos dados do usuário no frontend
// Execute este código no console do navegador na página do site

console.log('🔄 Forçando atualização dos dados do usuário...')

// Limpar localStorage
localStorage.removeItem('ocar-user')
localStorage.removeItem('ocar-interactions')

console.log('✅ localStorage limpo')

// Recarregar a página para forçar novo carregamento dos dados
console.log('🔄 Recarregando página...')
window.location.reload()
