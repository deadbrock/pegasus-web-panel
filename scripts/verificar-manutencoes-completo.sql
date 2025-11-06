-- ============================================
-- VERIFICAÇÃO COMPLETA DA TABELA MANUTENCOES
-- ============================================

-- 1. Total de registros
SELECT 
  '📊 TOTAL DE REGISTROS' as info,
  COUNT(*) as total
FROM manutencoes;

-- 2. Estrutura da tabela (colunas esperadas pelo código)
SELECT 
  '📋 ESTRUTURA DA TABELA' as info,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name IN ('id', 'veiculo_id', 'tipo', 'descricao', 'data_agendada', 
                         'data_inicio', 'data_conclusao', 'quilometragem', 'status', 
                         'custo', 'responsavel', 'oficina', 'observacoes', 
                         'pecas_trocadas', 'created_at', 'updated_at') 
    THEN '✅ Esperada'
    ELSE '⚠️ Extra'
  END as status_coluna
FROM information_schema.columns
WHERE table_name = 'manutencoes'
ORDER BY ordinal_position;

-- 3. Verificar colunas obrigatórias
SELECT 
  '🔍 VERIFICAÇÃO DE COLUNAS OBRIGATÓRIAS' as info,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manutencoes' AND column_name='id') THEN '✅' ELSE '❌' END as id_existe,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manutencoes' AND column_name='veiculo_id') THEN '✅' ELSE '❌' END as veiculo_id_existe,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manutencoes' AND column_name='tipo') THEN '✅' ELSE '❌' END as tipo_existe,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manutencoes' AND column_name='descricao') THEN '✅' ELSE '❌' END as descricao_existe,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manutencoes' AND column_name='data_agendada') THEN '✅' ELSE '❌' END as data_agendada_existe,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manutencoes' AND column_name='quilometragem') THEN '✅' ELSE '❌' END as quilometragem_existe,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manutencoes' AND column_name='status') THEN '✅' ELSE '❌' END as status_existe,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manutencoes' AND column_name='custo') THEN '✅' ELSE '❌' END as custo_existe;

-- 4. Verificar índices
SELECT 
  '🔎 ÍNDICES' as info,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'manutencoes'
ORDER BY indexname;

-- 5. Sample dos dados (se houver)
SELECT 
  '📦 AMOSTRA DE DADOS (últimos 5 registros)' as info;

SELECT 
  id,
  veiculo_id,
  tipo,
  LEFT(descricao, 30) as descricao_resumo,
  data_agendada::date as data,
  status,
  custo,
  created_at::date as criado_em
FROM manutencoes
ORDER BY created_at DESC
LIMIT 5;

-- 6. Estatísticas por status
SELECT 
  '📈 ESTATÍSTICAS POR STATUS' as info,
  status,
  COUNT(*) as quantidade
FROM manutencoes
GROUP BY status
ORDER BY quantidade DESC;

-- 7. Estatísticas por tipo
SELECT 
  '🔧 ESTATÍSTICAS POR TIPO' as info,
  tipo,
  COUNT(*) as quantidade,
  SUM(custo)::numeric(10,2) as custo_total
FROM manutencoes
GROUP BY tipo
ORDER BY quantidade DESC;

-- 8. Verificar relação com veículos
SELECT 
  '🚚 VERIFICAÇÃO DE VEÍCULOS' as info,
  COUNT(DISTINCT m.veiculo_id) as veiculos_com_manutencao,
  (SELECT COUNT(*) FROM veiculos) as total_veiculos
FROM manutencoes m;

-- 9. Verificar se há manutenções sem veículo (dados órfãos)
SELECT 
  '⚠️ MANUTENÇÕES SEM VEÍCULO VÁLIDO' as info,
  COUNT(*) as total
FROM manutencoes m
WHERE NOT EXISTS (
  SELECT 1 FROM veiculos v WHERE v.id = m.veiculo_id
);

-- 10. RESUMO FINAL
SELECT 
  '✅ RESUMO FINAL' as info,
  (SELECT COUNT(*) FROM manutencoes) as total_manutencoes,
  (SELECT COUNT(*) FROM manutencoes WHERE status = 'Agendada') as agendadas,
  (SELECT COUNT(*) FROM manutencoes WHERE status = 'Em Andamento') as em_andamento,
  (SELECT COUNT(*) FROM manutencoes WHERE status = 'Concluída') as concluidas,
  (SELECT COUNT(*) FROM manutencoes WHERE status = 'Pendente') as pendentes,
  (SELECT COUNT(*) FROM manutencoes WHERE status = 'Atrasada') as atrasadas,
  (SELECT SUM(custo)::numeric(10,2) FROM manutencoes WHERE custo IS NOT NULL) as custo_total;

