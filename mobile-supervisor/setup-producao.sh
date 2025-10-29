#!/bin/bash

echo ""
echo "================================================"
echo "  CONFIGURACAO RAPIDA PARA PRODUCAO"
echo "  App Pegasus Supervisor"
echo "================================================"
echo ""

cd "$(dirname "$0")"

echo "[1/3] Criando arquivo .env..."
cat > .env << 'EOF'
# Configuracao do Supabase para producao
EXPO_PUBLIC_SUPABASE_URL=https://moswhtqcgjcpsideykzw.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vc3dodHFjZ2pjcHNpZGVreXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwODU0OTksImV4cCI6MjA0MzY2MTQ5OX0.PYlbZ_YfqWoX0D2xW9L-nQfJv1wfwJnX7cU_jGn7pxE
EOF

echo "[OK] Arquivo .env criado!"
echo ""

echo "[2/3] Limpando cache do Expo..."
npx expo start --clear

echo ""
echo "[3/3] PRONTO!"
echo ""
echo "================================================"
echo "  CONFIGURACAO CONCLUIDA!"
echo "================================================"
echo ""
echo "PROXIMO PASSO:"
echo "  1. Abra o app Expo Go no celular"
echo "  2. Escaneie o QR Code que apareceu acima"
echo "  3. O app funcionara em QUALQUER REDE!"
echo ""
echo "Login de teste:"
echo "  Email: supervisor@pegasus.com"
echo "  Senha: senha123"
echo ""
echo "================================================"

