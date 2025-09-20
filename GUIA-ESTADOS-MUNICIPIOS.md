# 🗺️ Guia: Sistema de Estados e Municípios

## 📋 Visão Geral
Este sistema permite gerenciar estados e municípios brasileiros com códigos IBGE, coordenadas geográficas e funcionalidades de busca inteligente.

## 🗄️ Estrutura das Tabelas

### `ocar_estados`
- **id**: Chave primária
- **codigo_ibge**: Código IBGE do estado (2 dígitos)
- **nome**: Nome completo do estado
- **sigla**: Sigla do estado (ex: SP, RJ)
- **regiao**: Região do Brasil (Norte, Nordeste, etc.)

### `ocar_municipios`
- **id**: Chave primária
- **codigo_ibge**: Código IBGE do município (7 dígitos)
- **nome**: Nome do município
- **estado_id**: FK para ocar_estados
- **latitude**: Coordenada de latitude
- **longitude**: Coordenada de longitude

## 🚀 Como Usar

### 1. Criar as Tabelas
```sql
-- Execute o script SQL
\i database/criar-tabela-estados-municipios.sql
```

### 2. Preparar o CSV
- Coloque o arquivo `municipios.csv` na raiz do projeto
- O arquivo deve ter as colunas:
  - Código do município
  - Nome do município
  - Código do estado
  - Nome do estado (opcional)
  - Latitude (opcional)
  - Longitude (opcional)

### 3. Processar o CSV
```bash
# Via npm script
npm run process-municipios

# Ou diretamente
node scripts/processar-csv-municipios.js
```

## 🔧 Funções Disponíveis

### Inserir Dados
```sql
-- Inserir estado
SELECT inserir_estado('35', 'São Paulo', 'SP', 'Sudeste');

-- Inserir município
SELECT inserir_municipio('3550308', 'São Paulo', '35', -23.5505, -46.6333);
```

### Consultar Dados
```sql
-- Buscar municípios por estado
SELECT * FROM buscar_municipios_por_estado('SP');

-- Buscar municípios por nome
SELECT * FROM buscar_municipios_por_nome('São Paulo');

-- Listar todos os estados
SELECT * FROM listar_estados();

-- Estatísticas gerais
SELECT * FROM estatisticas_estados_municipios();
```

## 📊 Exemplo de Uso no Frontend

### API para Estados
```typescript
// GET /api/estados
const response = await fetch('/api/estados');
const estados = await response.json();
```

### API para Municípios
```typescript
// GET /api/municipios?estado=SP
const response = await fetch('/api/municipios?estado=SP');
const municipios = await response.json();

// GET /api/municipios?nome=São Paulo
const response = await fetch('/api/municipios?nome=São Paulo');
const municipios = await response.json();
```

## 🎯 Funcionalidades

### ✅ Busca Inteligente
- Busca por nome de município com sugestões
- Filtro por estado
- Ordenação por relevância

### ✅ Dados Geográficos
- Coordenadas de latitude e longitude
- Códigos IBGE para integração

### ✅ Performance
- Índices otimizados
- Consultas eficientes
- Cache de resultados

### ✅ Validação
- Códigos IBGE únicos
- Relacionamentos consistentes
- Dados obrigatórios

## 🔍 Exemplos de Consultas

### Municípios de São Paulo
```sql
SELECT 
  m.nome as municipio,
  e.nome as estado,
  m.latitude,
  m.longitude
FROM ocar_municipios m
JOIN ocar_estados e ON e.id = m.estado_id
WHERE e.sigla = 'SP'
ORDER BY m.nome;
```

### Busca por Nome
```sql
SELECT 
  m.nome as municipio,
  e.nome as estado,
  e.sigla
FROM ocar_municipios m
JOIN ocar_estados e ON e.id = m.estado_id
WHERE LOWER(m.nome) LIKE '%são paulo%'
ORDER BY m.nome;
```

### Estatísticas por Região
```sql
SELECT 
  e.regiao,
  COUNT(m.id) as total_municipios
FROM ocar_estados e
LEFT JOIN ocar_municipios m ON m.estado_id = e.id
GROUP BY e.regiao
ORDER BY total_municipios DESC;
```

## 🛠️ Manutenção

### Limpeza de Dados
```sql
-- Limpar todos os dados
DELETE FROM ocar_municipios;
DELETE FROM ocar_estados;

-- Resetar sequências
ALTER SEQUENCE ocar_municipios_id_seq RESTART WITH 1;
ALTER SEQUENCE ocar_estados_id_seq RESTART WITH 1;
```

### Backup
```sql
-- Exportar dados
COPY ocar_estados TO '/tmp/estados.csv' WITH CSV HEADER;
COPY ocar_municipios TO '/tmp/municipios.csv' WITH CSV HEADER;
```

## 📈 Monitoramento

### Verificar Integridade
```sql
-- Verificar relacionamentos
SELECT 
  COUNT(*) as total_municipios,
  COUNT(DISTINCT estado_id) as estados_com_municipios
FROM ocar_municipios;

-- Verificar dados nulos
SELECT 
  COUNT(*) as municipios_sem_coordenadas
FROM ocar_municipios 
WHERE latitude IS NULL OR longitude IS NULL;
```

### Performance
```sql
-- Verificar uso de índices
EXPLAIN ANALYZE 
SELECT * FROM buscar_municipios_por_nome('São Paulo');
```

## 🚨 Troubleshooting

### Erro: "Estado não encontrado"
- Verifique se o estado foi inserido antes do município
- Confirme o código IBGE do estado

### Erro: "Código IBGE duplicado"
- Use ON CONFLICT para atualizar dados existentes
- Verifique se o CSV não tem duplicatas

### Performance lenta
- Verifique se os índices foram criados
- Use LIMIT nas consultas de busca
- Considere cache para consultas frequentes

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do script de processamento
2. Confirme a estrutura do CSV
3. Teste as funções SQL individualmente
4. Verifique as permissões do banco de dados
