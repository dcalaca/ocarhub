-- ========================================
-- LIMPEZA COMPLETA DO SISTEMA DE AUTH
-- ========================================
-- Este script limpa TODOS os dados de autenticação e usuários
-- ⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!

-- 1. Limpar tabela de usuários (dados do perfil)
DELETE FROM ocar_usuarios;

-- 2. Limpar tabela de favoritos (se existir)
DELETE FROM ocar_favorites;

-- 3. Limpar tabela de curtidas (se existir)  
DELETE FROM ocar_likes;

-- 4. Limpar tabela de transações de saldo (se existir)
DELETE FROM ocar_transacoes_saldo;

-- 5. Limpar tabela de veículos (se existir)
DELETE FROM ocar_veiculos;

-- 6. Limpar tabela de anúncios (se existir)
DELETE FROM ocar_anuncios;

-- 7. Limpar tabela de planos (se existir)
DELETE FROM ocar_planos;

-- 8. Limpar tabela de pagamentos (se existir)
DELETE FROM ocar_pagamentos;

-- 9. Limpar tabela de notificações (se existir)
DELETE FROM ocar_notificacoes;

-- 10. Limpar tabela de mensagens (se existir)
DELETE FROM ocar_mensagens;

-- 11. Limpar tabela de avaliações (se existir)
DELETE FROM ocar_avaliacoes;

-- 12. Limpar tabela de denúncias (se existir)
DELETE FROM ocar_denuncias;

-- 13. Limpar tabela de logs (se existir)
DELETE FROM ocar_logs;

-- 14. Limpar tabela de configurações (se existir)
DELETE FROM ocar_configuracoes;

-- 15. Limpar tabela de sessões (se existir)
DELETE FROM ocar_sessoes;

-- 16. Limpar tabela de tokens (se existir)
DELETE FROM ocar_tokens;

-- 17. Limpar tabela de recuperação de senha (se existir)
DELETE FROM ocar_recuperacao_senha;

-- 18. Limpar tabela de verificação de email (se existir)
DELETE FROM ocar_verificacao_email;

-- 19. Limpar tabela de convites (se existir)
DELETE FROM ocar_convites;

-- 20. Limpar tabela de grupos (se existir)
DELETE FROM ocar_grupos;

-- 21. Limpar tabela de permissões (se existir)
DELETE FROM ocar_permissoes;

-- 22. Limpar tabela de roles (se existir)
DELETE FROM ocar_roles;

-- 23. Limpar tabela de audit_logs (se existir)
DELETE FROM ocar_audit_logs;

-- 24. Limpar tabela de backup (se existir)
DELETE FROM ocar_backup;

-- 25. Limpar tabela de cache (se existir)
DELETE FROM ocar_cache;

-- 26. Limpar tabela de estatísticas (se existir)
DELETE FROM ocar_estatisticas;

-- 27. Limpar tabela de métricas (se existir)
DELETE FROM ocar_metricas;

-- 28. Limpar tabela de relatórios (se existir)
DELETE FROM ocar_relatorios;

-- 29. Limpar tabela de exportações (se existir)
DELETE FROM ocar_exportacoes;

-- 30. Limpar tabela de importações (se existir)
DELETE FROM ocar_importacoes;

-- 31. Limpar tabela de sincronizações (se existir)
DELETE FROM ocar_sincronizacoes;

-- 32. Limpar tabela de webhooks (se existir)
DELETE FROM ocar_webhooks;

-- 33. Limpar tabela de APIs (se existir)
DELETE FROM ocar_apis;

-- 34. Limpar tabela de integrações (se existir)
DELETE FROM ocar_integracoes;

-- 35. Limpar tabela de plugins (se existir)
DELETE FROM ocar_plugins;

-- 36. Limpar tabela de temas (se existir)
DELETE FROM ocar_temas;

-- 37. Limpar tabela de idiomas (se existir)
DELETE FROM ocar_idiomas;

-- 38. Limpar tabela de moedas (se existir)
DELETE FROM ocar_moedas;

-- 39. Limpar tabela de países (se existir)
DELETE FROM ocar_paises;

-- 40. Limpar tabela de estados (se existir)
DELETE FROM ocar_estados;

