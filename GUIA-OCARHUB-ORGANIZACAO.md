# 🚗 Guia de Organização do OcarHub - Prefixo "ocar_"

Este guia é **SEGURO** e organiza **APENAS** as tabelas do OcarHub, sem mexer nas tabelas de outros projetos.

## 🛡️ Segurança Garantida

- ✅ **Verificação de estrutura**: O script verifica se a tabela realmente é do OcarHub
- ✅ **Preservação de outros projetos**: Tabelas de outros projetos são ignoradas
- ✅ **Validação de colunas**: Só renomeia se tiver as colunas típicas do OcarHub
- ✅ **Logs detalhados**: Mostra exatamente o que foi feito

## 📋 Passo a Passo

### 1. **Verificar Estado Atual**
Execute o script `check-ocarhub-tables.sql` no Supabase SQL Editor para ver:
- Quais tabelas do OcarHub já estão organizadas
- Quais tabelas podem ser do OcarHub
- Quais tabelas são de outros projetos (não serão alteradas)

### 2. **Organizar Apenas Tabelas do OcarHub**
Execute o script `organize-ocarhub-tables-only.sql` no Supabase SQL Editor.

**Este script é SEGURO e:**
- ✅ Só renomeia tabelas que realmente são do OcarHub
- ✅ Verifica a estrutura antes de renomear
- ✅ Ignora tabelas de outros projetos
- ✅ Mostra logs detalhados do que foi feito

### 3. **Verificar Resultado**
Execute novamente `check-ocarhub-tables.sql` para confirmar que tudo foi organizado corretamente.

## 🔍 Tabelas que Serão Verificadas

| Tabela Atual | Nova Tabela | Condição |
|--------------|-------------|----------|
| `users` | `ocar_usuarios` | Se tiver colunas: `tipo_usuario`, `cpf`, `telefone`, `endereco` |
| `vehicles` | `ocar_vehicles` | Se tiver colunas: `marca`, `modelo`, `dono_id`, `plano` |
| `favorites` | `ocar_favorites` | Se tiver colunas: `user_id`, `vehicle_id` |
| `likes` | `ocar_likes` | Se tiver colunas: `user_id`, `vehicle_id` |
| `messages` | `ocar_messages` | Se tiver colunas: `sender_id`, `receiver_id`, `vehicle_id`, `content` |
| `chats` | `ocar_chats` | Se tiver colunas: `participant1`, `participant2`, `vehicle_id` |
| `transactions` | `ocar_transactions` | Se tiver colunas: `user_id`, `type`, `amount`, `status` |
| `vehicle_history` | `ocar_vehicle_history` | Se tiver colunas: `placa`, `status`, `score`, `resumo` |

## 🔒 Tabelas de Outros Projetos

**Estas tabelas NÃO serão alteradas:**
- Qualquer tabela que não esteja na lista acima
- Tabelas que não tenham as colunas típicas do OcarHub
- Tabelas que já começam com outros prefixos

## 📊 Exemplo de Log do Script

```
✅ Tabela "vehicles" do OcarHub renomeada para "ocar_vehicles"
⚠️ Tabela "users" existe mas não parece ser do OcarHub - IGNORADA
ℹ️ Tabela "favorites" não encontrada
🔒 Tabelas de outros projetos preservadas: 15
```

## 🎯 Resultado Esperado

Após a organização, você terá:

```
✅ ocar_usuarios (se existir e for do OcarHub)
✅ ocar_vehicles (se existir e for do OcarHub)  
✅ ocar_favorites (se existir e for do OcarHub)
✅ ocar_likes (se existir e for do OcarHub)
✅ ocar_messages (se existir e for do OcarHub)
✅ ocar_chats (se existir e for do OcarHub)
✅ ocar_transactions (se existir e for do OcarHub)
✅ ocar_vehicle_history (se existir e for do OcarHub)

🔒 Suas outras tabelas de projetos permanecem intactas
```

## ⚠️ Importante

- **Backup**: Ainda é recomendado fazer backup antes
- **Teste**: Teste o sistema após a organização
- **Verificação**: Use o script de verificação para confirmar

## 🚀 Próximos Passos

1. Execute `check-ocarhub-tables.sql` para ver o estado atual
2. Execute `organize-ocarhub-tables-only.sql` para organizar
3. Execute `check-ocarhub-tables.sql` novamente para verificar
4. Teste o sistema OcarHub

---

**💡 Dica**: Este script é 100% seguro e só mexe nas tabelas do OcarHub!
