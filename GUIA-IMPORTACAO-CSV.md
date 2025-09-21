# 📊 Guia de Importação CSV para Tabela Transbordo

## 🎯 **Objetivo**
Importar dados de veículos de um arquivo CSV para a tabela `ocar_transbordo`, evitando duplicidades.

## 🚀 **Como Usar**

### **1. Preparar o Arquivo CSV**
Seu arquivo CSV deve ter as seguintes colunas (nomes flexíveis):

| Coluna Obrigatória | Nomes Aceitos | Exemplo |
|-------------------|---------------|---------|
| **Marca** | `marca`, `Marca`, `MARCA` | Toyota |
| **Modelo** | `modelo`, `Modelo`, `MODELO` | Corolla |
| **Ano** | `ano`, `Ano`, `ANO`, `year`, `Year` | 2020 |
| **Código FIPE** | `codigo_fipe`, `codigoFipe`, `codigo`, `CodigoFipe`, `CODIGO_FIPE` | 001234-5 |

| Coluna Opcional | Nomes Aceitos | Exemplo |
|----------------|---------------|---------|
| **Preço** | `preco`, `Preco`, `PRECO`, `price`, `Price` | 85000 |
| **Referência** | `referencia_mes`, `referencia`, `Referencia` | 2024-09 |

### **2. Executar a Importação**
```bash
node scripts/import-csv-to-transbordo.js <caminho-do-arquivo.csv>
```

**Exemplo:**
```bash
node scripts/import-csv-to-transbordo.js dados/carros.csv
```

## 🔍 **Funcionalidades**

### **✅ Verificação de Duplicidades**
- O script verifica se cada registro já existe na tabela
- Compara: `marca + modelo + ano + codigo_fipe`
- **Pula registros duplicados** automaticamente

### **📊 Processamento em Lotes**
- Processa 100 registros por vez
- Mostra progresso em tempo real
- Relatório detalhado ao final

### **🛡️ Validação de Dados**
- Valida campos obrigatórios
- Limpa e formata strings
- Converte preços automaticamente

## 📈 **Relatório de Importação**

O script mostra:
- ✅ **Registros inseridos**: Novos dados adicionados
- ⏭️ **Registros duplicados**: Dados que já existiam (pulados)
- ❌ **Erros**: Problemas encontrados
- ⏱️ **Tempo total**: Duração da importação

## 📋 **Exemplo de Arquivo CSV**

```csv
marca,modelo,ano,codigo_fipe,preco
Toyota,Corolla,2020,001234-5,85000
Honda,Civic,2021,001235-6,90000
Volkswagen,Golf,2019,001236-7,75000
```

## ⚠️ **Importante**

1. **Backup**: Sempre faça backup antes de importar grandes volumes
2. **Formato**: Use UTF-8 para caracteres especiais
3. **Delimitador**: Use vírgula (,) como separador
4. **Cabeçalho**: Primeira linha deve conter os nomes das colunas

## 🔧 **Configurações**

O script usa as seguintes configurações:
- **Lote**: 100 registros por vez
- **Delay**: Sem delay (processamento direto)
- **Validação**: Campos obrigatórios verificados

## 📊 **Status Atual da Tabela**

- **Total de registros**: 29.617
- **Fonte**: Dados da FIPE + CSV importados
- **Última atualização**: Automática durante importação

## 🆘 **Solução de Problemas**

### **Erro: "Arquivo não encontrado"**
- Verifique o caminho do arquivo
- Use caminho absoluto se necessário

### **Erro: "Campos obrigatórios"**
- Verifique se as colunas têm os nomes corretos
- Confirme se não há linhas vazias

### **Erro: "Conexão com banco"**
- Verifique as variáveis de ambiente no `.env.local`
- Confirme se o Supabase está acessível
