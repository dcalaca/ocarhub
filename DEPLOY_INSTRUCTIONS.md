# 🚀 Deploy da Integração Mercado Pago - Instruções de Teste

## ✅ Deploy Concluído

A integração completa do Mercado Pago foi enviada para o repositório e está pronta para deploy!

### 📦 **Arquivos Enviados:**
- ✅ SDK do Mercado Pago instalado
- ✅ API routes configuradas
- ✅ Componentes frontend criados
- ✅ Páginas de retorno implementadas
- ✅ Webhook handler configurado
- ✅ Documentação completa

## 🌐 **Como Testar no Site:**

### **1. Aguardar Deploy Automático**
- O Vercel fará o deploy automaticamente
- Aguarde alguns minutos para o processo completar
- Verifique o status no painel do Vercel

### **2. Acessar o Checkout**
```
https://seu-dominio.vercel.app/checkout
```

### **3. Testar Pagamento**
1. **Selecione um plano** (Básico, Premium ou Enterprise)
2. **Preencha os dados** do pagador
3. **Clique em "Criar Preferência de Pagamento"**
4. **Use os cartões de teste:**
   - **Aprovado**: 4009 1753 3280 6176 (CVV: 123, Vencimento: 11/25)
   - **Recusado**: 4000 0000 0000 0002 (CVV: 123, Vencimento: 11/25)

### **4. Verificar Páginas de Retorno**
Após o pagamento, você será redirecionado para:
- `/payment/success` - Pagamento aprovado
- `/payment/failure` - Pagamento recusado
- `/payment/pending` - Pagamento pendente

## 🔧 **Configurações Necessárias:**

### **1. Variáveis de Ambiente no Vercel**
Certifique-se de que estas variáveis estão configuradas no painel do Vercel:

```env
# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-4645131775783967-102121-662cfe8408046307b825a79edd594a15-2939896816
MP_PUBLIC_KEY=APP_USR-f265542a-476e-4e51-91d3-9a5385001fb1
MP_WEBHOOK_SECRET=your_webhook_secret_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kfsteismyqpekbaqwuez.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw

# URLs
NEXT_PUBLIC_BASE_URL=https://seu-dominio.vercel.app
```

### **2. Configurar Webhook no Mercado Pago**
1. Acesse o painel do Mercado Pago
2. Vá em "Desenvolvimento" > "Webhooks"
3. Configure a URL: `https://seu-dominio.vercel.app/api/webhooks/mercadopago`
4. Selecione os eventos: `payment`, `payment.created`, `payment.updated`

## 🧪 **Testes Recomendados:**

### **Teste 1: Criação de Preferência**
- Acesse `/checkout`
- Selecione um plano
- Preencha os dados
- Verifique se a preferência é criada

### **Teste 2: Pagamento Aprovado**
- Use o cartão: 4009 1753 3280 6176
- Complete o pagamento
- Verifique se é redirecionado para `/payment/success`

### **Teste 3: Pagamento Recusado**
- Use o cartão: 4000 0000 0000 0002
- Complete o pagamento
- Verifique se é redirecionado para `/payment/failure`

### **Teste 4: Webhook**
- Após um pagamento, verifique se o webhook foi processado
- Confirme se os dados foram salvos no Supabase

## 📊 **Monitoramento:**

### **Logs do Vercel**
- Acesse o painel do Vercel
- Vá em "Functions" para ver logs das API routes
- Monitore erros e performance

### **Logs do Mercado Pago**
- Acesse o painel do Mercado Pago
- Vá em "Desenvolvimento" > "Webhooks"
- Verifique se as notificações estão sendo enviadas

## 🚨 **Possíveis Problemas:**

### **1. Erro 500 na API**
- Verifique se as variáveis de ambiente estão configuradas
- Confirme se o Supabase está acessível
- Verifique os logs do Vercel

### **2. Webhook não funciona**
- Confirme se a URL está correta
- Verifique se o webhook está ativo no Mercado Pago
- Teste com ngrok para desenvolvimento local

### **3. Páginas não carregam**
- Verifique se o build foi bem-sucedido
- Confirme se todas as dependências estão instaladas
- Verifique se não há erros de TypeScript

## 🎯 **Próximos Passos:**

1. **Testar em produção** com cartões de teste
2. **Configurar webhook** no painel do Mercado Pago
3. **Monitorar logs** para identificar problemas
4. **Implementar melhorias** baseadas nos testes
5. **Configurar credenciais de produção** quando estiver pronto

## 📞 **Suporte:**

Se encontrar problemas:
- Verifique os logs do Vercel
- Consulte a documentação em `MERCADOPAGO_FRONTEND_INTEGRATION.md`
- Teste localmente primeiro com `npm run dev`

---

**🎉 A integração está pronta para teste em produção!**

**🌐 Acesse seu site e teste em `/checkout`**
