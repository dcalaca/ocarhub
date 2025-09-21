-- Recriar tabela ocar_fipe_prices com estrutura correta
-- Execute no Supabase SQL Editor

-- 1. Dropar a tabela se existir
DROP TABLE IF EXISTS public.ocar_fipe_prices CASCADE;

-- 2. Criar a tabela com estrutura correta
CREATE TABLE public.ocar_fipe_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.ocar_fipe_models(id),
  version VARCHAR(200) NOT NULL,
  year INTEGER NOT NULL,
  fipe_code VARCHAR(20) NOT NULL,
  reference_month VARCHAR(10) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (model_id, version, year, reference_month)
);

-- 3. Comentários
COMMENT ON TABLE public.ocar_fipe_prices IS 'Tabela de preços FIPE normalizada';
COMMENT ON COLUMN public.ocar_fipe_prices.model_id IS 'Referência para ocar_fipe_models';
COMMENT ON COLUMN public.ocar_fipe_prices.version IS 'Versão do veículo (ex: Sedan EX, Hatchback Touring)';
COMMENT ON COLUMN public.ocar_fipe_prices.year IS 'Ano do veículo';
COMMENT ON COLUMN public.ocar_fipe_prices.fipe_code IS 'Código FIPE';
COMMENT ON COLUMN public.ocar_fipe_prices.reference_month IS 'Mês de referência (ex: 2024-01)';
COMMENT ON COLUMN public.ocar_fipe_prices.price IS 'Preço em reais';

-- 4. Índices para performance
CREATE INDEX idx_ocar_fipe_prices_model_id ON public.ocar_fipe_prices(model_id);
CREATE INDEX idx_ocar_fipe_prices_year ON public.ocar_fipe_prices(year);
CREATE INDEX idx_ocar_fipe_prices_fipe_code ON public.ocar_fipe_prices(fipe_code);
CREATE INDEX idx_ocar_fipe_prices_reference_month ON public.ocar_fipe_prices(reference_month);

-- 5. RLS (Row Level Security)
ALTER TABLE public.ocar_fipe_prices ENABLE ROW LEVEL SECURITY;

-- 6. Política de acesso (permitir leitura para todos)
CREATE POLICY "ocar_fipe_prices_select_policy" ON public.ocar_fipe_prices
  FOR SELECT USING (true);

-- 7. Verificar se foi criada corretamente
SELECT 
  'Tabela ocar_fipe_prices criada com sucesso!' as status,
  COUNT(*) as colunas
FROM information_schema.columns 
WHERE table_name = 'ocar_fipe_prices' 
AND table_schema = 'public';
