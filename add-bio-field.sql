-- 1. Adicionar campo bio (biografia)
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS bio TEXT;
