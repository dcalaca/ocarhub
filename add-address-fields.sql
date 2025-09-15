-- 2. Adicionar campos de endereço
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_cep VARCHAR(10);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_logradouro VARCHAR(255);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_numero VARCHAR(20);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_complemento VARCHAR(100);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_bairro VARCHAR(100);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_cidade VARCHAR(100);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_estado VARCHAR(2);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS endereco_pais VARCHAR(50) DEFAULT 'Brasil';
