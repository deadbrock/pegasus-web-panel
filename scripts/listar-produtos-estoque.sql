-- ============================================================================
-- LISTAR TODOS OS PRODUTOS DO ESTOQUE
-- ============================================================================

-- Listar produtos com todas as informações
SELECT 
  codigo as "Código",
  nome as "Nome",
  categoria as "Categoria",
  unidade as "Unidade",
  estoque_atual as "Estoque Atual",
  estoque_minimo as "Mínimo",
  preco_unitario as "Preço Unit.",
  (estoque_atual * preco_unitario) as "Valor Total",
  localizacao as "Localização",
  fornecedor as "Fornecedor",
  CASE 
    WHEN estoque_atual = 0 THEN '❌ SEM ESTOQUE'
    WHEN estoque_atual <= estoque_minimo THEN '⚠️ BAIXO'
    ELSE '✅ OK'
  END as "Status",
  status as "Situação",
  created_at as "Cadastrado em"
FROM public.produtos
ORDER BY nome;

-- Resumo geral
SELECT 
  '📊 RESUMO GERAL' as "Seção",
  COUNT(*) as "Total de Produtos",
  SUM(estoque_atual) as "Quantidade Total",
  SUM(estoque_atual * preco_unitario) as "Valor Total do Estoque"
FROM public.produtos;

-- Por categoria
SELECT 
  '📦 POR CATEGORIA' as "Seção",
  categoria as "Categoria",
  COUNT(*) as "Produtos",
  SUM(estoque_atual) as "Quantidade",
  SUM(estoque_atual * preco_unitario) as "Valor Total"
FROM public.produtos
GROUP BY categoria
ORDER BY categoria;

-- Produtos com estoque
SELECT 
  '✅ COM ESTOQUE' as "Seção",
  COUNT(*) as "Total"
FROM public.produtos
WHERE estoque_atual > 0;

-- Produtos sem estoque
SELECT 
  '❌ SEM ESTOQUE' as "Seção",
  COUNT(*) as "Total"
FROM public.produtos
WHERE estoque_atual = 0;

-- Produtos abaixo do mínimo
SELECT 
  '⚠️ ABAIXO DO MÍNIMO' as "Seção",
  codigo as "Código",
  nome as "Nome",
  estoque_atual as "Atual",
  estoque_minimo as "Mínimo",
  (estoque_minimo - estoque_atual) as "Deficit"
FROM public.produtos
WHERE estoque_atual <= estoque_minimo
  AND estoque_atual >= 0
ORDER BY (estoque_minimo - estoque_atual) DESC;

