# 📊 Guia de Importação Excel FIPE

## 🎯 **Objetivo**
Importar dados do seu arquivo Excel FIPE para a tabela `ocar_transbordo`, evitando duplicidades.

## 📋 **Estrutura do Seu Arquivo Excel**

Seu arquivo tem as seguintes colunas que serão mapeadas:

| Coluna Excel | Mapeamento | Exemplo |
|--------------|------------|---------|
| `marca` | Marca do veículo | Acura |
| `modelo` | Modelo do veículo | Legend 3.2/3.5 |
| `Year Value` | Ano + Combustível | 1998 Gasolina |
| `Fipe Code` | Código FIPE | 038002-4 |
| `Price` | Preço | R$ 25.276,00 |
| `Month` | Mês de referência | setembro de 2025 |

## 🚀 **Como Usar**

### **1. Salvar como CSV**
1. Abra seu arquivo Excel
2. Vá em **Arquivo** → **Salvar Como**
3. Escolha formato **CSV (delimitado por vírgulas)**
4. Salve com nome como `fipe-data.csv`

### **2. Executar Importação**
```bash
node scripts/import-excel-fipe.js <caminho-do-arquivo.csv>
```

**Exemplo:**
```bash
node scripts/import-excel-fipe.js dados/fipe-data.csv
```

## 🔍 **Funcionalidades Específicas**

### **✅ Processamento Inteligente**
- **Ano**: Extrai ano de "1998 Gasolina" → `1998`
- **Combustível**: Identifica tipo de combustível
- **Preço**: Converte "R$ 25.276,00" → `25276.00`
- **Mês**: Converte "setembro de 2025" → `2025-09`

### **🛡️ Validação de Dados**
- Verifica campos obrigatórios
- Limpa e formata strings
- Converte preços automaticamente
- Valida códigos FIPE

### **📊 Verificação de Duplicidades**
- Compara: `marca + modelo + ano + codigo_fipe`
- **Pula registros duplicados** automaticamente
- Insere apenas dados novos

## 📈 **Exemplo de Processamento**

**Dados do Excel:**
```
marca: Acura
modelo: Legend 3.2/3.5
Year Value: 1998 Gasolina
Fipe Code: 038002-4
Price: R$ 25.276,00
Month: setembro de 2025
```

**Dados Processados:**
```json
{
  "marca": "Acura",
  "modelo": "Legend 3.2/3.5",
  "ano": 1998,
  "codigo_fipe": "038002-4",
  "preco": 25276.00,
  "referencia_mes": "2025-09",
  "processado": false
}
```

## 📊 **Relatório de Importação**

O script mostra:
- ✅ **Registros inseridos**: Novos dados adicionados
- ⏭️ **Registros duplicados**: Dados que já existiam (pulados)
- ❌ **Erros**: Problemas encontrados
- ⏱️ **Tempo total**: Duração da importação

## ⚠️ **Importante**

1. **Formato**: Salve como CSV UTF-8
2. **Cabeçalho**: Mantenha a primeira linha com nomes das colunas
3. **Delimitador**: Use vírgula (,) como separador
4. **Backup**: Faça backup antes de importar

## 🔧 **Configurações**

- **Lote**: 100 registros por vez
- **Validação**: Campos obrigatórios verificados
- **Duplicidade**: Verificação automática

## 📊 **Status Atual da Tabela**

- **Total de registros**: 29.617
- **Fonte**: Dados da FIPE + CSV importados
- **Pronto para**: Importar seu arquivo Excel

## 🆘 **Solução de Problemas**

### **Erro: "Arquivo não encontrado"**
- Verifique o caminho do arquivo
- Use caminho absoluto se necessário

### **Erro: "Registro inválido"**
- Verifique se as colunas têm os nomes corretos
- Confirme se não há linhas vazias

### **Erro: "Ano não encontrado"**
- Verifique formato da coluna "Year Value"
- Deve estar como "1998 Gasolina"

## 🎯 **Próximos Passos**

1. Salve seu Excel como CSV
2. Execute o comando de importação
3. Verifique o relatório final
4. Confirme os dados na tabela
