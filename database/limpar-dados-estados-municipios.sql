-- Limpar dados de estados e municípios para reprocessar com codificação correta
DELETE FROM ocar_municipios;
DELETE FROM ocar_estados;

-- Resetar sequências
ALTER SEQUENCE ocar_municipios_id_seq RESTART WITH 1;
ALTER SEQUENCE ocar_estados_id_seq RESTART WITH 1;

-- Verificar se as tabelas estão vazias
SELECT 'Estados' as tabela, COUNT(*) as total FROM ocar_estados
UNION ALL
SELECT 'Municípios' as tabela, COUNT(*) as total FROM ocar_municipios;
