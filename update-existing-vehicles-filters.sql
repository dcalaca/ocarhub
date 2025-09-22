-- Atualizar veículos existentes com valores padrão para os novos campos
-- Execute este SQL no Supabase SQL Editor APÓS executar add-vehicle-filter-fields.sql

-- Atualizar todos os veículos existentes com valores padrão
UPDATE ocar_vehicles 
SET 
  aceita_troca = FALSE,
  alienado = FALSE,
  garantia_fabrica = FALSE,
  ipva_pago = FALSE,
  licenciado = FALSE,
  revisoes_concessionaria = FALSE,
  unico_dono = TRUE, -- Assumir que veículos existentes são único dono
  leilao = FALSE,
  tipo_vendedor = 'Particular',
  blindagem = 'Não',
  carroceria = CASE 
    WHEN modelo ILIKE '%hatch%' OR modelo ILIKE '%golf%' OR modelo ILIKE '%polo%' THEN 'Hatch'
    WHEN modelo ILIKE '%suv%' OR modelo ILIKE '%cr-v%' OR modelo ILIKE '%tiguan%' THEN 'SUV'
    WHEN modelo ILIKE '%pickup%' OR modelo ILIKE '%hilux%' OR modelo ILIKE '%ranger%' THEN 'Picape'
    WHEN modelo ILIKE '%conversível%' OR modelo ILIKE '%cabrio%' THEN 'Conversível'
    WHEN modelo ILIKE '%perua%' OR modelo ILIKE '%station%' THEN 'Perua/SW'
    ELSE 'Sedã'
  END
WHERE 
  aceita_troca IS NULL 
  OR alienado IS NULL 
  OR garantia_fabrica IS NULL 
  OR ipva_pago IS NULL 
  OR licenciado IS NULL 
  OR revisoes_concessionaria IS NULL 
  OR unico_dono IS NULL 
  OR leilao IS NULL 
  OR tipo_vendedor IS NULL 
  OR blindagem IS NULL;

-- Verificar quantos veículos foram atualizados
SELECT 
  COUNT(*) as total_veiculos,
  COUNT(CASE WHEN aceita_troca = TRUE THEN 1 END) as aceita_troca_count,
  COUNT(CASE WHEN unico_dono = TRUE THEN 1 END) as unico_dono_count,
  COUNT(CASE WHEN tipo_vendedor = 'Particular' THEN 1 END) as particular_count
FROM ocar_vehicles;

-- Mostrar alguns exemplos dos veículos atualizados
SELECT 
  id,
  marca,
  modelo,
  ano,
  tipo_vendedor,
  carroceria,
  aceita_troca,
  unico_dono,
  blindagem
FROM ocar_vehicles 
LIMIT 5;
