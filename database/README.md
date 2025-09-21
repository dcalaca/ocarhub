# 🗄️ Banco de Dados FIPE

Este diretório contém scripts para configurar e popular o banco de dados com dados da FIPE.

## 📋 Pré-requisitos

1. **Supabase configurado** com as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Node.js** instalado para executar os scripts

## 🚀 Passo a Passo

### 1. **Criar as Tabelas**

Execute o script SQL no Supabase SQL Editor:

```sql
-- Copie e cole o conteúdo de database/create-fipe-tables.sql
-- no Supabase SQL Editor e execute
```

### 2. **Verificar as Tabelas**

```bash
node scripts/check-fipe-tables.js
```

### 3. **Popular com Dados de Teste**

```bash
node scripts/populate-fipe-database.js
```

### 4. **Verificar Dados Inseridos**

```bash
node scripts/check-fipe-tables.js
```

## 📊 Estrutura das Tabelas

### `ocar_fipe_brands` (Marcas)
- `id`: UUID (PK)
- `code`: Código da marca (ex: "25")
- `name`: Nome da marca (ex: "Honda")
- `active`: Se está ativa
- `created_at`, `updated_at`: Timestamps

### `ocar_fipe_models` (Modelos)
- `id`: UUID (PK)
- `brand_code`: Código da marca (FK)
- `code`: Código do modelo (ex: "1248")
- `name`: Nome do modelo (ex: "Civic")
- `active`: Se está ativo
- `created_at`, `updated_at`: Timestamps

### `ocar_fipe_years` (Anos/Versões)
- `id`: UUID (PK)
- `brand_code`: Código da marca (FK)
- `model_code`: Código do modelo (FK)
- `code`: Código da versão (ex: "2017-1")
- `name`: Nome da versão (ex: "2017 Gasolina")
- `year`: Ano do veículo
- `fuel_type`: Tipo de combustível
- `active`: Se está ativo
- `created_at`, `updated_at`: Timestamps

### `ocar_fipe_prices` (Preços FIPE)
- `id`: UUID (PK)
- `brand_code`: Código da marca (FK)
- `model_code`: Código do modelo (FK)
- `year_code`: Código do ano (FK)
- `fipe_code`: Código FIPE
- `price`: Preço
- `fuel`: Combustível
- `reference_month`: Mês de referência
- `created_at`, `updated_at`: Timestamps

## 🔧 Scripts Disponíveis

### `create-fipe-tables.sql`
- Cria todas as tabelas necessárias
- Configura índices para performance
- Define políticas RLS
- Cria triggers para updated_at

### `check-fipe-tables.js`
- Verifica se as tabelas existem
- Conta registros em cada tabela
- Testa consultas básicas
- Verifica configuração RLS

### `populate-fipe-database.js`
- Popula o banco com dados de teste
- Simula API FIPE com dados mockados
- Insere marcas, modelos e anos/versões
- Gera relatório de inserção

## 🚨 Troubleshooting

### Erro: "Variáveis de ambiente não encontradas"
- Verifique se o arquivo `.env.local` existe
- Confirme se as variáveis estão definidas corretamente

### Erro: "Tabela não existe"
- Execute o script `create-fipe-tables.sql` primeiro
- Verifique se executou no schema correto (public)

### Erro: "Permissão negada"
- Use a `SUPABASE_SERVICE_ROLE_KEY` (não a anon key)
- Verifique se as políticas RLS estão corretas

### Erro: "Chave duplicada"
- Os scripts usam `upsert` para evitar duplicatas
- Se persistir, limpe as tabelas e execute novamente

## 📈 Próximos Passos

1. **Integrar com API FIPE real** (substituir mock)
2. **Implementar sincronização automática**
3. **Adicionar cache Redis** (opcional)
4. **Configurar backup automático**
5. **Implementar limpeza de dados antigos**

## 🔍 Monitoramento

Use o Supabase Dashboard para:
- Ver estatísticas das tabelas
- Monitorar performance das consultas
- Verificar logs de erro
- Acompanhar uso de storage

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console
2. Confirme as variáveis de ambiente
3. Teste as consultas no Supabase SQL Editor
4. Verifique as políticas RLS
