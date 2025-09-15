-- Dados de teste para Ocar Platform
-- Execute este SQL no Supabase SQL Editor

-- Inserir usuários de teste
INSERT INTO ocar_usuarios (id, email, nome, tipo_usuario, cpf, telefone, endereco, verificado, ativo, saldo) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'teste@ocar.com', 'Usuário Teste', 'comprador', '123.456.789-00', '(11) 99999-9999', '{"cidade": "São Paulo", "estado": "SP", "cep": "01234-567"}', true, true, 1500.00),
('550e8400-e29b-41d4-a716-446655440002', 'vendedor@ocar.com', 'João Vendedor', 'vendedor', '987.654.321-00', '(11) 88888-8888', '{"cidade": "São Paulo", "estado": "SP", "cep": "04567-890"}', true, true, 2500.00),
('550e8400-e29b-41d4-a716-446655440003', 'maria@ocar.com', 'Maria Silva', 'comprador', '111.222.333-44', '(11) 77777-7777', '{"cidade": "Rio de Janeiro", "estado": "RJ", "cep": "20000-000"}', true, true, 800.00);

-- Inserir veículos de teste
INSERT INTO ocar_vehicles (id, dono_id, marca, modelo, versao, ano, cor, quilometragem, motor, combustivel, cambio, opcionais, preco, fipe, placa_parcial, numero_proprietarios, observacoes, fotos, plano, verificado, status, cidade, views, likes, shares) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Volkswagen', 'Gol', '1.0 MPI Total Flex 8V 5p', 2022, 'Branco', 15000, '1.0 MPI', ARRAY['Flex'], 'manual', ARRAY['Ar Condicionado', 'Direção Hidráulica', 'Vidros Elétricos'], 65000.00, 63000.00, 'ABC-1D34', 1, 'Carro em excelente estado, único dono.', ARRAY['/placeholder.svg?width=800&height=600', '/placeholder.svg?width=800&height=600'], 'destaque', true, 'ativo', 'São Paulo', 1854, 123, 45),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Fiat', 'Strada', 'Freedom 1.3 Flex 8V CD', 2023, 'Vermelho', 5000, '1.3 Firefly', ARRAY['Flex'], 'manual', ARRAY['Multimídia', 'Câmera de Ré', 'Rodas de Liga Leve'], 92000.00, 90000.00, 'XYZ-9G87', 1, 'Pickup seminova, poucos quilômetros.', ARRAY['/placeholder.svg?width=800&height=600', '/placeholder.svg?width=800&height=600'], 'gratuito', false, 'ativo', 'São Paulo', 987, 88, 21),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Chevrolet', 'Onix', 'LTZ 1.0 Turbo Flex Aut.', 2021, 'Prata', 32000, '1.0 Turbo', ARRAY['Flex'], 'automatico', ARRAY['Teto Solar', 'Park Assist', 'Wi-Fi Nativo'], 78000.00, 77000.00, 'QWE-5R67', 2, 'Carro completo, bem conservado.', ARRAY['/placeholder.svg?width=800&height=600', '/placeholder.svg?width=800&height=600'], 'destaque', true, 'ativo', 'Rio de Janeiro', 2341, 210, 68);

-- Inserir alguns favoritos de teste
INSERT INTO ocar_favorites (user_id, vehicle_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003');

-- Inserir algumas curtidas de teste
INSERT INTO ocar_likes (user_id, vehicle_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002');

-- Inserir mensagens de teste
INSERT INTO ocar_messages (sender_id, receiver_id, vehicle_id, content) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Olá! Tenho interesse neste Gol. Ainda está disponível?'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Sim, ainda está disponível! Gostaria de agendar uma visita?'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Perfeito! Qual seria o melhor horário?');
