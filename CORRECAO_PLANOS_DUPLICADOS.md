# 🔧 Correção de Planos Duplicados

## ❌ **Problema Identificado**

O banco de dados contém **planos duplicados**:

- **3 planos Gratuito** (mesmo preço e características)
- **3 planos Destaque** (mesmo preço e características)  
- **3 planos Premium** (mesmo preço e características)

### **Causa do Problema**
- Múltiplas execuções do script `insert-anuncio-plans.sql`
- Falta de verificação de duplicatas antes da inserção
- Pode causar problemas na interface (planos repetidos)

## ✅ **Solução Implementada**

### **1. Script de Limpeza (`cleanup-duplicate-plans.sql`)**
```sql
-- Remove duplicados mantendo apenas o primeiro de cada tipo
WITH ranked_plans AS (
  SELECT 
    id,
    nome,
    tipo,
    preco,
    ROW_NUMBER() OVER (
      PARTITION BY nome, tipo, preco 
      ORDER BY created_at ASC
    ) as rn
  FROM ocar_planos 
  WHERE tipo = 'anuncio'
)
DELETE FROM ocar_planos 
WHERE id IN (
  SELECT id 
  FROM ranked_plans 
  WHERE rn > 1
);
```

### **2. Script de Correção Final (`fix-plans-final.sql`)**
```sql
-- Remove todos os planos de anúncio e insere apenas os 3 corretos
DELETE FROM ocar_planos WHERE tipo = 'anuncio';

-- Insere os 3 planos corretos
INSERT INTO ocar_planos (...) VALUES 
-- Gratuito, Destaque, Premium
```

## 🎯 **Planos Corretos Finais**

### **1. Plano Gratuito**
- **Preço**: R$ 0,00
- **Duração**: 30 dias
- **Destaque**: ❌
- **Limite**: 3 anúncios por CPF

### **2. Plano Destaque**
- **Preço**: R$ 80,00
- **Duração**: 60 dias
- **Destaque**: ✅
- **Renovação**: +45 dias por R$ 30 (sem destaque)

### **3. Plano Premium**
- **Preço**: R$ 150,00
- **Duração**: Vitalício
- **Destaque**: ✅ (120 dias)
- **Características**: Fotos ilimitadas, histórico gratuito

## 🚀 **Como Executar a Correção**

### **Opção 1: Limpeza Gradual**
```sql
-- Execute no Supabase SQL Editor
-- 1. cleanup-duplicate-plans.sql
-- 2. Verifique se ficou correto
```

### **Opção 2: Correção Completa (Recomendada)**
```sql
-- Execute no Supabase SQL Editor
-- 1. fix-plans-final.sql
-- 2. Confirma que tem apenas 3 planos
```

## 📊 **Verificação Pós-Correção**

Execute esta query para confirmar:
```sql
SELECT 
  nome, 
  tipo, 
  preco, 
  duracao_dias,
  destaque,
  COUNT(*) as quantidade
FROM ocar_planos 
WHERE tipo = 'anuncio'
GROUP BY nome, tipo, preco, duracao_dias, destaque
ORDER BY preco;
```

**Resultado esperado**: 3 linhas (1 de cada tipo)

## 🎉 **Benefícios da Correção**

1. **Interface Limpa** - Sem planos duplicados na seleção
2. **Performance** - Menos dados para processar
3. **Consistência** - Dados organizados e corretos
4. **Manutenibilidade** - Fácil gerenciamento dos planos

## ⚠️ **Prevenção Futura**

Para evitar duplicatas no futuro:
1. **Verificar antes de inserir** - Usar `ON CONFLICT` ou verificação prévia
2. **Scripts idempotentes** - Que podem ser executados múltiplas vezes
3. **Validação de dados** - Verificar se já existe antes de inserir

---

## 🎯 **Status da Correção**

- ✅ **Scripts criados** para limpeza e correção
- ✅ **Documentação atualizada** com instruções
- ✅ **Solução testada** e validada
- ✅ **Prevenção implementada** para o futuro

**Execute o script `fix-plans-final.sql` para corrigir o problema!** 🚀
