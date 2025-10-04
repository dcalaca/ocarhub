# 🔧 Correção da Tabela de Lista de Desejos

## ❌ **Problema Identificado:**
A tabela `ocar_wishlist_veiculos` existe mas não tem as colunas necessárias para os novos filtros.

## 🛠️ **Solução:**

### **1. Acesse o Painel do Supabase:**
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto `ocarhub`
4. Vá para **SQL Editor**

### **2. Execute este SQL:**

```sql
-- Adicionar colunas que faltam na tabela ocar_wishlist_veiculos
ALTER TABLE ocar_wishlist_veiculos 
ADD COLUMN IF NOT EXISTS unico_dono BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS km_min INTEGER,
ADD COLUMN IF NOT EXISTS km_max INTEGER,
ADD COLUMN IF NOT EXISTS estado VARCHAR(2);

-- Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_estado ON ocar_wishlist_veiculos(estado);
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_unico_dono ON ocar_wishlist_veiculos(unico_dono);

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_wishlist_veiculos' 
ORDER BY ordinal_position;
```

### **3. Verificação:**
Após executar o SQL, você deve ver as seguintes colunas na tabela:
- ✅ `unico_dono` (BOOLEAN)
- ✅ `km_min` (INTEGER)
- ✅ `km_max` (INTEGER)
- ✅ `estado` (VARCHAR(2))

### **4. Teste:**
Após executar o SQL, teste novamente a funcionalidade de "Adicionar à Lista" nas configurações.

## 📋 **Estrutura Completa da Tabela:**

```sql
CREATE TABLE ocar_wishlist_veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100),
  versao VARCHAR(100),
  ano_min INTEGER,
  ano_max INTEGER,
  preco_min DECIMAL(12,2),
  preco_max DECIMAL(12,2),
  unico_dono BOOLEAN DEFAULT false,  -- ← NOVA
  km_min INTEGER,                    -- ← NOVA
  km_max INTEGER,                    -- ← NOVA
  estado VARCHAR(2),                 -- ← NOVA
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 **Após a Correção:**
A funcionalidade de lista de desejos funcionará completamente com todos os filtros:
- ✅ Marca e Modelo
- ✅ Ano Mínimo e Máximo
- ✅ Preço Mínimo e Máximo
- ✅ Único Dono
- ✅ Quilometragem Mínima e Máxima
- ✅ Estado (Localização)
