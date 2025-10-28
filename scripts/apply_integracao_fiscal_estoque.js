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

    console.log('📄 Aplicando integração Fiscal → Estoque...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'setup-integracao-fiscal-estoque.sql'), 
      'utf8'
    )
    
    await client.query(sql)
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ INTEGRAÇÃO CRIADA COM SUCESSO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // Verificar função criada
    const checkFunc = await client.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname = 'processar_nota_para_estoque'
    `)
    
    if (checkFunc.rows.length > 0) {
      console.log('✓ Função processar_nota_para_estoque criada')
    }
    
    // Verificar trigger
    const checkTrigger = await client.query(`
      SELECT tgname 
      FROM pg_trigger 
      WHERE tgname = 'trg_processar_nota_entrada'
    `)
    
    if (checkTrigger.rows.length > 0) {
      console.log('✓ Trigger trg_processar_nota_entrada criado')
    }
    
    // Verificar tabela movimentacoes_estoque
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'movimentacoes_estoque'
    `)
    
    if (checkTable.rows.length > 0) {
      console.log('✓ Tabela movimentacoes_estoque criada')
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 COMO FUNCIONA:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('1. Importe ou crie uma nota fiscal de ENTRADA')
    console.log('2. Clique em "Processar" (muda status para Processada)')
    console.log('3. AUTOMATICAMENTE:')
    console.log('   - Produtos NOVOS são criados no estoque')
    console.log('   - Produtos EXISTENTES têm quantidade atualizada')
    console.log('   - Movimentação de estoque é registrada')
    console.log('   - estoque_minimo e localização ficam vazios')
    console.log('4. Acesse /dashboard/estoque para ver os produtos')
    console.log('5. Edite estoque_minimo e localização conforme necessário')
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 TESTE AGORA:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('1. Vá em /dashboard/fiscal')
    console.log('2. Importe um XML de nota de entrada')
    console.log('3. Clique em "Processar" na nota')
    console.log('4. Vá em /dashboard/estoque')
    console.log('5. Veja os produtos aparecerem! 🎉\n')

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

