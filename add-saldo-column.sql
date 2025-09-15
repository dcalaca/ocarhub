-- Adicionar campo saldo à tabela ocar_usuarios
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE ocar_usuarios 
ADD COLUMN saldo DECIMAL(10,2) DEFAULT 0.00;

-- Atualizar usuários existentes para ter saldo padrão
UPDATE ocar_usuarios 
SET saldo = 0.00 
WHERE saldo IS NULL;
