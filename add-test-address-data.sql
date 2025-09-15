-- Adicionar dados de endereço de teste ao usuário
UPDATE ocar_usuarios 
SET 
  endereco_cep = '01234-567',
  endereco_logradouro = 'Rua das Flores',
  endereco_numero = '123',
  endereco_complemento = 'Apto 45',
  endereco_bairro = 'Centro',
  endereco_cidade = 'São Paulo',
  endereco_estado = 'SP',
  telefone = '(11) 99999-9999',
  bio = 'Usuário de teste do OcarHub'
WHERE id = '550e8400-e29b-41d4-a716-446655440001';
