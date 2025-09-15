-- Verificar dados de endereço do usuário de teste
SELECT 
  id, 
  nome, 
  endereco_cep, 
  endereco_logradouro, 
  endereco_numero, 
  endereco_complemento,
  endereco_bairro,
  endereco_cidade, 
  endereco_estado
FROM ocar_usuarios 
WHERE id = '550e8400-e29b-41d4-a716-446655440001';
