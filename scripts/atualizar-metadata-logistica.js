/**
 * Script para atualizar o metadata dos usuários de logística
 * 
 * Adiciona name e role ao user_metadata para que o sistema
 * reconheça corretamente as permissões
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
  console.error('\n📌 ALTERNATIVA: Atualize o metadata manualmente no Supabase Dashboard');
  console.error('   Veja as instruções abaixo:\n');
  console.log('='.repeat(60));
  console.log('ATUALIZAR METADATA MANUALMENTE:');
  console.log('='.repeat(60));
  console.log('\n1. Acesse: https://supabase.com/dashboard');
  console.log('2. Vá em: Authentication > Users');
  console.log('3. Clique no usuário: logistica@fgservices.com.br');
  console.log('4. Na seção "User Metadata", clique em "Edit"');
  console.log('5. Cole este JSON:\n');
  console.log(JSON.stringify({ name: 'Eduardo', role: 'logistica' }, null, 2));
  console.log('\n6. Salve');
  console.log('7. Repita para: logistica-2@fgservices.com.br');
  console.log('   Usando este JSON:\n');
  console.log(JSON.stringify({ name: 'Emerson', role: 'logistica' }, null, 2));
  console.log('\n' + '='.repeat(60));
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
    metadata: {
      name: 'Eduardo',
      role: 'logistica'
    }
  },
  {
    email: 'logistica-2@fgservices.com.br',
    metadata: {
      name: 'Emerson',
      role: 'logistica'
    }
  }
];

async function atualizarMetadata() {
  console.log('🚀 Atualizando metadata dos usuários de logística...\n');

  let sucessos = 0;
  let erros = 0;

  for (const usuario of usuarios) {
    console.log(`📝 Processando: ${usuario.email}`);
    
    try {
      // Buscar usuário por email
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error(`   ❌ Erro ao listar usuários:`, listError.message);
        erros++;
        continue;
      }

      const existingUser = users.users?.find(u => u.email === usuario.email);
      
      if (!existingUser) {
        console.error(`   ❌ Usuário não encontrado: ${usuario.email}`);
        erros++;
        continue;
      }

      console.log(`   ℹ️  Usuário encontrado (ID: ${existingUser.id})`);
      console.log(`   📋 Metadata atual:`, JSON.stringify(existingUser.user_metadata, null, 2));
      
      // Atualizar metadata
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: usuario.metadata
        }
      );

      if (updateError) {
        console.error(`   ❌ Erro ao atualizar:`, updateError.message);
        erros++;
      } else {
        console.log(`   ✅ Metadata atualizado com sucesso!`);
        console.log(`   📋 Novo metadata:`, JSON.stringify(usuario.metadata, null, 2));
        sucessos++;
      }
    } catch (err) {
      console.error(`   ❌ Erro inesperado:`, err.message);
      erros++;
    }
    
    console.log('');
  }

  console.log('='.repeat(60));
  console.log(`📊 RESUMO DA ATUALIZAÇÃO`);
  console.log('='.repeat(60));
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Erros: ${erros}`);
  console.log('='.repeat(60));

  if (sucessos > 0) {
    console.log('\n🎉 METADATA ATUALIZADO COM SUCESSO!\n');
    console.log('🔄 PRÓXIMOS PASSOS:\n');
    console.log('1. Os usuários devem fazer LOGOUT');
    console.log('2. Limpar cache do navegador (Ctrl+Shift+Delete)');
    console.log('3. Fazer LOGIN novamente');
    console.log('4. Verificar que o role agora é "logistica"\n');
    console.log('📋 CREDENCIAIS:\n');
    usuarios.forEach((u, i) => {
      console.log(`👤 USUÁRIO ${i + 1}:`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Role: ${u.metadata.role}`);
      console.log(`   Nome: ${u.metadata.name}\n`);
    });
    console.log('='.repeat(60));
    console.log('\n✅ Agora o grupo FINANCEIRO mostrará APENAS:');
    console.log('   💰 FINANCEIRO');
    console.log('     └─ 🏢 Centro de Custos\n');
  }
}

atualizarMetadata();

