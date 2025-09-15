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
