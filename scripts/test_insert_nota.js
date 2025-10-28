const { Client } = require('pg')

async function main() {
  const connectionString = process.argv[2] || process.env.DATABASE_URL

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('🧪 Testando inserção de nota fiscal...\n')

    const result = await client.query(`
      INSERT INTO public.notas_fiscais (
        numero, serie, chave_acesso, cnpj, razao_social,
        data_emissao, valor_total, tipo_operacao, status
      ) VALUES (
        '000001', '1', 'TESTE_' || gen_random_uuid()::text,
        '12.345.678/0001-90', 'Empresa Teste LTDA',
        CURRENT_DATE, 1500.00, 'entrada', 'Pendente'
      )
      RETURNING id, numero, tipo_operacao, status, valor_total
    `)

    const nota = result.rows[0]
    
    console.log('✅ NOTA FISCAL CRIADA COM SUCESSO!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`ID:             ${nota.id}`)
    console.log(`Número:         ${nota.numero}`)
    console.log(`Tipo Operação:  ${nota.tipo_operacao}`)
    console.log(`Status:         ${nota.status}`)
    console.log(`Valor Total:    R$ ${parseFloat(nota.valor_total).toFixed(2)}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    console.log('🎉 O módulo fiscal está funcionando perfeitamente!')
    console.log('👉 Agora recarregue a página /dashboard/fiscal')
    console.log('👉 Faça Ctrl+Shift+R (hard reload)')
    console.log('👉 A nota deve aparecer na lista!\n')

  } catch (error) {
    console.error('❌ Erro ao criar nota:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

