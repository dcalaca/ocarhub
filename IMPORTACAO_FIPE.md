# 📊 Importação da Tabela FIPE para Supabase

Este conjunto de scripts permite importar dados da tabela FIPE atualizada para o Supabase.

## 📁 Arquivos

- `import-fipe-data.js` - Script principal de importação
- `manage-fipe-table.js` - Script de gerenciamento da tabela
- `TabelaFipe/tabela-fipe-out25.csv` - Arquivo CSV com dados da FIPE

## 🚀 Como usar

### 1. Preparação

Certifique-se de que o arquivo `.env.local` contém as variáveis:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### 2. Verificar dados atuais (opcional)

```bash
npm run manage-fipe-table check
```

### 3. Limpar tabela (OPCIONAL - use com cuidado!)

⚠️ **ATENÇÃO**: Esta operação deleta TODOS os dados da tabela!

```bash
node manage-fipe-table.js clear
```

### 4. Importar dados

```bash
npm run import-fipe
```

ou

```bash
node import-fipe-data.js
```

## 📊 Estrutura dos dados

O script converte os dados do CSV para a estrutura da tabela `ocar_transbordo`:

| Campo CSV | Campo Supabase | Conversão |
|-----------|----------------|-----------|
| Brand Value | marca | Texto direto |
| Model Value | modelo | Texto direto |
| Year Code | ano | Extrai ano de "1991-1" → 1991 |
| Fipe Code | codigo_fipe | Texto direto |
| Price | preco | "R$ 14.105,00" → 14105.00 |
| - | referencia_mes | "outubro de 2025" (fixo) |
| - | processado | false (fixo) |

## ⚙️ Configurações

- **Tamanho do lote**: 1000 registros por vez
- **Mês de referência**: "outubro de 2025"
- **Log de progresso**: A cada 5000 registros

## 📈 Monitoramento

O script exibe:
- Progresso em tempo real
- Estatísticas finais
- Taxa de sucesso
- Registros com erro

## 🔧 Comandos de gerenciamento

```bash
# Verificar dados na tabela
node manage-fipe-table.js check

# Verificar mês de referência
node manage-fipe-table.js month

# Limpar tabela (CUIDADO!)
node manage-fipe-table.js clear
```

## 📝 Logs de exemplo

```
🚀 Iniciando importação da tabela FIPE...
📁 Arquivo: ./TabelaFipe/tabela-fipe-out25.csv
📅 Mês de referência: outubro de 2025
📦 Tamanho do lote: 1000
✅ Lote inserido: 1000 registros (Total: 1000)
📊 Progresso: 5000 registros processados
✅ Lote inserido: 1000 registros (Total: 2000)
...
🎉 Importação concluída!
📊 Estatísticas:
   - Total processado: 49166
   - Total inserido: 49166
   - Erros: 0
   - Taxa de sucesso: 100.00%
```

## ⚠️ Importante

1. **Backup**: Sempre faça backup antes de limpar a tabela
2. **Service Role Key**: Use a chave de service role, não a anon key
3. **Monitoramento**: Acompanhe os logs durante a importação
4. **Teste**: Teste primeiro com uma amostra pequena se necessário

## 🆘 Solução de problemas

- **Erro de conexão**: Verifique as variáveis de ambiente
- **Timeout**: Reduza o BATCH_SIZE no script
- **Dados duplicados**: Limpe a tabela antes da importação
- **Erro de formato**: Verifique se o CSV está no formato correto
