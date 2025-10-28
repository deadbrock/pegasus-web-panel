const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function main() {
  const connectionString = process.argv[2] || process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ Erro: Forneça a string de conexão do Supabase')
    console.error('')
    console.error('Uso:')
    console.error('  node scripts/create_supervisor_user.js "sua-connection-string"')
    console.error('')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('🔗 Conectando ao Supabase...')
    await client.connect()
    console.log('✅ Conectado!\n')

    console.log('👤 Criando usuário supervisor...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'create-supervisor-user.sql'), 
      'utf8'
    )
    
    await client.query(sql)
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ USUÁRIO CRIADO COM SUCESSO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // Verificar usuário criado
    const result = await client.query(`
      SELECT 
        id,
        email,
        email_confirmed_at IS NOT NULL as email_confirmado,
        raw_user_meta_data->>'name' as nome,
        raw_user_meta_data->>'role' as role,
        created_at
      FROM auth.users
      WHERE email = 'supervisor@pegasus.com'
    `)
    
    if (result.rows.length > 0) {
      const user = result.rows[0]
      
      console.log('📋 INFORMAÇÕES DO USUÁRIO:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`  🆔 ID: ${user.id}`)
      console.log(`  📧 Email: ${user.email}`)
      console.log(`  🔒 Senha: supervisor123`)
      console.log(`  👤 Nome: ${user.nome}`)
      console.log(`  🎯 Role: ${user.role}`)
      console.log(`  ✅ Email Confirmado: ${user.email_confirmado ? 'Sim' : 'Não'}`)
      console.log(`  📅 Criado em: ${new Date(user.created_at).toLocaleString('pt-BR')}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      
      console.log('🎉 PRONTO PARA USAR NO APP MOBILE!')
      console.log('')
      console.log('📱 COMO FAZER LOGIN:')
      console.log('  1. Abra o app mobile')
      console.log('  2. Digite:')
      console.log('     Email: supervisor@pegasus.com')
      console.log('     Senha: supervisor123')
      console.log('  3. Clique em "Entrar no Sistema"')
      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    } else {
      console.log('⚠️  Usuário não encontrado após criação.')
    }

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
    
    if (error.message.includes('permission denied')) {
      console.error('\n💡 Dica: Você precisa de permissões de administrador para criar usuários.')
      console.error('   Tente usar a connection string com privilégios elevados.')
    }
    
    if (error.message.includes('auth.users')) {
      console.error('\n💡 Dica: A tabela auth.users pode não estar acessível.')
      console.error('   Considere criar o usuário via Supabase Dashboard:')
      console.error('   https://supabase.com/dashboard > Authentication > Users > Add User')
    }
    
    console.error('\nDetalhes completos:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

