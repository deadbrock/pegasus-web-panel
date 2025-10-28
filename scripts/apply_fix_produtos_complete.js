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

    console.log('🔧 Corrigindo estrutura completa da tabela produtos...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'fix-produtos-complete.sql'), 
      'utf8'
    )
    
    await client.query(sql)
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ ESTRUTURA CORRIGIDA COM SUCESSO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // Verificar colunas após correção
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'produtos' AND table_schema = 'public'
      ORDER BY ordinal_position
    `)
    
    console.log('📋 ESTRUTURA FINAL:')
    columns.rows.forEach((col, i) => {
      const nullable = col.is_nullable === 'YES' ? '(null)' : ''
      console.log(`  ${i + 1}. ${col.column_name} - ${col.data_type} ${nullable}`)
    })
    
    // Verificar índices
    const indexes = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'produtos' AND schemaname = 'public'
      ORDER BY indexname
    `)
    
    console.log('\n📊 ÍNDICES CRIADOS:')
    indexes.rows.forEach((idx, i) => {
      console.log(`  ${i + 1}. ${idx.indexname}`)
    })
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ MUDANÇAS APLICADAS:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('COLUNAS RENOMEADAS:')
    console.log('  • quantidade → estoque_atual')
    console.log('  • valor_unitario → preco_unitario')
    console.log('')
    console.log('COLUNAS ADICIONADAS:')
    console.log('  • estoque_maximo (numeric)')
    console.log('  • data_validade (date)')
    console.log('  • lote (text)')
    console.log('  • observacoes (text)')
    console.log('  • ativo (boolean)')
    console.log('')
    console.log('ÍNDICES CRIADOS:')
    console.log('  • idx_produtos_codigo')
    console.log('  • idx_produtos_categoria')
    console.log('  • idx_produtos_fornecedor')
    console.log('  • idx_produtos_estoque_baixo')
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 ERRO CORRIGIDO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Recarregue /dashboard/estoque para ver as mudanças!\n')

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
    console.error('\nDetalhes:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

