# 🗄️ Sistema de Transbordo FIPE

Este sistema implementa uma estratégia de "transbordo" para popular o banco de dados com dados da FIPE de forma organizada.

## 🎯 **Conceito**

1. **Tabela de Transbordo**: Armazena dados brutos da FIPE exatamente como vêm da API
2. **Processamento**: Função SQL que processa os dados brutos e popula as tabelas organizadas
3. **Tabelas Organizadas**: Estrutura otimizada para consultas rápidas

## 📊 **Estrutura da Tabela de Transbordo**

```sql
ocar_transbordo (
  id UUID PRIMARY KEY,
  marca VARCHAR(100) NOT NULL,        -- Ex: "Honda"
  modelo VARCHAR(200) NOT NULL,       -- Ex: "Civic"
  ano INTEGER NOT NULL,               -- Ex: 2017
  codigo_fipe VARCHAR(20) NOT NULL,   -- Ex: "25124820171"
  referencia_mes VARCHAR(7),          -- Ex: "2024-01"
  preco DECIMAL(10,2),                -- Ex: 45000.00
  processado BOOLEAN DEFAULT false,   -- Se já foi processado
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🚀 **Como Usar**

### **1. Criar a Tabela de Transbordo**

Execute no Supabase SQL Editor:

```sql
-- Copie e cole o conteúdo de database/create-transbordo-simple.sql
```

### **2. Popular com Dados da FIPE**

```bash
node scripts/populate-transbordo-simple.js
```

### **3. Processar Dados para Tabelas Organizadas**

```bash
node scripts/populate-transbordo-simple.js
```

### **4. Verificar se Funcionou**

```bash
node test-transbordo.js
```

## 📋 **Fluxo de Dados**

```
API FIPE → Tabela Transbordo → Processamento → Tabelas Organizadas
    ↓              ↓              ↓              ↓
  Dados Brutos   Dados Brutos   Função SQL    Dados Organizados
  (marca,        (marca,        (processar_   (marcas, modelos,
   modelo,        modelo,        transbordo)    anos, versões)
   ano,           ano,
   codigo)        codigo)
```

## 🔧 **Scripts Disponíveis**

### **`create-transbordo-simple.sql`**
- Cria a tabela de transbordo simplificada
- Define índices para performance
- Configura RLS
- Cria funções de processamento

### **`populate-transbordo-simple.js`**
- Popula a tabela de transbordo com dados simulados
- Processa dados para tabelas organizadas
- Gera relatório de inserção

### **`test-transbordo.js`**
- Verifica se a tabela existe
- Conta registros inseridos
- Mostra exemplos de dados
- Testa consultas específicas

## 📊 **Vantagens desta Abordagem**

### ✅ **Simplicidade**
- Tabela de transbordo tem apenas 4 campos essenciais
- Fácil de popular e entender
- Estrutura espelha exatamente a API FIPE

### ✅ **Flexibilidade**
- Pode armazenar dados de qualquer fonte
- Fácil de modificar e estender
- Processamento pode ser ajustado conforme necessário

### ✅ **Performance**
- Dados brutos ficam separados dos organizados
- Consultas rápidas nas tabelas organizadas
- Processamento em lote é eficiente

### ✅ **Manutenibilidade**
- Fácil de debugar problemas
- Dados brutos sempre disponíveis para análise
- Processamento pode ser reexecutado

## 🔍 **Exemplos de Uso**

### **Inserir Dados Manuais**

```sql
INSERT INTO ocar_transbordo (marca, modelo, ano, codigo_fipe) VALUES
('Honda', 'Civic', 2017, '25124820171'),
('Honda', 'Civic', 2018, '25124820181'),
('VW', 'Golf', 2017, '23200120171');
```

### **Processar Dados**

```sql
SELECT processar_transbordo();
```

### **Verificar Dados Processados**

```sql
SELECT 
  marca, 
  modelo, 
  ano, 
  codigo_fipe,
  processado
FROM ocar_transbordo 
WHERE processado = true
LIMIT 10;
```

## 🚨 **Troubleshooting**

### **Erro: "Tabela não existe"**
- Execute o script `create-transbordo-simple.sql` primeiro

### **Erro: "Função não existe"**
- Verifique se o script SQL foi executado completamente
- As funções `processar_transbordo()` e `limpar_dados_antigos()` devem existir

### **Erro: "Permissão negada"**
- Use a `SUPABASE_SERVICE_ROLE_KEY` (não a anon key)
- Verifique se as políticas RLS estão corretas

### **Dados não aparecem nas tabelas organizadas**
- Verifique se a função `processar_transbordo()` foi executada
- Confirme se os dados estão marcados como `processado = true`

## 📈 **Próximos Passos**

1. **Integrar com API FIPE Real**: Substituir dados simulados por chamadas reais
2. **Sincronização Automática**: Configurar processamento periódico
3. **Validação de Dados**: Adicionar verificações de qualidade
4. **Monitoramento**: Implementar logs e alertas
5. **Backup**: Configurar backup automático dos dados

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique os logs do console
2. Confirme as variáveis de ambiente
3. Teste as consultas no Supabase SQL Editor
4. Verifique as políticas RLS
