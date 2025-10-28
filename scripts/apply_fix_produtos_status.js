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

    console.log('🔧 Adicionando coluna status na tabela produtos...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'fix-produtos-status.sql'), 
      'utf8'
    )
    
    await client.query(sql)
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ COLUNA STATUS ADICIONADA COM SUCESSO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // Verificar coluna criada
    const checkColumn = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'produtos' 
        AND column_name = 'status'
    `)
    
    if (checkColumn.rows.length > 0) {
      console.log('✓ Coluna status criada')
      console.log(`  Tipo: ${checkColumn.rows[0].data_type}`)
      console.log(`  Padrão: ${checkColumn.rows[0].column_default}`)
    }
    
    // Verificar índice
    const checkIndex = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'produtos' 
        AND indexname = 'idx_produtos_status'
    `)
    
    if (checkIndex.rows.length > 0) {
      console.log('✓ Índice idx_produtos_status criado')
    }
    
    // Contar produtos
    const countProducts = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Ativo') as ativos,
        COUNT(*) FILTER (WHERE status = 'Inativo') as inativos,
        COUNT(*) FILTER (WHERE status = 'Descontinuado') as descontinuados
      FROM public.produtos
    `)
    
    if (countProducts.rows.length > 0) {
      const stats = countProducts.rows[0]
      console.log('\n📊 Estatísticas:')
      console.log(`  Total de produtos: ${stats.total}`)
      console.log(`  Ativos: ${stats.ativos}`)
      console.log(`  Inativos: ${stats.inativos}`)
      console.log(`  Descontinuados: ${stats.descontinuados}`)
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 Erro corrigido! Recarregue a página /dashboard/estoque')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

