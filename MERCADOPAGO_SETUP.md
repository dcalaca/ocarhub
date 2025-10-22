# 🚀 Configuração do Mercado Pago SDK

## ✅ Instalação Concluída

O SDK do Mercado Pago foi instalado e configurado com sucesso! Aqui está um resumo do que foi configurado:

### 📦 Pacotes Instalados
- `mercadopago` - SDK oficial do Mercado Pago
- `dotenv` - Para carregar variáveis de ambiente

### 🔧 Arquivos Criados
- `lib/mercadopago.ts` - Configuração principal do SDK
- `lib/mercadopago-examples.ts` - Exemplos de uso
- `test-mercadopago-config.js` - Teste de configuração

### 🔑 Credenciais Configuradas
As seguintes credenciais de teste estão configuradas no arquivo `.env.local`:

```env
MP_ACCESS_TOKEN=APP_USR-4645131775783967-102121-662cfe8408046307b825a79edd594a15-2939896816
MP_PUBLIC_KEY=APP_USR-f265542a-476e-4e51-91d3-9a5385001fb1
MP_WEBHOOK_SECRET=your_webhook_secret_here
```

### ✅ Teste de Conexão
O teste de conexão foi executado com sucesso:
- ✅ Configuração validada
- ✅ Conexão estabelecida
- ✅ Dados do usuário obtidos:
  - ID: 94107750
  - Nickname: DOUGLASCALACA
  - Email: dcalaca@gmail.com
  - País: BR

## 🚀 Como Usar

### 1. Importar o SDK
```typescript
import { preference, payment, MERCADOPAGO_CONFIG } from './lib/mercadopago';
```

### 2. Criar Preferência de Pagamento
```typescript
const items = [
  {
    id: 'plano-basico',
    title: 'Plano Básico - Ocar Platform',
    quantity: 1,
    price: 29.90
  }
];

const payer = {
  name: 'João Silva',
  email: 'joao@exemplo.com',
  external_reference: 'user-123'
};

const preference = await preference.create({
  body: {
    items,
    payer,
    back_urls: {
      success: 'https://seudominio.com/success',
      failure: 'https://seudominio.com/failure',
      pending: 'https://seudominio.com/pending'
    },
    auto_return: 'approved'
  }
});
```

### 3. Buscar Pagamento
```typescript
const payment = await payment.get({ id: 'payment_id' });
```

### 4. Cancelar Pagamento
```typescript
const cancelledPayment = await payment.cancel({ id: 'payment_id' });
```

### 5. Processar Reembolso
```typescript
const refund = await payment.refund({ 
  id: 'payment_id',
  body: { amount: 29.90 }
});
```

## 🔧 Configurações Disponíveis

### Variáveis de Ambiente
- `MP_ACCESS_TOKEN` - Token de acesso (obrigatório)
- `MP_PUBLIC_KEY` - Chave pública (obrigatório)
- `MP_WEBHOOK_SECRET` - Segredo do webhook (opcional)

### Configurações do SDK
- **Moeda**: BRL (Real Brasileiro)
- **País**: BR (Brasil)
- **Modo**: Teste (sandbox)
- **Timeout**: 5000ms
- **URL Base**: https://api.mercadopago.com

## 🧪 Testando a Configuração

Para testar se tudo está funcionando:

```bash
node test-mercadopago-config.js
```

## 📚 Recursos Adicionais

### Webhooks
O SDK está configurado para receber webhooks nos seguintes eventos:
- `payment`
- `payment.created`
- `payment.updated`
- `payment.approved`
- `payment.rejected`
- `payment.cancelled`
- `payment.refunded`

### Validação de Webhook
```typescript
import { validateWebhookSignature } from './lib/mercadopago';

const isValid = validateWebhookSignature(body, signature);
```

## 🎯 Próximos Passos

1. **Implementar API Routes** - Criar endpoints para processar pagamentos
2. **Configurar Webhooks** - Implementar handlers para notificações
3. **Integrar Frontend** - Conectar com componentes React
4. **Testes de Pagamento** - Usar cartões de teste do Mercado Pago

## 💳 Cartões de Teste

Para testar pagamentos, use estes cartões:

### Aprovado
- **Número**: 4009 1753 3280 6176
- **CVV**: 123
- **Vencimento**: 11/25

### Recusado
- **Número**: 4000 0000 0000 0002
- **CVV**: 123
- **Vencimento**: 11/25

## 🔒 Segurança

- ✅ Credenciais de teste configuradas
- ✅ Validação de webhook implementada
- ✅ Timeout configurado
- ✅ Modo sandbox ativado

---

**🎉 O SDK do Mercado Pago está pronto para uso!**
