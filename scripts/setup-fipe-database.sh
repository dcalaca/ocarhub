#!/bin/bash

# Script para configurar o banco de dados FIPE
# Execute: chmod +x scripts/setup-fipe-database.sh && ./scripts/setup-fipe-database.sh

echo "🚀 Configurando banco de dados FIPE..."

# Verificar se as variáveis de ambiente existem
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Variáveis de ambiente não encontradas!"
    echo "Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local"
    exit 1
fi

echo "✅ Variáveis de ambiente encontradas"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    echo "Instale o Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado"

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo "✅ Dependências verificadas"

# Executar verificação das tabelas
echo "🔍 Verificando tabelas..."
node scripts/check-fipe-tables.js

if [ $? -eq 0 ]; then
    echo "✅ Tabelas verificadas com sucesso"
else
    echo "❌ Erro ao verificar tabelas"
    echo "Execute o script SQL no Supabase primeiro: database/create-fipe-tables.sql"
    exit 1
fi

# Perguntar se quer popular com dados de teste
read -p "🤔 Deseja popular o banco com dados de teste? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📊 Populando banco com dados de teste..."
    node scripts/populate-fipe-database.js
    
    if [ $? -eq 0 ]; then
        echo "✅ Banco populado com sucesso!"
    else
        echo "❌ Erro ao popular o banco"
        exit 1
    fi
else
    echo "⏭️  Pulando população do banco"
fi

echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute o script SQL no Supabase: database/create-fipe-tables.sql"
echo "2. Execute: node scripts/populate-fipe-database.js"
echo "3. Execute: node scripts/check-fipe-tables.js"
echo "4. Teste a aplicação!"
