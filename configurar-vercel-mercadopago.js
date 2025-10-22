// Script para configurar Mercado Pago no Vercel
console.log('🔧 CONFIGURAÇÃO MERCADO PAGO NO VERCEL:')
console.log('=' .repeat(60))

console.log('\n📋 ESTRATÉGIA RECOMENDADA:')
console.log('   • LOCAL: Credenciais de TESTE')
console.log('   • VERCEL: Credenciais de PRODUÇÃO')
console.log('   • Manter ambos os ambientes')

console.log('\n🔧 VARIÁVEIS PARA O VERCEL:')
console.log('   MP_ACCESS_TOKEN=APP_USR-4645131775783967-102121-662cfe8408046307b825a79edd594a15-2939896816')
console.log('   MP_PUBLIC_KEY=APP_USR-f265542a-476e-4e51-91d3-9a5385001fb1')
console.log('   MP_WEBHOOK_SECRET=test_webhook_secret')
console.log('   NEXT_PUBLIC_SITE_URL=https://ocarhub.com')

console.log('\n🎯 VANTAGENS DESTA ESTRATÉGIA:')
console.log('   • Desenvolvimento local com testes')
console.log('   • Produção com pagamentos reais')
console.log('   • Não precisa excluir tokens reais')
console.log('   • Flexibilidade total')

console.log('\n🚀 COMO CONFIGURAR NO VERCEL:')
console.log('   1. Acesse: https://vercel.com/dashboard')
console.log('   2. Vá em: Seu projeto → Settings → Environment Variables')
console.log('   3. Adicione as variáveis acima')
console.log('   4. Deploy automático')

console.log('\n⚠️ IMPORTANTE:')
console.log('   • Use credenciais de TESTE no Vercel também')
console.log('   • Para não cobrar usuários reais durante testes')
console.log('   • Quando estiver pronto, troque por credenciais de produção')

console.log('\n🔗 COMANDO PARA CONFIGURAR:')
console.log('   npx vercel env add MP_ACCESS_TOKEN')
console.log('   npx vercel env add MP_PUBLIC_KEY')
console.log('   npx vercel env add MP_WEBHOOK_SECRET')
console.log('   npx vercel env add NEXT_PUBLIC_SITE_URL')
