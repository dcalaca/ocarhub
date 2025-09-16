-- Teste de integração do sistema de planos
-- Execute este SQL no Supabase SQL Editor para verificar se tudo está funcionando

-- 1. Verificar se os planos foram inseridos corretamente
SELECT 
  id,
  nome, 
  tipo, 
  preco, 
  duracao_dias,
  destaque, 
  ativo,
  limite_anuncios,
  beneficios
FROM ocar_planos 
WHERE tipo = 'anuncio'
ORDER BY preco;

-- 2. Verificar se a estrutura da tabela está correta
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_planos' 
ORDER BY ordinal_position;

-- 3. Testar inserção de um plano adicional (opcional)
-- INSERT INTO ocar_planos (
--   nome, 
--   tipo, 
--   preco, 
--   descricao, 
--   beneficios, 
--   limite_anuncios, 
--   limite_consultas, 
--   duracao_dias,
--   destaque, 
--   ativo
-- ) VALUES (
--   'Teste',
--   'anuncio',
--   50.00,
--   'Plano de teste',
--   '["Teste 1", "Teste 2"]'::jsonb,
--   0,
--   0,
--   15,
--   false,
--   true
-- );

-- 4. Verificar se os triggers estão funcionando
-- UPDATE ocar_planos 
-- SET nome = 'Teste Update' 
-- WHERE nome = 'Teste';

-- 5. Verificar se a coluna updated_at foi atualizada
-- SELECT nome, updated_at 
-- FROM ocar_planos 
-- WHERE nome = 'Teste Update';

-- 6. Limpar dados de teste (descomente se executou o teste)
-- DELETE FROM ocar_planos WHERE nome = 'Teste Update';
