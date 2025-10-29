#!/usr/bin/env node

const { Client } = require('pg')

const connectionString = process.argv[2]

if (!connectionString) {
  console.error('❌ Erro: Connection string não fornecida')
  console.log('\nUso:')
  console.log('  node check-pedido-mobile.js "sua-connection-string"')
  process.exit(1)
}

async function verificarPedidos() {
  const client = new Client({ connectionString })

  try {
    console.log('🔌 Conectando ao Supabase...')
    await client.connect()
    console.log('✅ Conectado!\n')

    // Buscar último pedido
    console.log('🔍 Buscando último pedido mobile...')
    const resPedido = await client.query(`
      SELECT 
        id,
        numero_pedido,
        supervisor_nome,
        contrato_id,
        contrato_nome,
        contrato_endereco,
        urgencia,
        status,
        data_solicitacao,
        data_atualizacao,
        created_at,
        updated_at
      FROM public.pedidos_supervisores 
      ORDER BY created_at DESC 
      LIMIT 1
    `)

    if (resPedido.rows.length === 0) {
      console.log('❌ Nenhum pedido encontrado!')
      return
    }

    const pedido = resPedido.rows[0]
    console.log('📦 ÚLTIMO PEDIDO:')
    console.log('─'.repeat(60))
    console.log(`ID: ${pedido.id}`)
    console.log(`Número: ${pedido.numero_pedido}`)
    console.log(`Supervisor: ${pedido.supervisor_nome}`)
    console.log(`Contrato ID: ${pedido.contrato_id || 'NULL'}`)
    console.log(`Contrato Nome: ${pedido.contrato_nome || 'NULL'}`)
    console.log(`Contrato Endereço: ${pedido.contrato_endereco || 'NULL'}`)
    console.log(`Urgência: ${pedido.urgencia}`)
    console.log(`Status: ${pedido.status}`)
    console.log(`\nDatas:`)
    console.log(`  data_solicitacao: ${pedido.data_solicitacao} (${typeof pedido.data_solicitacao})`)
    console.log(`  data_atualizacao: ${pedido.data_atualizacao} (${typeof pedido.data_atualizacao})`)
    console.log(`  created_at: ${pedido.created_at} (${typeof pedido.created_at})`)
    console.log(`  updated_at: ${pedido.updated_at} (${typeof pedido.updated_at})`)
    console.log('─'.repeat(60))

    // Buscar itens do pedido
    console.log('\n🛒 ITENS DO PEDIDO:')
    const resItens = await client.query(`
      SELECT 
        id,
        produto_codigo,
        produto_nome,
        quantidade,
        unidade
      FROM public.itens_pedido_supervisor 
      WHERE pedido_id = $1
    `, [pedido.id])

    if (resItens.rows.length === 0) {
      console.log('❌ Nenhum item encontrado!')
    } else {
      resItens.rows.forEach((item, index) => {
        console.log(`${index + 1}. ${item.produto_nome} - ${item.quantidade} ${item.unidade}`)
      })
    }

    // Verificar estrutura da tabela
    console.log('\n📋 VERIFICANDO ESTRUTURA DA TABELA:')
    const resColumns = await client.query(`
      SELECT 
        column_name, 
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'pedidos_supervisores' 
        AND column_name IN ('data_solicitacao', 'data_atualizacao', 'created_at', 'updated_at')
      ORDER BY column_name
    `)

    console.log('Colunas de data:')
    resColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      if (col.column_default) {
        console.log(`    default: ${col.column_default}`)
      }
    })

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
  } finally {
    await client.end()
  }
}

verificarPedidos()