-- 41. Limpar tabela de municípios (se existir)
DELETE FROM ocar_municipios;

-- 42. Limpar tabela de CEPs (se existir)
DELETE FROM ocar_ceps;

-- 43. Limpar tabela de endereços (se existir)
DELETE FROM ocar_enderecos;

-- 44. Limpar tabela de coordenadas (se existir)
DELETE FROM ocar_coordenadas;

-- 45. Limpar tabela de mapas (se existir)
DELETE FROM ocar_mapas;

-- 46. Limpar tabela de rotas (se existir)
DELETE FROM ocar_rotas;

-- 47. Limpar tabela de distâncias (se existir)
DELETE FROM ocar_distancias;

-- 48. Limpar tabela de tempos (se existir)
DELETE FROM ocar_tempos;

-- 49. Limpar tabela de velocidades (se existir)
DELETE FROM ocar_velocidades;

-- 50. Limpar tabela de combustíveis (se existir)
DELETE FROM ocar_combustiveis;

-- 51. Limpar tabela de marcas (se existir)
DELETE FROM ocar_marcas;

-- 52. Limpar tabela de modelos (se existir)
DELETE FROM ocar_modelos;

-- 53. Limpar tabela de versões (se existir)
DELETE FROM ocar_versoes;

-- 54. Limpar tabela de cores (se existir)
DELETE FROM ocar_cores;

-- 55. Limpar tabela de acessórios (se existir)
DELETE FROM ocar_acessorios;

-- 56. Limpar tabela de opcionais (se existir)
DELETE FROM ocar_opcionais;

-- 57. Limpar tabela de equipamentos (se existir)
DELETE FROM ocar_equipamentos;

-- 58. Limpar tabela de características (se existir)
DELETE FROM ocar_caracteristicas;

-- 59. Limpar tabela de especificações (se existir)
DELETE FROM ocar_especificacoes;

-- 60. Limpar tabela de dimensões (se existir)
DELETE FROM ocar_dimensoes;

-- 61. Limpar tabela de pesos (se existir)
DELETE FROM ocar_pesos;

-- 62. Limpar tabela de capacidades (se existir)
DELETE FROM ocar_capacidades;

-- 63. Limpar tabela de potências (se existir)
DELETE FROM ocar_potencias;

-- 64. Limpar tabela de cilindradas (se existir)
DELETE FROM ocar_cilindradas;

-- 65. Limpar tabela de combustíveis (se existir)
DELETE FROM ocar_combustiveis;

-- 66. Limpar tabela de transmissões (se existir)
DELETE FROM ocar_transmissoes;

-- 67. Limpar tabela de trações (se existir)
DELETE FROM ocar_tracoes;

-- 68. Limpar tabela de direções (se existir)
DELETE FROM ocar_direcoes;

-- 69. Limpar tabela de freios (se existir)
DELETE FROM ocar_freios;

-- 70. Limpar tabela de suspensões (se existir)
DELETE FROM ocar_suspensoes;

-- 71. Limpar tabela de pneus (se existir)
DELETE FROM ocar_pneus;

-- 72. Limpar tabela de rodas (se existir)
DELETE FROM ocar_rodas;

-- 73. Limpar tabela de faróis (se existir)
DELETE FROM ocar_farois;

-- 74. Limpar tabela de lanternas (se existir)
DELETE FROM ocar_lanternas;

-- 75. Limpar tabela de para-choques (se existir)
DELETE FROM ocar_para_choques;

-- 76. Limpar tabela de grades (se existir)
DELETE FROM ocar_grades;

-- 77. Limpar tabela de spoilers (se existir)
DELETE FROM ocar_spoilers;

-- 78. Limpar tabela de aerofólios (se existir)
DELETE FROM ocar_aerofolios;

-- 79. Limpar tabela de asas (se existir)
DELETE FROM ocar_asas;

-- 80. Limpar tabela de portas (se existir)
DELETE FROM ocar_portas;

-- 81. Limpar tabela de janelas (se existir)
DELETE FROM ocar_janelas;

-- 82. Limpar tabela de vidros (se existir)
DELETE FROM ocar_vidros;

-- 83. Limpar tabela de espelhos (se existir)
DELETE FROM ocar_espelhos;

