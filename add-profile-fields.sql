-- 4. Adicionar campos de perfil
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS genero VARCHAR(20);
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS avatar_url TEXT;
