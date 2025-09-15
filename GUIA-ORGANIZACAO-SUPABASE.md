# 🗂️ Guia de Organização do Supabase - Prefixo "ocar_"

Este guia vai ajudar você a organizar todas as tabelas do Supabase para que comecem com o prefixo "ocar_".

## 📋 Passo a Passo

### 1. **Verificar Estado Atual**
Execute o script `check-tables-organization.sql` no Supabase SQL Editor para ver quais tabelas precisam ser organizadas.

### 2. **Organizar Tabelas**
Execute o script `organize-supabase-tables.sql` no Supabase SQL Editor. Este script irá:
- ✅ Renomear todas as tabelas para começar com "ocar_"
- ✅ Atualizar foreign keys automaticamente
- ✅ Renomear índices para manter consistência
- ✅ Renomear políticas RLS
- ✅ Gerar relatório de progresso

### 3. **Atualizar Código (Opcional)**
Se você quiser atualizar o código automaticamente, execute:
```bash
node update-code-tables.js
```

### 4. **Verificar Organização**
Execute o script `verify-organization.sql` no Supabase SQL Editor para confirmar que tudo foi organizado corretamente.

## 📊 Tabelas que Serão Organizadas

| Tabela Atual | Nova Tabela | Status |
|--------------|-------------|---------|
| `users` | `ocar_usuarios` | ✅ |
| `vehicles` | `ocar_vehicles` | ✅ |
| `favorites` | `ocar_favorites` | ✅ |
| `likes` | `ocar_likes` | ✅ |
| `messages` | `ocar_messages` | ✅ |
| `chats` | `ocar_chats` | ✅ |
| `transactions` | `ocar_transactions` | ✅ |
| `vehicle_history` | `ocar_vehicle_history` | ✅ |

## 🔧 Scripts Disponíveis

1. **`check-tables-organization.sql`** - Verifica quais tabelas precisam ser organizadas
2. **`organize-supabase-tables.sql`** - Executa a organização completa
3. **`verify-organization.sql`** - Verifica se a organização foi bem-sucedida
4. **`update-code-tables.js`** - Atualiza referências no código (opcional)

## ⚠️ Importante

- **Backup**: Faça backup do seu banco antes de executar os scripts
- **Teste**: Teste o sistema após a organização
- **Verificação**: Use o script de verificação para confirmar que tudo está correto

## 🎯 Resultado Esperado

Após a organização, todas as tabelas do seu Supabase terão o prefixo "ocar_":

```
✅ ocar_usuarios
✅ ocar_vehicles  
✅ ocar_favorites
✅ ocar_likes
✅ ocar_messages
✅ ocar_chats
✅ ocar_transactions
✅ ocar_vehicle_history
```

## 🚀 Próximos Passos

1. Execute os scripts na ordem indicada
2. Teste todas as funcionalidades do sistema
3. Verifique se não há erros no console
4. Confirme que os dados estão sendo carregados corretamente

---

**💡 Dica**: Se encontrar algum problema, você pode reverter as mudanças usando o backup do banco de dados.
