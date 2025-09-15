-- Script para criar usuário de teste no Supabase
-- Execute este SQL no Supabase SQL Editor

-- 1. Primeiro, insira o usuário na tabela ocar_usuarios
INSERT INTO ocar_usuarios (id, email, nome, tipo_usuario, cpf, telefone, endereco, verificado, ativo) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'teste@ocar.com',
  'Usuário Teste',
  'comprador',
  '123.456.789-00',
  '(11) 99999-9999',
  '{"cidade": "São Paulo", "estado": "SP", "cep": "01234-567"}',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- 2. Depois, crie o usuário no Supabase Auth
-- Vá em Authentication > Users no Supabase Dashboard
-- Clique em "Add user" e use:
-- Email: teste@ocar.com
-- Password: 123456
-- Confirmed: true
