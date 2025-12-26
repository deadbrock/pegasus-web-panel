#!/usr/bin/env node

/**
 * Script para configurar o logo do app automaticamente
 * Cria os assets necessários e atualiza o app.config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Configurando logo do Pegasus Supervisor...\n');

// Verificar se o logo existe
const logoPath = path.join(__dirname, 'assets', 'logo-pegasus-mobile.png');
const iconPath = path.join(__dirname, 'assets', 'icon.png');
const adaptiveIconPath = path.join(__dirname, 'assets', 'adaptive-icon.png');
const splashPath = path.join(__dirname, 'assets', 'splash.png');

if (!fs.existsSync(logoPath)) {
  console.error('❌ Erro: logo-pegasus-mobile.png não encontrado!');
  console.log('\n📂 Esperado em: mobile-supervisor/assets/logo-pegasus-mobile.png');
  console.log('\n📝 Instruções:');
  console.log('1. Copie o arquivo logo-pegasus-mobile.png');
  console.log('2. Cole em: mobile-supervisor/assets/');
  console.log('3. Execute este script novamente\n');
  process.exit(1);
}

console.log('✅ Logo encontrado: logo-pegasus-mobile.png');

// Copiar logo para icon.png (Expo vai redimensionar automaticamente)
try {
  fs.copyFileSync(logoPath, iconPath);
  console.log('✅ Criado: icon.png');
  
  fs.copyFileSync(logoPath, adaptiveIconPath);
  console.log('✅ Criado: adaptive-icon.png');
  
  fs.copyFileSync(logoPath, splashPath);
  console.log('✅ Criado: splash.png');
} catch (error) {
  console.error('❌ Erro ao copiar arquivos:', error.message);
  process.exit(1);
}

// Atualizar app.config.js
console.log('\n📝 Atualizando app.config.js...');

const configPath = path.join(__dirname, 'app.config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Atualizar referências do logo
configContent = configContent.replace(
  /icon: "\.\/assets\/logo-original\.png"/g,
  'icon: "./assets/icon.png"'
);

configContent = configContent.replace(
  /image: "\.\/assets\/logo-original\.png"/g,
  'image: "./assets/splash.png"'
);

configContent = configContent.replace(
  /foregroundImage: "\.\/assets\/logo-original\.png"/g,
  'foregroundImage: "./assets/adaptive-icon.png"'
);

fs.writeFileSync(configPath, configContent);
console.log('✅ app.config.js atualizado!');

console.log('\n🎉 Configuração concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Limpe o cache: npx expo start --clear');
console.log('2. Teste o app no emulador');
console.log('3. Verifique se o logo aparece corretamente');
console.log('4. Faça o build: eas build --platform android --profile production\n');

