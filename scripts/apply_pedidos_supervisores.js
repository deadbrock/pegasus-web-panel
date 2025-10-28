const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

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
    console.log('🔗 Conectando ao Supabase...')
    await client.connect()
    console.log('✅ Conectado!\n')

    console.log('📄 Aplicando estrutura de pedidos de supervisores...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'setup-pedidos-supervisores.sql'), 
      'utf8'
    )
    
    await client.query(sql)
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ ESTRUTURA CRIADA COM SUCESSO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // Verificar tabelas criadas
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('pedidos_supervisores', 'itens_pedido_supervisor')
      ORDER BY table_name
    `)
    
    console.log('📊 TABELAS CRIADAS:')
    checkTables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`)
    })
    
    // Verificar função
    const checkFunc = await client.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname = 'pode_fazer_pedido_no_mes'
    `)
    
    console.log('\n⚙️  FUNÇÕES CRIADAS:')
    if (checkFunc.rows.length > 0) {
      console.log(`  ✓ pode_fazer_pedido_no_mes()`)
    }
    
    // Testar função
    console.log('\n🧪 TESTANDO FUNÇÃO:')
    const testFunc = await client.query(`
      SELECT * FROM pode_fazer_pedido_no_mes('00000000-0000-0000-0000-000000000000'::uuid)
    `)
    
    if (testFunc.rows.length > 0) {
      const result = testFunc.rows[0]
      console.log(`  ✓ Pode fazer pedido: ${result.pode_fazer}`)
      console.log(`  ✓ Total no mês: ${result.total_pedidos_mes}`)
      console.log(`  ✓ Requer autorização: ${result.requer_autorizacao}`)
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 PRONTO! O app mobile já pode criar pedidos!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
    console.error('\nDetalhes:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

