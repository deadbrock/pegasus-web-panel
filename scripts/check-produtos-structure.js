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
    await client.connect()
    console.log('🔍 Verificando estrutura da tabela produtos...\n')

    // Verificar se tabela existe
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'produtos'
      );
    `)

    if (!checkTable.rows[0].exists) {
      console.log('❌ Tabela produtos NÃO EXISTE!')
      console.log('📝 Será necessário criar a tabela completa.\n')
      await client.end()
      return
    }

    console.log('✅ Tabela produtos existe!\n')

    // Listar todas as colunas
    const columns = await client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'produtos'
      ORDER BY ordinal_position;
    `)

    console.log('📋 COLUNAS ATUAIS:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    columns.rows.forEach((col, i) => {
      console.log(`${i + 1}. ${col.column_name}`)
      console.log(`   Tipo: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`)
      console.log(`   Nulo: ${col.is_nullable}`)
      console.log(`   Padrão: ${col.column_default || 'nenhum'}`)
      console.log('')
    })

    // Colunas esperadas pelo código
    const expectedColumns = [
      'id',
      'nome',
      'codigo',
      'categoria',
      'descricao',
      'unidade',
      'preco_unitario',
      'estoque_atual',
      'estoque_minimo',
      'estoque_maximo',
      'localizacao',
      'fornecedor',
      'data_validade',
      'lote',
      'status',
      'observacoes',
      'ativo',
      'created_at',
      'updated_at'
    ]

    const existingColumns = columns.rows.map(col => col.column_name)
    const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col))

    if (missingColumns.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('⚠️  COLUNAS FALTANDO:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      missingColumns.forEach((col, i) => {
        console.log(`${i + 1}. ${col}`)
      })
      console.log('')
    } else {
      console.log('✅ Todas as colunas necessárias existem!\n')
    }

    // Contar produtos
    const count = await client.query('SELECT COUNT(*) FROM public.produtos')
    console.log(`📊 Total de produtos: ${count.rows[0].count}\n`)

  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await client.end()
  }
}

main()

