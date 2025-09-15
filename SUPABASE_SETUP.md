# Configuração do Supabase para Ocar Platform

## 1. Configuração do Banco de Dados

### Passo 1: Executar o Schema Principal
Execute o arquivo `supabase-schema.sql` no SQL Editor do Supabase. Este arquivo contém:
- Comentários sobre a estrutura da tabela `ocar_users` (já criada)
- Schema para as demais tabelas

### Passo 2: Executar as Tabelas Adicionais
Execute o arquivo `supabase-additional-tables.sql` no SQL Editor do Supabase. Este arquivo contém:
- Criação das tabelas: `ocar_vehicles`, `ocar_favorites`, `ocar_likes`, `ocar_messages`, `ocar_transactions`, `ocar_vehicle_history`
- Índices para performance
- Políticas RLS (Row Level Security)
- Triggers para `updated_at`
- Função para incrementar visualizações

## 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase

# Stripe Configuration (opcional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=sua_chave_publica_do_stripe
STRIPE_SECRET_KEY=sua_chave_secreta_do_stripe
STRIPE_WEBHOOK_SECRET=seu_webhook_secret_do_stripe

# Pagar.me Configuration (opcional)
PAGARME_API_KEY=sua_api_key_do_pagarme
PAGARME_WEBHOOK_SECRET=seu_webhook_secret_do_pagarme
```

## 3. Estrutura das Tabelas

### ocar_usuarios (já criada)
- `id`: UUID (chave primária)
- `email`: VARCHAR (único, obrigatório)
- `senha_hash`: VARCHAR (opcional - usado pelo Supabase Auth)
- `nome`: VARCHAR (obrigatório)
- `cpf`: VARCHAR (opcional)
- `telefone`: VARCHAR (opcional)
- `tipo_usuario`: VARCHAR (padrão: 'comprador')
- `foto_perfil`: TEXT (opcional)
- `endereco`: JSONB (opcional)
- `data_nascimento`: DATE (opcional)
- `verificado`: BOOLEAN (padrão: false)
- `ativo`: BOOLEAN (padrão: true)
- `promocoes_email`: BOOLEAN (padrão: true)
- `alertas_multas`: BOOLEAN (padrão: false)
- `tema_preferido`: VARCHAR (padrão: 'claro')
- `cnpj`: VARCHAR (opcional)
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

### ocar_vehicles
- `id`: UUID (chave primária)
- `dono_id`: UUID (referência para ocar_users)
- `marca`, `modelo`, `versao`: TEXT
- `ano`: INTEGER
- `cor`: TEXT
- `quilometragem`: INTEGER
- `motor`: TEXT
- `combustivel`: TEXT[] (array)
- `cambio`: TEXT
- `opcionais`: TEXT[] (array)
- `preco`: DECIMAL(10,2)
- `fipe`: DECIMAL(10,2) (opcional)
- `placa_parcial`: TEXT (opcional)
- `numero_proprietarios`: INTEGER
- `observacoes`: TEXT (opcional)
- `fotos`: TEXT[] (array)
- `plano`: TEXT ('gratuito' ou 'destaque')
- `verificado`: BOOLEAN
- `status`: TEXT ('ativo', 'pausado', 'expirado')
- `cidade`: TEXT
- `views`, `likes`, `shares`: INTEGER
- `created_at`, `updated_at`: TIMESTAMP

### ocar_favorites
- `id`: UUID (chave primária)
- `user_id`: UUID (referência para ocar_users)
- `vehicle_id`: UUID (referência para ocar_vehicles)
- `created_at`: TIMESTAMP
- UNIQUE(user_id, vehicle_id)

### ocar_likes
- `id`: UUID (chave primária)
- `user_id`: UUID (referência para ocar_users)
- `vehicle_id`: UUID (referência para ocar_vehicles)
- `created_at`: TIMESTAMP
- UNIQUE(user_id, vehicle_id)

### ocar_messages
- `id`: UUID (chave primária)
- `sender_id`: UUID (referência para ocar_users)
- `receiver_id`: UUID (referência para ocar_users)
- `vehicle_id`: UUID (referência para ocar_vehicles)
- `content`: TEXT
- `read_at`: TIMESTAMP (opcional)
- `created_at`: TIMESTAMP

### ocar_transactions
- `id`: UUID (chave primária)
- `user_id`: UUID (referência para ocar_users)
- `type`: TEXT ('deposit', 'withdrawal', 'payment')
- `amount`: DECIMAL(10,2)
- `status`: TEXT ('pending', 'completed', 'failed', 'cancelled')
- `payment_method`: TEXT (opcional)
- `payment_id`: TEXT (opcional)
- `description`: TEXT (opcional)
- `created_at`, `updated_at`: TIMESTAMP

### ocar_vehicle_history
- `id`: UUID (chave primária)
- `placa`: TEXT (único)
- `status`: TEXT ('clean', 'issues', 'severe')
- `score`: INTEGER (0-100)
- `resumo`: TEXT
- `acidentes`, `multas`, `proprietarios`: INTEGER
- `leiloes`, `roubo_furto`: BOOLEAN
- `recomendacao`: TEXT
- `valor_fipe`, `valor_mercado`: DECIMAL(10,2)
- `variacao`: DECIMAL(5,2)
- `created_at`, `updated_at`: TIMESTAMP

## 4. Políticas RLS (Row Level Security)

Todas as tabelas têm RLS habilitado com as seguintes políticas:

- **ocar_usuarios**: Usuários podem ver e editar apenas seu próprio perfil
- **ocar_vehicles**: Qualquer um pode ver veículos ativos, usuários podem gerenciar seus próprios veículos
- **ocar_favorites**: Usuários podem gerenciar apenas seus próprios favoritos
- **ocar_likes**: Usuários podem gerenciar apenas suas próprias curtidas
- **ocar_messages**: Usuários podem ver apenas suas próprias mensagens
- **ocar_transactions**: Usuários podem ver apenas suas próprias transações
- **ocar_vehicle_history**: Público para leitura

## 5. Funções e Triggers

- **update_updated_at_column()**: Função que atualiza automaticamente o campo `updated_at`
- **increment_views(vehicle_id)**: Função para incrementar visualizações de veículos
- Triggers automáticos para `updated_at` em todas as tabelas relevantes

## 6. Próximos Passos

1. Execute os scripts SQL no Supabase
2. Configure as variáveis de ambiente
3. Teste a conexão executando `npm run dev`
4. Verifique se a autenticação está funcionando
5. Teste as funcionalidades de CRUD das tabelas

## 7. Notas Importantes

- A tabela `ocar_usuarios` já foi criada com uma estrutura mais completa
- O sistema de saldo foi removido da estrutura de usuários (pode ser implementado via transações)
- Todas as tabelas usam o prefixo `ocar_` para organização
- As políticas RLS garantem segurança dos dados
- Os índices foram criados para otimizar consultas frequentes
