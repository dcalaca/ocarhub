-- Adicionar campos de filtros avançados na tabela ocar_vehicles
-- Execute este SQL no Supabase SQL Editor

-- Campos booleanos para características do veículo
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS aceita_troca BOOLEAN DEFAULT FALSE;
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS alienado BOOLEAN DEFAULT FALSE;
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS garantia_fabrica BOOLEAN DEFAULT FALSE;
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS ipva_pago BOOLEAN DEFAULT FALSE;
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS licenciado BOOLEAN DEFAULT FALSE;
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS revisoes_concessionaria BOOLEAN DEFAULT FALSE;
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS unico_dono BOOLEAN DEFAULT FALSE;
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS leilao BOOLEAN DEFAULT FALSE;

-- Campos de texto para informações adicionais
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS tipo_vendedor TEXT DEFAULT 'Particular';
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS blindagem TEXT DEFAULT 'Não';
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS carroceria TEXT;

-- Adicionar índices para performance nas consultas
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_tipo_vendedor ON ocar_vehicles(tipo_vendedor);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_aceita_troca ON ocar_vehicles(aceita_troca);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_unico_dono ON ocar_vehicles(unico_dono);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_carroceria ON ocar_vehicles(carroceria);

-- Comentários para documentação
COMMENT ON COLUMN ocar_vehicles.aceita_troca IS 'Indica se o veículo aceita troca';
COMMENT ON COLUMN ocar_vehicles.alienado IS 'Indica se o veículo está alienado';
COMMENT ON COLUMN ocar_vehicles.garantia_fabrica IS 'Indica se possui garantia de fábrica';
COMMENT ON COLUMN ocar_vehicles.ipva_pago IS 'Indica se o IPVA está pago';
COMMENT ON COLUMN ocar_vehicles.licenciado IS 'Indica se está licenciado';
COMMENT ON COLUMN ocar_vehicles.revisoes_concessionaria IS 'Indica se teve revisões na concessionária';
COMMENT ON COLUMN ocar_vehicles.unico_dono IS 'Indica se é único dono';
COMMENT ON COLUMN ocar_vehicles.leilao IS 'Indica se veio de leilão';
COMMENT ON COLUMN ocar_vehicles.tipo_vendedor IS 'Tipo do vendedor: Particular, Concessionária, Loja, Revenda';
COMMENT ON COLUMN ocar_vehicles.blindagem IS 'Tipo de blindagem: Sim, Não';
COMMENT ON COLUMN ocar_vehicles.carroceria IS 'Tipo de carroceria: Sedã, Hatch, SUV, etc.';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_vehicles' 
AND column_name IN (
  'aceita_troca', 'alienado', 'garantia_fabrica', 'ipva_pago', 
  'licenciado', 'revisoes_concessionaria', 'unico_dono', 'leilao',
  'tipo_vendedor', 'blindagem', 'carroceria'
)
ORDER BY column_name;
