@echo off
echo ========================================
echo    CONFIGURAR VARIAVEIS DE AMBIENTE
echo ========================================
echo.
echo Este script vai ajudar voce a configurar o .env.local
echo.
echo 1. Acesse seu Supabase Dashboard
echo 2. Vá em Settings > API
echo 3. Copie as credenciais abaixo
echo.
echo ========================================
echo.

set /p SUPABASE_URL="Digite sua SUPABASE_URL: "
set /p SUPABASE_ANON_KEY="Digite sua SUPABASE_ANON_KEY: "
set /p SERVICE_ROLE_KEY="Digite sua SERVICE_ROLE_KEY: "

echo.
echo Criando arquivo .env.local...

(
echo # Supabase Configuration
echo NEXT_PUBLIC_SUPABASE_URL=%SUPABASE_URL%
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%
echo SUPABASE_SERVICE_ROLE_KEY=%SERVICE_ROLE_KEY%
echo.
echo # Payment Configuration ^(opcional^)
echo STRIPE_SECRET_KEY=your_stripe_secret_key
echo PAGARME_API_KEY=your_pagarme_api_key
echo PAGARME_WEBHOOK_SECRET=your_pagarme_webhook_secret
) > .env.local

echo.
echo ✅ Arquivo .env.local criado com sucesso!
echo.
echo Agora reinicie o servidor com: npm run dev
echo.
pause
