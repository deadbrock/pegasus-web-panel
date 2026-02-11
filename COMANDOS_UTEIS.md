# 🛠️ Comandos Úteis - Gestão de Contratos e Supervisores

## 📊 Consultas SQL Úteis

### **Ver todos os contratos com supervisores**
```sql
SELECT 
  c.cliente,
  c.numero_contrato,
  c.valor_mensal_material,
  c.status,
  u.nome as supervisor_nome,
  u.email as supervisor_email,
  a.data_atribuicao
FROM contratos c
JOIN contratos_supervisores_atribuicao a ON c.id = a.contrato_id
JOIN users u ON a.supervisor_id = u.id
WHERE a.ativo = true
  AND c.status = 'Ativo'
ORDER BY c.cliente, u.nome;
```

### **Ver contratos de um supervisor específico**
```sql
-- Substitua 'email@supervisor.com' pelo email real
SELECT * FROM get_contratos_supervisor(
  (SELECT id FROM users WHERE email = 'email@supervisor.com')
);
```

### **Ver supervisores sem contratos atribuídos**
```sql
SELECT 
  u.nome,
  u.email,
  u.created_at as cadastrado_em
FROM users u
LEFT JOIN contratos_supervisores_atribuicao a ON u.id = a.supervisor_id AND a.ativo = true
WHERE u.role = 'supervisor'
  AND a.id IS NULL
ORDER BY u.nome;
```

### **Ver contratos sem supervisores**
```sql
SELECT 
  c.cliente,
  c.numero_contrato,
  c.status,
  c.data_inicio,
  c.data_fim
FROM contratos c
LEFT JOIN contratos_supervisores_atribuicao a ON c.id = a.contrato_id AND a.ativo = true
WHERE c.status = 'Ativo'
  AND a.id IS NULL
ORDER BY c.cliente;
```

### **Relatório de gastos por contrato (mês atual)**
```sql
SELECT 
  c.cliente,
  c.valor_mensal_material as teto_mensal,
  COUNT(ps.id) as total_pedidos,
  SUM(
    (SELECT COUNT(*) FROM itens_pedido_supervisor WHERE pedido_id = ps.id)
  ) as total_itens
FROM contratos c
LEFT JOIN pedidos_supervisores ps ON ps.contrato_id = c.id::text
WHERE DATE_TRUNC('month', ps.data_solicitacao) = DATE_TRUNC('month', CURRENT_DATE)
  AND ps.status NOT IN ('Cancelado', 'Rejeitado')
GROUP BY c.id, c.cliente, c.valor_mensal_material
ORDER BY total_pedidos DESC;
```

---

## 🔧 Operações Comuns

### **Atribuir supervisor a um contrato manualmente**
```sql
-- Substitua os UUIDs pelos valores reais
INSERT INTO contratos_supervisores_atribuicao (
  contrato_id, 
  supervisor_id, 
  ativo,
  atribuido_por
) VALUES (
  'UUID_DO_CONTRATO',
  'UUID_DO_SUPERVISOR',
  true,
  'UUID_DO_USUARIO_LOGISTICA'
);
```

### **Remover supervisor de um contrato**
```sql
-- Substitua os UUIDs pelos valores reais
UPDATE contratos_supervisores_atribuicao
SET ativo = false
WHERE contrato_id = 'UUID_DO_CONTRATO'
  AND supervisor_id = 'UUID_DO_SUPERVISOR';
```

### **Atualizar teto mensal de um contrato**
```sql
-- Substitua o UUID e o valor
UPDATE contratos
SET valor_mensal_material = 10000.00
WHERE id = 'UUID_DO_CONTRATO';
```

### **Listar todos os supervisores cadastrados**
```sql
SELECT 
  id,
  nome,
  email,
  created_at,
  (SELECT COUNT(*) 
   FROM contratos_supervisores_atribuicao 
   WHERE supervisor_id = users.id AND ativo = true
  ) as total_contratos
FROM users
WHERE role = 'supervisor'
ORDER BY nome;
```

---

## 🔍 Debug e Troubleshooting

### **Verificar se um supervisor pode ver um contrato**
```sql
-- Substitua os UUIDs
SELECT 
  c.cliente,
  a.ativo as atribuicao_ativa,
  c.status as status_contrato,
  u.nome as supervisor_nome
FROM contratos c
JOIN contratos_supervisores_atribuicao a ON c.id = a.contrato_id
JOIN users u ON a.supervisor_id = u.id
WHERE c.id = 'UUID_DO_CONTRATO'
  AND u.id = 'UUID_DO_SUPERVISOR';
```

### **Ver histórico de atribuições (incluindo desativadas)**
```sql
SELECT 
  c.cliente,
  u.nome as supervisor,
  a.ativo,
  a.data_atribuicao,
  a.updated_at as ultima_atualizacao,
  u2.nome as atribuido_por
FROM contratos_supervisores_atribuicao a
JOIN contratos c ON a.contrato_id = c.id
JOIN users u ON a.supervisor_id = u.id
LEFT JOIN users u2 ON a.atribuido_por = u2.id
WHERE c.id = 'UUID_DO_CONTRATO'
ORDER BY a.data_atribuicao DESC;
```

### **Ver configuração ativa de período de pedidos**
```sql
SELECT 
  nome,
  dia_inicio,
  dia_fim,
  dias_semana_permitidos,
  horario_inicio,
  horario_fim,
  requer_autorizacao_apos,
  permitir_urgentes,
  mensagem_bloqueio
FROM configuracoes_periodo_pedidos
WHERE ativo = true
ORDER BY created_at DESC
LIMIT 1;
```

---

## 🧹 Manutenção e Limpeza

