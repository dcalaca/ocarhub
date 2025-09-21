# 🚗 Sistema de Normalização FIPE Completo

Este sistema permite processar dados FIPE de forma organizada, separando em 3 tabelas normalizadas e processando CSVs automaticamente.

## 📊 **Estrutura das 3 Tabelas**

### 1. **ocar_fipe_brands** - Marcas (sem duplicidade)
```sql
- id (BIGSERIAL PRIMARY KEY)
- name (TEXT UNIQUE) - Nome da marca
- created_at, updated_at
```

### 2. **ocar_fipe_models** - Modelos (único por marca)
```sql
- id (BIGSERIAL PRIMARY KEY)
- brand_id (FOREIGN KEY) - Referência à marca
- name (TEXT) - Nome do modelo
- created_at, updated_at
```

### 3. **ocar_fipe_prices** - Preços FIPE
```sql
- id (BIGSERIAL PRIMARY KEY)
- model_id (FOREIGN KEY) - Referência ao modelo
- year (INT) - Ano do veículo
- reference_month (TEXT) - Mês de referência (ex: '2025-01')
- fipe_code (TEXT) - Código FIPE
- price (NUMERIC) - Valor FIPE
- created_at, updated_at
```

## 🚀 **Como Usar**

### **1. Configurar o Sistema**

Execute o script SQL no Supabase:

```sql
-- Execute o conteúdo de database/sistema-normalizacao-fipe-completo.sql
```

### **2. Processar CSV via Linha de Comando**

```bash
# Instalar dependências
npm install

# Processar arquivo CSV
npm run process-csv dados-fipe.csv

# Apenas normalizar dados existentes
npm run normalize-data
```

### **3. Interface Web para Upload**

```bash
# Iniciar servidor de upload
npm run upload-csv

# Acesse: http://localhost:3001
```

## 📋 **Formatos de CSV Suportados**

O sistema detecta automaticamente as colunas do CSV. Suporta os seguintes nomes:

### **Colunas de Marca:**
- `brand_name`, `marca`, `Marca`

### **Colunas de Modelo:**
- `model_name`, `modelo`, `Modelo`

### **Colunas de Ano:**
- `year_number`, `ano`, `Ano`

### **Colunas de Preço:**
- `price`, `preco`, `Preço`

### **Colunas de Código FIPE:**
- `fipe_code`, `codigo_fipe`, `Código FIPE`

### **Colunas de Referência:**
- `reference_month`, `referencia_mes`, `Referência Mês`

## 🔧 **Funções SQL Disponíveis**

### **1. Normalizar Dados Existentes**
```sql
SELECT * FROM normalizar_dados_fipe();
```

### **2. Processar CSV (JSON)**
```sql
SELECT * FROM processar_csv_fipe('[{"brand_name":"Honda","model_name":"Civic",...}]');
```

### **3. Buscar Preço FIPE**
```sql
SELECT * FROM buscar_preco_fipe('Honda', 'Civic', 2020, '2025-01');
```

### **4. Listar Marcas**
```sql
SELECT * FROM listar_marcas();
```

### **5. Listar Modelos por Marca**
```sql
SELECT * FROM listar_modelos_por_marca('Honda');
```

### **6. Listar Anos por Modelo**
```sql
SELECT * FROM listar_anos_por_modelo('Honda', 'Civic');
```

## 📊 **API Endpoints**

### **POST /api/upload-csv**
Upload de arquivo CSV via multipart/form-data

**Resposta:**
```json
{
  "success": true,
  "message": "CSV processado com sucesso!",
  "stats": {
    "totalRows": 1000,
    "processedRows": 950,
    "brands": 25,
    "models": 200,
    "prices": 950
  }
}
```

### **POST /api/normalize-existing**
Normaliza dados existentes da tabela transbordo

### **GET /api/stats**
Retorna estatísticas das tabelas

### **GET /api/test-queries**
Testa consultas de exemplo

## 🎯 **Fluxo de Processamento**

```
CSV Upload → Tabela Transbordo → Normalização → 3 Tabelas Organizadas
     ↓              ↓              ↓              ↓
  Dados Brutos   Dados Brutos   Função SQL    Dados Normalizados
  (marca,        (marca,        (normalizar_   (marcas, modelos,
   modelo,        modelo,        dados_fipe)    preços)
   ano,           ano,
   preço)         preço)
```

## 🔍 **Exemplos de Uso**

### **1. Processar CSV via Script**
```bash
# Criar arquivo CSV de exemplo
echo "marca,modelo,ano,preco,codigo_fipe" > exemplo.csv
echo "Honda,Civic,2020,45000,123456" >> exemplo.csv

# Processar
node scripts/processar-csv-fipe.js exemplo.csv
```

### **2. Upload via Interface Web**
1. Acesse `http://localhost:3001`
2. Arraste e solte o arquivo CSV
3. Aguarde o processamento
4. Veja as estatísticas

### **3. Consultar Dados**
```sql
-- Buscar preço de um veículo específico
SELECT * FROM buscar_preco_fipe('Honda', 'Civic', 2020);

-- Listar todas as marcas
SELECT * FROM listar_marcas();

-- Listar modelos de uma marca
SELECT * FROM listar_modelos_por_marca('Honda');
```

## ⚡ **Performance e Otimizações**

- **Índices otimizados** para consultas rápidas
- **Processamento em lote** para grandes volumes
- **Upsert inteligente** evita duplicatas
- **RLS configurado** para segurança
- **Triggers automáticos** para updated_at

## 🛠️ **Manutenção**

### **Limpar Dados Antigos**
```sql
-- Limpar dados de transbordo antigos
DELETE FROM ocar_transbordo 
WHERE created_at < NOW() - INTERVAL '30 days';
```

### **Verificar Integridade**
```sql
-- Verificar estatísticas
SELECT 
  'Marcas' as tabela, COUNT(*) as total FROM ocar_fipe_brands
UNION ALL
SELECT 'Modelos' as tabela, COUNT(*) as total FROM ocar_fipe_models
UNION ALL
SELECT 'Preços' as tabela, COUNT(*) as total FROM ocar_fipe_prices;
```

## 🚨 **Solução de Problemas**

### **Erro: "Arquivo não encontrado"**
- Verifique se o caminho do arquivo está correto
- Use caminho absoluto se necessário

### **Erro: "Dados obrigatórios ausentes"**
- Verifique se o CSV tem as colunas necessárias
- Ajuste os nomes das colunas conforme o formato

### **Erro: "Erro ao processar CSV"**
- Verifique a conexão com o Supabase
- Confirme se as variáveis de ambiente estão configuradas

### **Performance lenta**
- Use índices nas consultas
- Processe em lotes menores
- Verifique a conexão com o banco

## 📝 **Logs e Monitoramento**

O sistema gera logs detalhados:
- ✅ Sucessos
- ⚠️ Avisos
- ❌ Erros
- 📊 Estatísticas

Monitore os logs para identificar problemas e otimizar performance.
