const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Pegar a connection string dos argumentos ou variáveis de ambiente
const connectionString = process.argv[2] || process.env.DATABASE_URL

if (!connectionString) {
  console.error('\n❌ CONNECTION STRING NÃO FORNECIDA\n')
  console.log('Use uma das opções abaixo:\n')
  console.log('1. Passar como argumento:')
  console.log('   node apply_periodo_pedidos.js "postgresql://user:pass@host:5432/db"\n')
  console.log('2. Definir variável de ambiente:')
  console.log('   export DATABASE_URL="postgresql://user:pass@host:5432/db"')
  console.log('   node apply_periodo_pedidos.js\n')
  process.exit(1)
}

async function aplicarSQL() {
  const client = new Client({ connectionString })
  
  try {
    console.log('\n🔌 Conectando ao banco de dados...')
    await client.connect()
    console.log('✅ Conectado!\n')

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'setup-periodo-pedidos.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('📄 Executando setup-periodo-pedidos.sql...\n')
    
    // Executar o SQL
    await client.query(sql)
    
    console.log('\n✅ SCRIPT EXECUTADO COM SUCESSO!\n')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('  CONTROLE DE PERÍODO DE PEDIDOS CONFIGURADO')
    console.log('═══════════════════════════════════════════════════════════\n')
    console.log('📋 Tabela criada: log_periodo_pedidos')
    console.log('🔒 RLS configurado')
    console.log('📊 Função criada: relatorio_periodo_pedidos()\n')
    console.log('⚙️ CONFIGURAÇÃO DO APP:')
    console.log('   - Período: dia 15 a 23 de cada mês')
    console.log('   - Notificações: 2 dias antes do fim')
    console.log('   - Validação automática ao criar pedido\n')
    console.log('🧪 TESTAR:')
    console.log('   SELECT * FROM public.relatorio_periodo_pedidos();\n')
    console.log('═══════════════════════════════════════════════════════════\n')
    
  } catch (error) {
    console.error('\n❌ ERRO AO EXECUTAR SQL:\n')
    console.error(error.message)
    if (error.detail) {
      console.error('\nDetalhes:', error.detail)
    }
    if (error.hint) {
      console.error('\nDica:', error.hint)
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

aplicarSQL()

