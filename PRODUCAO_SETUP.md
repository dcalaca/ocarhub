# 🚀 Configuração Mercado Pago Produção

## ✅ Credenciais Configuradas

### Mercado Pago Produção:
- **Access Token**: `APP_USR-8224799763305887-061016-e3b177fb8eb1c01171b9783dfcd86dc6-94107750`
- **Public Key**: `APP_USR-4ea18afd-1d72-489e-9b6d-dc62810e7b14`
- **Webhook Secret**: `46df3fb5e3e8836fb14d5a9ae951e90f2a1dfa13cd58ad156cf432767e26a184`

### OAuth Produção:
- **Client ID**: `8224799763305887`
- **Client Secret**: `TxjPRSZpgXXECBO4R85fAIbXEEH9n8Eg`

## 🔧 Configuração Vercel

### 1. Variáveis de Ambiente:
```bash
# Mercado Pago - Produção
MP_ACCESS_TOKEN=APP_USR-8224799763305887-061016-e3b177fb8eb1c01171b9783dfcd86dc6-94107750
MP_PUBLIC_KEY=APP_USR-4ea18afd-1d72-489e-9b6d-dc62810e7b14
MP_WEBHOOK_SECRET=46df3fb5e3e8836fb14d5a9ae951e90f2a1dfa13cd58ad156cf432767e26a184

# OAuth Produção
MP_CLIENT_ID=8224799763305887
MP_CLIENT_SECRET=TxjPRSZpgXXECBO4R85fAIbXEEH9n8Eg

# Base URL
NEXT_PUBLIC_BASE_URL=https://ocarhub.com
```

### 2. Webhook Configurado:
- **URL**: `https://ocarhub.com/api/webhook`
- **Eventos**: `payment.created`, `payment.updated`

## 🧪 Testando

### 1. OAuth (Recomendado):
- Acesse: `https://ocarhub.com/test-oauth`
- Credenciais já preenchidas
- Clique em "Obter Token OAuth"
- Clique em "Criar Preferência OAuth"

### 2. Teste Direto:
- Use o botão "Criar Preferência Direta"
- Funciona sem OAuth

## 💳 Pagamentos Reais

⚠️ **ATENÇÃO**: Em produção, todos os pagamentos são **REAIS**!

- Use cartões reais para teste
- Valores serão cobrados de verdade
- Webhook processará pagamentos reais

## 🔗 URLs Importantes

- **Teste OAuth**: `https://ocarhub.com/test-oauth`
- **Checkout**: `https://ocarhub.com/checkout`
- **Webhook**: `https://ocarhub.com/api/webhook`
- **Sucesso**: `https://ocarhub.com/payment/success`
- **Falha**: `https://ocarhub.com/payment/failure`
- **Pendente**: `https://ocarhub.com/payment/pending`

## ✅ Status

- ✅ Credenciais de produção configuradas
- ✅ OAuth funcionando
- ✅ Webhook configurado
- ✅ URLs atualizadas para ocarhub.com
- ✅ Interface atualizada para produção
