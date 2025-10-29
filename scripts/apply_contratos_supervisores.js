#!/usr/bin/env node

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const connectionString = process.argv[2]

if (!connectionString) {
  console.error('❌ Erro: Connection string não fornecida')
  console.log('\nUso:')
  console.log('  node apply_contratos_supervisores.js "postgresql://usuario:senha@host:porta/database"')
  console.log('\nExemplo:')
  console.log('  node apply_contratos_supervisores.js "postgresql://postgres:sua-senha@db.projeto.supabase.co:5432/postgres"')
  process.exit(1)
}

async function aplicarSQL() {
  const client = new Client({ connectionString })

  try {
    console.log('🔌 Conectando ao Supabase...')
    await client.connect()
    console.log('✅ Conectado com sucesso!\n')

    console.log('📄 Lendo arquivo SQL...')
    const sqlPath = path.join(__dirname, 'setup-contratos-supervisores.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    console.log('✅ Arquivo lido com sucesso!\n')

    console.log('🚀 Executando SQL...')
    console.log('─'.repeat(50))
    await client.query(sql)
    console.log('─'.repeat(50))
    console.log('✅ SQL executado com sucesso!\n')

    console.log('🔍 Verificando estrutura criada...')
    
    // Verificar tabela contratos_supervisores
    const resContratos = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'contratos_supervisores'
    `)
    
    if (resContratos.rows[0].count > 0) {
      console.log('  ✅ Tabela contratos_supervisores criada')
      
      // Contar registros
      const resCount = await client.query('SELECT COUNT(*) as total FROM public.contratos_supervisores')
      console.log(`  📊 Total de contratos: ${resCount.rows[0].total}`)
    } else {
      console.log('  ❌ Tabela contratos_supervisores NÃO foi criada')
    }

    // Verificar campos em pedidos_supervisores
    const resCampos = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pedidos_supervisores' 
        AND column_name IN ('contrato_id', 'contrato_nome', 'contrato_endereco')
    `)
    
    console.log('\n  📋 Campos adicionados em pedidos_supervisores:')
    resCampos.rows.forEach(row => {
      console.log(`    ✅ ${row.column_name}`)
    })

    // Verificar políticas RLS
    const resPolicies = await client.query(`
      SELECT policyname 
      FROM pg_policies 
      WHERE tablename = 'contratos_supervisores'
    `)
    
    console.log('\n  🔒 Políticas RLS criadas:')
    resPolicies.rows.forEach(row => {
      console.log(`    ✅ ${row.policyname}`)
    })

    console.log('\n' + '='.repeat(50))
    console.log('🎉 SETUP CONCLUÍDO COM SUCESSO!')
    console.log('='.repeat(50))
    console.log('\n📝 Próximos passos:')
    console.log('  1. Criar serviço de contratos no app mobile')
    console.log('  2. Criar tela de cadastro de contratos')
    console.log('  3. Adicionar seleção de contrato ao criar pedido')
    console.log('  4. Atualizar painel admin para mostrar dados do contrato\n')

  } catch (error) {
    console.error('\n❌ Erro ao executar SQL:')
    console.error(error.message)
    if (error.detail) console.error('Detalhes:', error.detail)
    if (error.hint) console.error('Dica:', error.hint)
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Conexão encerrada\n')
  }
}

aplicarSQL()

