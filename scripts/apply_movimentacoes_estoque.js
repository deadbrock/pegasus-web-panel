// Script para criar tabela movimentacoes_estoque no Supabase
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applySQL() {
  try {
    console.log('📦 Lendo arquivo SQL...')
    const sqlPath = path.join(__dirname, 'setup-movimentacoes-estoque.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('🚀 Aplicando SQL no Supabase...')
    console.log('URL:', supabaseUrl)
    console.log('')

    // Executar SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Erro ao executar SQL:', error)
      
      // Tentar método alternativo: executar via REST API
      console.log('\n⚠️  Tentando método alternativo...')
      console.log('📝 Execute manualmente no SQL Editor do Supabase:')
      console.log('   https://supabase.com/dashboard/project/_/sql')
      console.log('')
      console.log('Ou copie o conteúdo de:')
      console.log(`   ${sqlPath}`)
      console.log('')
      
      process.exit(1)
    }

    console.log('✅ SQL aplicado com sucesso!')
    
    // Verificar se a tabela foi criada
    console.log('\n🔍 Verificando criação da tabela...')
    const { data: tableCheck, error: checkError } = await supabase
      .from('movimentacoes_estoque')
      .select('count')
      .limit(1)

    if (checkError) {
      console.log('⚠️  Aviso: Não foi possível verificar a tabela')
      console.log('Erro:', checkError.message)
    } else {
      console.log('✅ Tabela movimentacoes_estoque confirmada!')
    }

    // Contar registros
    const { count, error: countError } = await supabase
      .from('movimentacoes_estoque')
      .select('*', { count: 'exact', head: true })

    if (!countError) {
      console.log(`📊 Total de movimentações: ${count || 0}`)
    }

    console.log('\n✅ SETUP COMPLETO!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Acesse o módulo Estoque no painel')
    console.log('2. Navegue até a aba "Movimentações"')
    console.log('3. Atualize ou crie produtos para gerar movimentações')
    console.log('')

  } catch (err) {
    console.error('❌ Erro inesperado:', err)
    process.exit(1)
  }
}

// Executar
console.log('='.repeat(60))
console.log('🚀 SETUP: Tabela movimentacoes_estoque')
console.log('='.repeat(60))
console.log('')

applySQL()

