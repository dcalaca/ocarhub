# Configuração do Banco de Dados - Ocar Platform

## 🚨 IMPORTANTE: Ordem de Execução

Execute os scripts SQL na seguinte ordem no Supabase SQL Editor:

### 1. Verificar Estrutura da Tabela ✅
A tabela `ocar_planos` já existe com todas as colunas necessárias:
- ✅ `id`, `nome`, `tipo`, `preco`, `descricao`
- ✅ `beneficios` (jsonb), `limite_anuncios`, `limite_consultas`
- ✅ `duracao_dias`, `destaque`, `ativo`
- ✅ `created_at`, `updated_at`

### 2. Inserir Planos de Anúncios
Execute o arquivo: `insert-anuncio-plans.sql`

Este script insere:
- ✅ Plano Gratuito (R$ 0,00)
- ✅ Plano Destaque (R$ 80,00)
- ✅ Plano Premium (R$ 150,00)

### 2.1. Se Houver Planos Duplicados
Execute o arquivo: `fix-plans-final.sql`

Este script:
- ✅ Remove todos os planos duplicados
- ✅ Insere apenas os 3 planos corretos
- ✅ Garante consistência no banco

### 3. Verificar Instalação
Execute esta query para verificar se tudo foi criado corretamente:

```sql
-- Verificar se a tabela foi criada
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'ocar_planos';

-- Verificar os planos inseridos
SELECT id, nome, tipo, preco, ativo 
FROM ocar_planos 
ORDER BY preco;
```

## 📋 Estrutura da Tabela `ocar_planos`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `nome` | TEXT | Nome do plano |
| `tipo` | TEXT | 'anuncio' ou 'consulta' |
| `preco` | DECIMAL(10,2) | Preço do plano |
| `descricao` | TEXT | Descrição do plano |
| `beneficios` | TEXT[] | Array de benefícios |
| `limite_anuncios` | INTEGER | Limite de anúncios (0 = ilimitado) |
| `limite_consultas` | INTEGER | Limite de consultas (0 = ilimitado) |
| `duracao_dias` | INTEGER | Duração em dias (NULL = vitalício) |
| `destaque` | BOOLEAN | Se tem destaque especial |
| `ativo` | BOOLEAN | Se está ativo |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

## 🔧 Comandos Úteis

### Ver todos os planos ativos:
```sql
SELECT * FROM ocar_planos WHERE ativo = true ORDER BY preco;
```

### Ativar/Desativar um plano:
```sql
-- Desativar plano
UPDATE ocar_planos SET ativo = false WHERE id = 'plan_id_here';

-- Ativar plano
UPDATE ocar_planos SET ativo = true WHERE id = 'plan_id_here';
```

### Editar preço de um plano:
```sql
UPDATE ocar_planos 
SET preco = 100.00, updated_at = NOW() 
WHERE id = 'plan_id_here';
```

## ⚠️ Solução de Problemas

### Erro: "relation ocar_planos does not exist"
- **Causa**: Tabela não foi criada
- **Solução**: Execute primeiro `create-planos-table.sql`

### Erro: "duplicate key value violates unique constraint"
- **Causa**: Plano já existe
- **Solução**: Verifique se os planos já foram inseridos

### Erro: "check constraint violated"
- **Causa**: Tipo de plano inválido
- **Solução**: Use apenas 'anuncio' ou 'consulta' no campo tipo

## 🎯 Próximos Passos

Após executar os scripts:

1. ✅ Acesse o painel admin: `/admin/login`
2. ✅ Configure a senha no `.env.local`
3. ✅ Teste a criação de anúncios
4. ✅ Verifique se os planos aparecem corretamente
