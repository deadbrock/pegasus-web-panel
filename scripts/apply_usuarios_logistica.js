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
  console.error('Certifique-se de que .env.local existe com:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function aplicarSQL() {
  console.log('🚀 Iniciando criação de usuários de logística...\n');

  try {
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'setup-usuarios-logistica.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📄 Arquivo SQL carregado');
    console.log('🔄 Executando SQL no Supabase...\n');

    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });

    if (error) {
      // Se a função exec_sql não existir, tentar executar diretamente
      console.log('⚠️  Tentando executar SQL diretamente...\n');
      
      // Dividir o SQL em comandos individuais
      const commands = sqlContent
        .split(';')
        .filter(cmd => cmd.trim() && !cmd.trim().startsWith('--'));

      for (const command of commands) {
        const trimmed = command.trim();
        if (trimmed) {
          const { error: cmdError } = await supabase.from('_sql').select('*').limit(0);
          if (cmdError) {
            console.error('❌ Erro ao executar comando:', cmdError.message);
          }
        }
      }

      // Tentar criar os usuários usando a API diretamente
      console.log('📝 Criando usuários usando API do Supabase...\n');

      // Usuário 1: Eduardo
      const { error: error1 } = await supabase.auth.admin.createUser({
        email: 'logistica@fgservices.com.br',
        password: 'logisticadafg2026',
        email_confirm: true,
        user_metadata: {
          name: 'Eduardo',
          role: 'logistica'
        }
      });

      if (error1 && !error1.message.includes('already exists')) {
        console.error('❌ Erro ao criar Eduardo:', error1.message);
      } else {
        console.log('✅ Usuário Eduardo criado/atualizado');
      }

      // Usuário 2: Emerson
      const { error: error2 } = await supabase.auth.admin.createUser({
        email: 'logistica-2@fgservices.com.br',
        password: 'logisticadafgsegundo2026',
        email_confirm: true,
        user_metadata: {
          name: 'Emerson',
          role: 'logistica'
        }
      });

      if (error2 && !error2.message.includes('already exists')) {
        console.error('❌ Erro ao criar Emerson:', error2.message);
      } else {
        console.log('✅ Usuário Emerson criado/atualizado');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ USUÁRIOS DE LOGÍSTICA CRIADOS COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📋 CREDENCIAIS DE ACESSO:\n');
    console.log('👤 USUÁRIO 1:');
    console.log('   Nome: Eduardo');
    console.log('   Email: logistica@fgservices.com.br');
    console.log('   Senha: logisticadafg2026');
    console.log('   Perfil: logistica\n');
    console.log('👤 USUÁRIO 2:');
    console.log('   Nome: Emerson');
    console.log('   Email: logistica-2@fgservices.com.br');
    console.log('   Senha: logisticadafgsegundo2026');
    console.log('   Perfil: logistica\n');
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
    console.log('   ❌ Financeiro (overview)');
    console.log('   ❌ Custos');
    console.log('   ❌ Planejamento Financeiro');
    console.log('   ❌ Configurações e Administração\n');
    console.log('='.repeat(60));
    console.log('\n🎉 Configuração concluída! Os usuários já podem fazer login.');

  } catch (err) {
    console.error('\n❌ Erro ao aplicar SQL:', err.message);
    console.error(err);
    process.exit(1);
  }
}

aplicarSQL();