### **Limpar atribuições duplicadas (manter a mais recente)**
```sql
WITH duplicatas AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY contrato_id, supervisor_id 
      ORDER BY data_atribuicao DESC
    ) as rn
  FROM contratos_supervisores_atribuicao
  WHERE ativo = true
)
UPDATE contratos_supervisores_atribuicao
SET ativo = false
WHERE id IN (
  SELECT id FROM duplicatas WHERE rn > 1
);
```

### **Ver pedidos sem contrato vinculado**
```sql
SELECT 
  numero_pedido,
  supervisor_nome,
  data_solicitacao,
  status
FROM pedidos_supervisores
WHERE contrato_id IS NULL
  OR contrato_id = ''
ORDER BY data_solicitacao DESC;
```

---

## 📈 Relatórios e Análises

### **Top 10 supervisores por quantidade de pedidos**
```sql
SELECT 
  supervisor_nome,
  supervisor_email,
  COUNT(*) as total_pedidos,
  COUNT(*) FILTER (WHERE status = 'Entregue') as pedidos_entregues,
  COUNT(*) FILTER (WHERE status = 'Pendente') as pedidos_pendentes
FROM pedidos_supervisores
WHERE data_solicitacao >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY supervisor_nome, supervisor_email
ORDER BY total_pedidos DESC
LIMIT 10;
```

### **Contratos próximos do vencimento (30 dias)**
```sql
SELECT 
  c.cliente,
  c.numero_contrato,
  c.data_fim,
  (c.data_fim - CURRENT_DATE) as dias_restantes,
  COUNT(a.id) FILTER (WHERE a.ativo = true) as total_supervisores
FROM contratos c
LEFT JOIN contratos_supervisores_atribuicao a ON c.id = a.contrato_id
WHERE c.status = 'Ativo'
  AND c.data_fim <= CURRENT_DATE + INTERVAL '30 days'
  AND c.data_fim >= CURRENT_DATE
GROUP BY c.id, c.cliente, c.numero_contrato, c.data_fim
ORDER BY c.data_fim ASC;
```

### **Pedidos por contrato (mês atual)**
```sql
SELECT 
  c.cliente,
  COUNT(ps.id) as total_pedidos,
  COUNT(*) FILTER (WHERE ps.status = 'Entregue') as entregues,
  COUNT(*) FILTER (WHERE ps.status = 'Pendente') as pendentes,
  c.valor_mensal_material as teto_mensal
FROM contratos c
LEFT JOIN pedidos_supervisores ps ON ps.contrato_id = c.id::text
  AND DATE_TRUNC('month', ps.data_solicitacao) = DATE_TRUNC('month', CURRENT_DATE)
WHERE c.status = 'Ativo'
GROUP BY c.id, c.cliente, c.valor_mensal_material
HAVING COUNT(ps.id) > 0
ORDER BY total_pedidos DESC;
```

---

## 🔐 Segurança e Auditoria

### **Ver quem atribuiu supervisores recentemente**
```sql
SELECT 
  c.cliente,
  u_supervisor.nome as supervisor,
  u_logistica.nome as atribuido_por,
  a.data_atribuicao,
  a.ativo
FROM contratos_supervisores_atribuicao a
JOIN contratos c ON a.contrato_id = c.id
JOIN users u_supervisor ON a.supervisor_id = u_supervisor.id
LEFT JOIN users u_logistica ON a.atribuido_por = u_logistica.id
WHERE a.data_atribuicao >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY a.data_atribuicao DESC;
```

### **Verificar mudanças de status em contratos**
```sql
-- Esta query mostra contratos que foram atualizados recentemente
SELECT 
  cliente,
  numero_contrato,
  status,
  updated_at,
  updated_at - created_at as tempo_ativo
FROM contratos
WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY updated_at DESC;
```

---

## 🚀 Testes Rápidos

### **Criar contrato de teste**
```sql
INSERT INTO contratos (
  numero_contrato,
  cliente,
  tipo,
  valor_total,
  valor_mensal_material,
  data_inicio,
  data_fim,
  status
) VALUES (
  'TESTE-001',
  'Cliente Teste',
  'Prestação de Serviço',
  60000.00,
  5000.00,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  'Ativo'
) RETURNING *;
```

### **Atribuir teste a supervisor**
```sql
-- Use o ID do contrato criado acima e um ID de supervisor válido
INSERT INTO contratos_supervisores_atribuicao (
  contrato_id,
  supervisor_id,
  ativo
) VALUES (
  'UUID_DO_CONTRATO_TESTE',
  (SELECT id FROM users WHERE role = 'supervisor' LIMIT 1),
  true
) RETURNING *;
```

### **Deletar dados de teste**
```sql
-- CUIDADO: Isso deleta permanentemente!
DELETE FROM contratos WHERE numero_contrato LIKE 'TESTE-%';
```

---

## 💡 Dicas

1. **Sempre use transações para operações críticas:**
   ```sql
   BEGIN;
   -- suas queries aqui
   COMMIT; -- ou ROLLBACK; se algo der errado
   ```

2. **Para exportar resultados para CSV:**
   ```sql
   \copy (SELECT * FROM contratos_com_supervisores) TO 'contratos.csv' CSV HEADER;
   ```

3. **Backup antes de alterações em massa:**
   ```bash
   pg_dump -U usuario -d banco -t contratos > contratos_backup.sql
   ```

4. **Monitorar performance:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM get_contratos_supervisor('UUID_SUPERVISOR');
   ```

---

## 📞 Suporte

Ao reportar problemas, sempre inclua:
1. Query SQL que estava executando
2. Mensagem de erro completa
3. Resultados das queries de verificação
4. Logs do console (se aplicável)

---

**Última atualização:** 10/02/2026
