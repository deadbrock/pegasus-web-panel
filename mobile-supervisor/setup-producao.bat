@echo off
echo.
echo ================================================
echo   CONFIGURACAO RAPIDA PARA PRODUCAO
echo   App Pegasus Supervisor
echo ================================================
echo.

cd /d "%~dp0"

echo [1/3] Criando arquivo .env...
(
echo # Configuracao do Supabase para producao
echo EXPO_PUBLIC_SUPABASE_URL=https://moswhtqcgjcpsideykzw.supabase.co
echo EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vc3dodHFjZ2pjcHNpZGV5a3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MzczMjIsImV4cCI6MjA2NjAxMzMyMn0.qqljvTvAzrheLJMOKpTtVHOWvmTQzm-UA5pp319nh28
) > .env

echo [OK] Arquivo .env criado!
echo.

echo [2/3] Limpando cache do Expo...
call npx expo start --clear
echo.

echo [3/3] PRONTO!
echo.
echo ================================================
echo   CONFIGURACAO CONCLUIDA!
echo ================================================
echo.
echo PROXIMO PASSO:
echo   1. Abra o app Expo Go no celular
echo   2. Escaneie o QR Code que apareceu acima
echo   3. O app funcionara em QUALQUER REDE!
echo.
echo Login de teste:
echo   Email: supervisor@pegasus.com
echo   Senha: senha123
echo.
echo ================================================
pause

