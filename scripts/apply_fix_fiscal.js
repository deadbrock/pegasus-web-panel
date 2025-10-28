const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function main() {
  const connectionString = process.argv[2] || process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ Use a mesma string de conexão anterior')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('🔧 Aplicando correção de políticas RLS...\n')
    await client.connect()

    const sql = fs.readFileSync(path.join(__dirname, 'fix_fiscal_policies.sql'), 'utf8')
    await client.query(sql)

    console.log('✅ Políticas corrigidas com sucesso!\n')
    
    // Verificar
    const check = await client.query(`
      SELECT tablename, COUNT(*) as count
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('fornecedores', 'notas_fiscais', 'itens_nota_fiscal')
      GROUP BY tablename
    `)
    
    console.log('📊 Políticas por tabela:')
    check.rows.forEach(row => {
      console.log(`   ${row.tablename}: ${row.count} políticas`)
    })
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 PRÓXIMO PASSO:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('1. Limpe o cache do navegador (Ctrl+Shift+Delete)')
    console.log('2. Faça hard reload (Ctrl+Shift+R)')
    console.log('3. Aguarde 10 segundos')
    console.log('4. Tente novamente importar XML\n')

  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

