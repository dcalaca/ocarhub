# Sistema Administrativo - Ocar Platform

## 🚀 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Senha do administrador (altere para uma senha segura)
ADMIN_PASSWORD=ocar2024admin

# Outras configurações
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Executar Script SQL

Execute o arquivo `insert-anuncio-plans.sql` no Supabase SQL Editor para inserir os planos de anúncios.

### 3. Acessar Painel Administrativo

1. Acesse: `http://localhost:3000/admin/login`
2. Use a senha configurada em `ADMIN_PASSWORD`
3. Gerencie os planos e configurações do sistema

## 🔐 Segurança

- A senha do administrador é armazenada como variável de ambiente
- Sessão administrativa expira em 24 horas
- Middleware protege rotas administrativas
- Logout automático em caso de sessão expirada

## 📊 Funcionalidades do Painel

### Gerenciamento de Planos
- ✅ Visualizar todos os planos (anúncios e consultas)
- ✅ Ativar/Desativar planos
- ✅ Editar planos (em desenvolvimento)
- ✅ Criar novos planos (em desenvolvimento)

### Estatísticas
- 📈 Relatórios de uso (em desenvolvimento)
- 👥 Gerenciamento de usuários (em desenvolvimento)

## 🛠️ Estrutura Técnica

### Arquivos Principais
- `lib/plans-service.ts` - Serviço para gerenciar planos
- `lib/admin-auth.ts` - Sistema de autenticação admin
- `app/admin/` - Páginas administrativas
- `middleware.ts` - Proteção de rotas

### Banco de Dados
- Tabela `planos` - Armazena todos os planos
- Campos: nome, tipo, preco, beneficios, limite_anuncios, etc.

## 🔄 Integração com Sistema de Anúncios

O sistema de anúncios agora:
- ✅ Busca planos dinamicamente do banco
- ✅ Valida limites baseados nos dados do banco
- ✅ Usa preços e durações configuráveis
- ✅ Suporta planos vitalícios (duracao_dias = NULL)

## 🚨 Próximos Passos

1. **CRUD Completo de Planos**
   - Formulário para criar/editar planos
   - Validação de dados
   - Upload de imagens para planos

2. **Relatórios Avançados**
   - Estatísticas de uso por plano
   - Receita por período
   - Análise de conversão

3. **Gerenciamento de Usuários**
   - Lista de usuários
   - Bloqueio/desbloqueio
   - Histórico de atividades

4. **Configurações do Sistema**
   - Configurações gerais
   - Limites globais
   - Manutenção do sistema
