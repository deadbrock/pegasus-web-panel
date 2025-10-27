# Script de Limpeza e Reinstalação - Pegasus Supervisor App
# Execute com: .\limpar-e-reinstalar.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LIMPEZA E REINSTALAÇÃO DO APP MOBILE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta correta
$currentPath = Get-Location
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: Execute este script na pasta mobile-supervisor!" -ForegroundColor Red
    Write-Host "Comando: cd mobile-supervisor" -ForegroundColor Yellow
    exit 1
}

Write-Host "Etapa 1: Parando processos do Expo/Metro..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "Etapa 2: Removendo node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "OK - node_modules removido" -ForegroundColor Green
} else {
    Write-Host "OK - node_modules não existia" -ForegroundColor Green
}
Write-Host ""

Write-Host "Etapa 3: Removendo cache do Expo..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo" -ErrorAction SilentlyContinue
    Write-Host "OK - .expo removido" -ForegroundColor Green
} else {
    Write-Host "OK - .expo não existia" -ForegroundColor Green
}
Write-Host ""

Write-Host "Etapa 4: Removendo package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "OK - package-lock.json removido" -ForegroundColor Green
} else {
    Write-Host "OK - package-lock.json não existia" -ForegroundColor Green
}
Write-Host ""

Write-Host "Etapa 5: Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "Etapa 6: Verificando arquivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "OK - .env encontrado" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "EXPO_PUBLIC_SUPABASE_URL" -and $envContent -match "EXPO_PUBLIC_SUPABASE_ANON_KEY") {
        Write-Host "OK - Variáveis configuradas" -ForegroundColor Green
    } else {
        Write-Host "AVISO: .env existe mas pode estar incompleto" -ForegroundColor Yellow
    }
} else {
    Write-Host "AVISO: .env não encontrado!" -ForegroundColor Red
    Write-Host "Crie o arquivo .env com suas credenciais do Supabase" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Etapa 7: Reinstalando dependências..." -ForegroundColor Yellow
Write-Host "(Isso pode levar 2-5 minutos)" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Dependências instaladas com sucesso" -ForegroundColor Green
} else {
    Write-Host "ERRO: Falha ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  LIMPEZA CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Execute: npx expo start -c" -ForegroundColor White
Write-Host "2. Escaneie o QR code com o Expo Go" -ForegroundColor White
Write-Host "3. Aguarde o app carregar (pode levar 1-2 min na primeira vez)" -ForegroundColor White
Write-Host ""

$response = Read-Host "Deseja iniciar o servidor agora? (s/n)"
if ($response -eq "s" -or $response -eq "S" -or $response -eq "sim") {
    Write-Host ""
    Write-Host "Iniciando servidor Expo..." -ForegroundColor Cyan
    npx expo start -c
}

