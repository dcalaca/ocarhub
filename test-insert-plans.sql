-- Teste de inserção de planos com a estrutura atual da tabela
-- Execute este SQL no Supabase SQL Editor

-- Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_planos' 
ORDER BY ordinal_position;

-- Inserir apenas um plano para teste (Gratuito)
INSERT INTO ocar_planos (
  nome, 
  tipo, 
  preco, 
  descricao, 
  beneficios, 
  limite_anuncios, 
  limite_consultas, 
  destaque, 
  ativo
) VALUES (
  'Gratuito',
  'anuncio',
  0.00,
  'Anúncio básico gratuito com limitações',
  '[
    "Anúncio básico por 30 dias",
    "Até 5 fotos",
    "Aparece na busca normal",
    "Sem destaque especial",
    "Limite: 3 anúncios por CPF"
  ]'::jsonb,
  3,
  0,
  false,
  true
);

-- Verificar se foi inserido
SELECT * FROM ocar_planos WHERE nome = 'Gratuito';
