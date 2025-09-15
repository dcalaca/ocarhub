-- 3. Adicionar campos adicionais de contato
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS telefone_whatsapp VARCHAR(20);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS telefone_fixo VARCHAR(20);
