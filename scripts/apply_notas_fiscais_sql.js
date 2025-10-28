const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function main() {
  const connectionString = process.argv[2] || process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ Erro: Forneça a string de conexão do Supabase')
    console.error('Uso: node apply_notas_fiscais_sql.js "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"')
    console.error('Ou defina a variável de ambiente DATABASE_URL')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('📡 Conectando ao Supabase...')
    await client.connect()
    console.log('✅ Conectado com sucesso!')

    console.log('📄 Lendo arquivo SQL...')
    const sqlPath = path.join(__dirname, 'setup-notas-fiscais.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('⚙️  Executando script SQL...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const result = await client.query(sql)
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Script executado com sucesso!')
    
    // Verificar tabelas criadas
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('fornecedores', 'notas_fiscais', 'itens_nota_fiscal')
      ORDER BY table_name
    `)
    
    console.log('\n📊 Tabelas criadas:')
    checkTables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`)
    })
    
    // Verificar políticas RLS
    const checkPolicies = await client.query(`
      SELECT tablename, COUNT(*) as policy_count
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('fornecedores', 'notas_fiscais', 'itens_nota_fiscal')
      GROUP BY tablename
      ORDER BY tablename
    `)
    
    console.log('\n🔒 Políticas RLS:')
    checkPolicies.rows.forEach(row => {
      console.log(`   ✓ ${row.tablename}: ${row.policy_count} políticas`)
    })
    
    // Verificar fornecedores de exemplo
    const checkFornecedores = await client.query(`
      SELECT COUNT(*) as count FROM public.fornecedores
    `)
    
    console.log(`\n🏢 Fornecedores de exemplo: ${checkFornecedores.rows[0].count}`)
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 SETUP CONCLUÍDO COM SUCESSO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📝 Próximos passos:')
    console.log('   1. Acesse o painel web em /dashboard/fiscal')
    console.log('   2. Teste a importação de XML de NFe')
    console.log('   3. Crie notas fiscais manualmente')
    console.log('   4. Verifique as estatísticas no dashboard')
    console.log('\n✨ O módulo fiscal está pronto para uso!')
    
  } catch (error) {
    console.error('\n❌ Erro ao executar script:')
    console.error(error.message)
    if (error.code) {
      console.error(`Código do erro: ${error.code}`)
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

