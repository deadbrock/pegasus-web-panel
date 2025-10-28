const { Client } = require('pg')

async function main() {
  const connectionString = process.argv[2] || process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ Erro: Forneça a string de conexão do Supabase')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('📡 Conectando ao Supabase...')
    await client.connect()
    console.log('✅ Conectado!\n')

    // 1. Verificar se as tabelas existem
    console.log('1️⃣ VERIFICANDO TABELAS:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const tables = await client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('fornecedores', 'notas_fiscais', 'itens_nota_fiscal')
      ORDER BY table_name
    `)
    
    if (tables.rows.length === 0) {
      console.log('❌ NENHUMA TABELA ENCONTRADA!')
      console.log('Execute: node scripts/apply_notas_fiscais_sql.js "connection_string"')
      process.exit(1)
    }
    
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_schema}.${row.table_name}`)
    })

    // 2. Verificar colunas da tabela notas_fiscais
    console.log('\n2️⃣ COLUNAS DA TABELA notas_fiscais:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'notas_fiscais'
      ORDER BY ordinal_position
    `)
    
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name.padEnd(20)} ${col.data_type.padEnd(15)} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`)
    })

    // 3. Verificar RLS está habilitado
    console.log('\n3️⃣ ROW LEVEL SECURITY (RLS):')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const rls = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('fornecedores', 'notas_fiscais', 'itens_nota_fiscal')
    `)
    
    rls.rows.forEach(row => {
      console.log(`   ${row.tablename.padEnd(25)} RLS: ${row.rowsecurity ? '✓ Habilitado' : '✗ Desabilitado'}`)
    })

    // 4. Verificar políticas
    console.log('\n4️⃣ POLÍTICAS RLS:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const policies = await client.query(`
      SELECT 
        tablename, 
        policyname, 
        cmd,
        CASE 
          WHEN qual IS NULL THEN 'N/A'
          ELSE qual::text
        END as using_clause,
        CASE 
          WHEN with_check IS NULL THEN 'N/A'
          ELSE with_check::text
        END as with_check_clause
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('fornecedores', 'notas_fiscais', 'itens_nota_fiscal')
      ORDER BY tablename, cmd
    `)
    
    if (policies.rows.length === 0) {
      console.log('❌ NENHUMA POLÍTICA ENCONTRADA!')
      console.log('As políticas RLS são necessárias para o Supabase permitir acesso.')
    } else {
      const grouped = {}
      policies.rows.forEach(pol => {
        if (!grouped[pol.tablename]) grouped[pol.tablename] = []
        grouped[pol.tablename].push(pol)
      })
      
      Object.keys(grouped).forEach(table => {
        console.log(`\n   📋 ${table}:`)
        grouped[table].forEach(pol => {
          console.log(`      ${pol.cmd.padEnd(8)} ${pol.policyname}`)
          if (pol.using_clause !== 'N/A' && pol.using_clause !== 'true') {
            console.log(`              USING: ${pol.using_clause}`)
          }
        })
      })
    }

    // 5. Testar INSERT direto
    console.log('\n5️⃣ TESTE DE INSERÇÃO:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    try {
      await client.query('BEGIN')
      
      const testInsert = await client.query(`
        INSERT INTO public.notas_fiscais (
          numero, serie, chave_acesso, cnpj, razao_social, 
          data_emissao, valor_total, tipo_operacao, status
        ) VALUES (
          'TEST001', '1', 'TESTE_' || gen_random_uuid()::text, 
          '00.000.000/0000-00', 'Teste Diagnóstico',
          CURRENT_DATE, 1000.00, 'entrada', 'Pendente'
        )
        RETURNING id, numero
      `)
      
      await client.query('ROLLBACK')
      
      console.log(`   ✓ Inserção funcionou! ID: ${testInsert.rows[0].id}`)
      console.log('   (Rollback executado, dados não foram salvos)')
    } catch (error) {
      await client.query('ROLLBACK')
      console.log(`   ❌ Erro ao inserir: ${error.message}`)
    }

    // 6. Verificar exposição na API REST
    console.log('\n6️⃣ EXPOSIÇÃO NA API REST:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const apiTables = await client.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('fornecedores', 'notas_fiscais', 'itens_nota_fiscal')
    `)
    
    console.log('   Tabelas públicas detectadas:')
    apiTables.rows.forEach(row => {
      console.log(`   ✓ ${row.schemaname}.${row.tablename}`)
    })
    
    console.log('\n   ⚠️  IMPORTANTE: Se você ainda vê erros 404/406/400:')
    console.log('   1. Aguarde 10-30 segundos (Supabase atualiza cache da API)')
    console.log('   2. Limpe o cache do navegador (Ctrl+Shift+Delete)')
    console.log('   3. Faça hard reload (Ctrl+Shift+R)')
    console.log('   4. Verifique o Supabase Dashboard → Table Editor')

    // 7. Gerar comandos de teste
    console.log('\n7️⃣ COMANDOS DE TESTE:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\nTeste via SQL Editor do Supabase:')
    console.log('```sql')
    console.log('SELECT COUNT(*) FROM public.notas_fiscais;')
    console.log('SELECT * FROM public.notas_fiscais LIMIT 5;')
    console.log('```')
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ DIAGNÓSTICO CONCLUÍDO')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

