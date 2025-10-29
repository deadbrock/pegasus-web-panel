@echo off
chcp 65001 >nul
echo.
echo ================================================
echo   CONFIGURAÇÃO INTERATIVA - PEGASUS SUPERVISOR
echo ================================================
echo.
echo Este script vai criar o arquivo .env com suas
echo credenciais do Supabase.
echo.
echo ================================================
echo   PASSO 1: PEGAR CREDENCIAIS
echo ================================================
echo.
echo 1. Acesse: https://supabase.com/dashboard/project/moswhtqcgjcpsideykzw/settings/api
echo.
echo 2. Copie a chave "anon / public"
echo    (clique no botão de copiar ao lado da chave)
echo.
pause
echo.
echo ================================================
echo   PASSO 2: COLAR A CHAVE AQUI
echo ================================================
echo.
set /p ANON_KEY="Cole a chave anon/public e pressione ENTER: "
echo.

if "%ANON_KEY%"=="" (
    echo.
    echo ❌ ERRO: Você não colou nenhuma chave!
    echo.
    echo Tente novamente e cole a chave quando solicitado.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   PASSO 3: CRIANDO ARQUIVO .env
echo ================================================
echo.

(
echo # Configuracao do Supabase - Gerado automaticamente
echo EXPO_PUBLIC_SUPABASE_URL=https://moswhtqcgjcpsideykzw.supabase.co
echo EXPO_PUBLIC_SUPABASE_ANON_KEY=%ANON_KEY%
) > .env

echo ✅ Arquivo .env criado com sucesso!
echo.
echo Conteúdo:
type .env
echo.

echo ================================================
echo   PASSO 4: INICIANDO O APP
echo ================================================
echo.
echo Limpando cache e iniciando servidor Expo...
echo.

call npx expo start -c

pause

