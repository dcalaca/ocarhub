@echo off
REM Script para configurar o banco de dados FIPE no Windows
REM Execute: scripts\setup-fipe-database.bat

echo 🚀 Configurando banco de dados FIPE...

REM Verificar se as variáveis de ambiente existem
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
    echo ❌ Variável NEXT_PUBLIC_SUPABASE_URL não encontrada!
    echo Certifique-se de que está definida no .env.local
    pause
    exit /b 1
)

if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
    echo ❌ Variável SUPABASE_SERVICE_ROLE_KEY não encontrada!
    echo Certifique-se de que está definida no .env.local
    pause
    exit /b 1
)

echo ✅ Variáveis de ambiente encontradas

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não está instalado!
    echo Instale o Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
)

echo ✅ Dependências verificadas

REM Executar verificação das tabelas
echo 🔍 Verificando tabelas...
node scripts/check-fipe-tables.js

if %errorlevel% equ 0 (
    echo ✅ Tabelas verificadas com sucesso
) else (
    echo ❌ Erro ao verificar tabelas
    echo Execute o script SQL no Supabase primeiro: database/create-fipe-tables.sql
    pause
    exit /b 1
)

REM Perguntar se quer popular com dados de teste
set /p populate="🤔 Deseja popular o banco com dados de teste? (y/n): "
if /i "%populate%"=="y" (
    echo 📊 Populando banco com dados de teste...
    node scripts/populate-fipe-database.js
    
    if %errorlevel% equ 0 (
        echo ✅ Banco populado com sucesso!
    ) else (
        echo ❌ Erro ao popular o banco
        pause
        exit /b 1
    )
) else (
    echo ⏭️  Pulando população do banco
)

echo 🎉 Configuração concluída!
echo.
echo 📋 Próximos passos:
echo 1. Execute o script SQL no Supabase: database/create-fipe-tables.sql
echo 2. Execute: node scripts/populate-fipe-database.js
echo 3. Execute: node scripts/check-fipe-tables.js
echo 4. Teste a aplicação!
echo.
pause
