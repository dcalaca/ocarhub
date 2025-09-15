@echo off
echo Configurando variaveis de ambiente para dados reais do Supabase...

echo.
echo Copiando arquivo de exemplo...
copy env.local.example .env.local

echo.
echo ✅ Arquivo .env.local criado com as credenciais do Supabase
echo.
echo ⚠️  IMPORTANTE: 
echo    1. Reinicie o servidor de desenvolvimento
echo    2. Todos os dados agora virao do Supabase
echo    3. Nao havera mais dados hardcoded
echo.
echo Para iniciar o servidor:
echo    npm run dev
echo.
pause