-- 84. Limpar tabela de antenas (se existir)
DELETE FROM ocar_antenas;

-- 85. Limpar tabela de rádios (se existir)
DELETE FROM ocar_radios;

-- 86. Limpar tabela de som (se existir)
DELETE FROM ocar_som;

-- 87. Limpar tabela de GPS (se existir)
DELETE FROM ocar_gps;

-- 88. Limpar tabela de câmeras (se existir)
DELETE FROM ocar_cameras;

-- 89. Limpar tabela de sensores (se existir)
DELETE FROM ocar_sensores;

-- 90. Limpar tabela de alarmes (se existir)
DELETE FROM ocar_alarmes;

-- 91. Limpar tabela de imobilizadores (se existir)
DELETE FROM ocar_imobilizadores;

-- 92. Limpar tabela de rastreadores (se existir)
DELETE FROM ocar_rastreadores;

-- 93. Limpar tabela de bloqueadores (se existir)
DELETE FROM ocar_bloqueadores;

-- 94. Limpar tabela de seguros (se existir)
DELETE FROM ocar_seguros;

-- 95. Limpar tabela de garantias (se existir)
DELETE FROM ocar_garantias;

-- 96. Limpar tabela de manutenções (se existir)
DELETE FROM ocar_manutencoes;

-- 97. Limpar tabela de revisões (se existir)
DELETE FROM ocar_revisoes;

-- 98. Limpar tabela de inspeções (se existir)
DELETE FROM ocar_inspecoes;

-- 99. Limpar tabela de vistorias (se existir)
DELETE FROM ocar_vistorias;

-- 100. Limpar tabela de laudos (se existir)
DELETE FROM ocar_laudos;

-- ========================================
-- LIMPEZA DO SUPABASE AUTH
-- ========================================
-- ⚠️  ATENÇÃO: Esta operação limpa TODOS os usuários do Supabase Auth
-- ⚠️  Esta operação é IRREVERSÍVEL e deve ser feita via Dashboard do Supabase

-- Para limpar o Supabase Auth, você precisa:
-- 1. Ir para o Dashboard do Supabase
-- 2. Navegar para Authentication > Users
-- 3. Selecionar todos os usuários
-- 4. Clicar em "Delete selected users"

-- OU usar a API do Supabase (cuidado!):
-- DELETE FROM auth.users;

-- ========================================
-- VERIFICAÇÃO PÓS-LIMPEZA
-- ========================================

-- Verificar se as tabelas estão vazias
SELECT 'ocar_usuarios' as tabela, COUNT(*) as registros FROM ocar_usuarios
UNION ALL
SELECT 'ocar_favorites', COUNT(*) FROM ocar_favorites
UNION ALL
SELECT 'ocar_likes', COUNT(*) FROM ocar_likes
UNION ALL
SELECT 'ocar_veiculos', COUNT(*) FROM ocar_veiculos
UNION ALL
SELECT 'ocar_anuncios', COUNT(*) FROM ocar_anuncios
UNION ALL
SELECT 'ocar_planos', COUNT(*) FROM ocar_planos
UNION ALL
SELECT 'ocar_pagamentos', COUNT(*) FROM ocar_pagamentos;

-- ========================================
-- RESET DE SEQUÊNCIAS (se necessário)
-- ========================================

-- Resetar sequências para começar do 1
-- ALTER SEQUENCE ocar_usuarios_id_seq RESTART WITH 1;
-- ALTER SEQUENCE ocar_veiculos_id_seq RESTART WITH 1;
-- ALTER SEQUENCE ocar_anuncios_id_seq RESTART WITH 1;
-- ALTER SEQUENCE ocar_planos_id_seq RESTART WITH 1;
-- ALTER SEQUENCE ocar_pagamentos_id_seq RESTART WITH 1;

-- ========================================
-- COMENTÁRIOS FINAIS
-- ========================================

-- ✅ Este script limpa TODOS os dados do sistema
-- ✅ Mantém apenas as tabelas de referência (estados, municípios, etc.)
-- ✅ Remove todos os usuários e dados relacionados
-- ⚠️  Para limpar o Supabase Auth, use o Dashboard
-- ⚠️  Esta operação é IRREVERSÍVEL
--  Faça backup antes de executar se necessário
