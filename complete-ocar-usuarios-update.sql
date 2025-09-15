-- Script completo para atualizar tabela ocar_usuarios
-- Execute no Supabase SQL Editor

-- 1. Adicionar campo bio (biografia)
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Adicionar campos de endereço
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_cep VARCHAR(10);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_logradouro VARCHAR(255);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_numero VARCHAR(20);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_complemento VARCHAR(100);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_bairro VARCHAR(100);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_cidade VARCHAR(100);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_estado VARCHAR(2);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_pais VARCHAR(50) DEFAULT 'Brasil';

-- 3. Adicionar campos adicionais de contato
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS telefone_whatsapp VARCHAR(20);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS telefone_fixo VARCHAR(20);

-- 4. Adicionar campos de perfil
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS genero VARCHAR(20);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 5. Adicionar campos de verificação
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT FALSE;
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS verificado_em TIMESTAMP WITH TIME ZONE;
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS plano VARCHAR(20) DEFAULT 'gratuito';

-- 6. Adicionar campo updated_at
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 7. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Aplicar trigger na tabela
DROP TRIGGER IF EXISTS update_ocar_usuarios_updated_at ON ocar_usuarios;
CREATE TRIGGER update_ocar_usuarios_updated_at
    BEFORE UPDATE ON ocar_usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Adicionar comentários nas colunas
COMMENT ON COLUMN ocar_usuarios.bio IS 'Biografia do usuário';
COMMENT ON COLUMN ocar_usuarios.endereco_cep IS 'CEP do endereço';
COMMENT ON COLUMN ocar_usuarios.endereco_logradouro IS 'Rua/Avenida do endereço';
COMMENT ON COLUMN ocar_usuarios.endereco_numero IS 'Número do endereço';
COMMENT ON COLUMN ocar_usuarios.endereco_complemento IS 'Complemento do endereço (apto, casa, etc)';
COMMENT ON COLUMN ocar_usuarios.endereco_bairro IS 'Bairro do endereço';
COMMENT ON COLUMN ocar_usuarios.endereco_cidade IS 'Cidade do endereço';
COMMENT ON COLUMN ocar_usuarios.endereco_estado IS 'Estado do endereço (UF)';
COMMENT ON COLUMN ocar_usuarios.endereco_pais IS 'País do endereço';
COMMENT ON COLUMN ocar_usuarios.telefone_whatsapp IS 'Telefone WhatsApp';
COMMENT ON COLUMN ocar_usuarios.telefone_fixo IS 'Telefone fixo';
COMMENT ON COLUMN ocar_usuarios.data_nascimento IS 'Data de nascimento';
COMMENT ON COLUMN ocar_usuarios.genero IS 'Gênero do usuário';
COMMENT ON COLUMN ocar_usuarios.avatar_url IS 'URL do avatar do usuário';
COMMENT ON COLUMN ocar_usuarios.verificado IS 'Se o usuário foi verificado';
COMMENT ON COLUMN ocar_usuarios.verificado_em IS 'Data da verificação';
COMMENT ON COLUMN ocar_usuarios.plano IS 'Plano do usuário (gratuito, premium, etc)';
COMMENT ON COLUMN ocar_usuarios.updated_at IS 'Data da última atualização';
