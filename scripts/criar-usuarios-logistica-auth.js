/**
 * Script para criar usuários de logística no Supabase Auth
 * 
 * Este script cria os usuários diretamente no auth.users do Supabase
 * usando a API Admin, permitindo login via supabase.auth.signInWithPassword
 */

const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente manualmente
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('\nCertifique-se de que .env.local existe com:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n📌 ALTERNATIVA: Execute o SQL manualmente no Supabase Dashboard');
  console.error('   Veja o arquivo: CRIAR_USUARIOS_VIA_DASHBOARD.md');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const usuarios = [
  {
    email: 'logistica@fgservices.com.br',
    password: 'logisticadafg2026',
    name: 'Eduardo',
    role: 'logistica'
  },
  {
    email: 'logistica-2@fgservices.com.br',
    password: 'logisticadafgsegundo2026',
    name: 'Emerson',
    role: 'logistica'
  }
];

async function criarUsuarios() {
  console.log('🚀 Iniciando criação de usuários de logística...\n');
  console.log('📌 Usando Supabase Auth Admin API\n');

  let sucessos = 0;
  let erros = 0;

  for (const usuario of usuarios) {
    console.log(`\n📝 Criando usuário: ${usuario.name} (${usuario.email})`);
    
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: usuario.email,
        password: usuario.password,
        email_confirm: true,
        user_metadata: {
          name: usuario.name,
          role: usuario.role
        }
      });

      if (error) {
        // Se o usuário já existe, tentar atualizar
        if (error.message.includes('already') || error.message.includes('duplicate')) {
          console.log(`   ⚠️  Usuário já existe, tentando atualizar...`);
          
          // Buscar usuário existente
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users.users?.find(u => u.email === usuario.email);
          
          if (existingUser) {
            const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
              existingUser.id,
              {
                password: usuario.password,
                user_metadata: {
                  name: usuario.name,
                  role: usuario.role
                }
              }
            );

            if (updateError) {
              console.error(`   ❌ Erro ao atualizar:`, updateError.message);
              erros++;
            } else {
              console.log(`   ✅ Usuário atualizado com sucesso!`);
              console.log(`      - Email: ${usuario.email}`);
              console.log(`      - Nome: ${usuario.name}`);
              console.log(`      - Perfil: ${usuario.role}`);
              console.log(`      - Senha: ${usuario.password}`);
              sucessos++;
            }
          } else {
            console.error(`   ❌ Usuário não encontrado para atualização`);
            erros++;
          }
        } else {
          console.error(`   ❌ Erro:`, error.message);
          erros++;
        }
      } else {
        console.log(`   ✅ Usuário criado com sucesso!`);
        console.log(`      - Email: ${usuario.email}`);
        console.log(`      - Nome: ${usuario.name}`);
        console.log(`      - Perfil: ${usuario.role}`);
        console.log(`      - Senha: ${usuario.password}`);
        console.log(`      - ID: ${data.user?.id}`);
        sucessos++;
      }
    } catch (err) {
      console.error(`   ❌ Erro inesperado:`, err.message);
      erros++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 RESUMO DA CRIAÇÃO`);
  console.log('='.repeat(60));
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Erros: ${erros}`);
  console.log('='.repeat(60));

  if (sucessos > 0) {
    console.log('\n🎉 USUÁRIOS CRIADOS COM SUCESSO!\n');
    console.log('📋 CREDENCIAIS DE ACESSO:\n');
    usuarios.forEach((u, i) => {
      console.log(`👤 USUÁRIO ${i + 1}:`);
      console.log(`   Nome: ${u.name}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Senha: ${u.password}`);
      console.log(`   Perfil: ${u.role}\n`);
    });
    console.log('='.repeat(60));
    console.log('\n✅ PERMISSÕES DO PERFIL "LOGISTICA":\n');
    console.log('✅ PODE ACESSAR:');
    console.log('   🏠 Dashboard');
    console.log('   💼 OPERAÇÕES: Pedidos, Estoque, Contratos, Rastreamento');
    console.log('   💰 FINANCEIRO: Centro de Custos');
    console.log('   🚛 FROTA: Veículos, Motoristas, Manutenção');
    console.log('   📄 FISCAL: Fiscal, Documentos, Auditoria');
    console.log('   📈 ANÁLISE: Analytics, Relatórios, Data Hub, Forecast, Planejamento\n');
    console.log('❌ NÃO PODE ACESSAR:');
    console.log('   ❌ Financeiro (overview), Custos, Planejamento Financeiro');
    console.log('   ❌ Configurações e Administração\n');
    console.log('='.repeat(60));
    console.log('\n🧪 TESTE AGORA:');
    console.log('   1. Faça logout do painel');
    console.log('   2. Use as credenciais acima para fazer login');
    console.log('   3. Verifique que apenas módulos permitidos aparecem\n');
  }

  if (erros > 0) {
    console.log('\n⚠️  Alguns usuários não puderam ser criados.');
    console.log('   Verifique os erros acima e tente novamente.\n');
  }
}

criarUsuarios();

