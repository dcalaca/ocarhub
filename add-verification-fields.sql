-- 5. Adicionar campos de verificação
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT FALSE;
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS verificado_em TIMESTAMP WITH TIME ZONE;
ALTER TABLE ocar_usuarios ADD COLUMN IF NOT EXISTS plano VARCHAR(20) DEFAULT 'gratuito';
