# 🎯 GUIA MASTER - Implementação de Botões

## ✅ SERVICES 100% PRONTOS (14/14)

Todos os services foram criados e estão prontos para uso!

### Lista Completa de Services:
1. ✅ `metas-service.ts`
2. ✅ `vehiclesService.ts`
3. ✅ `driversService.ts`
4. ✅ `pedidos-service.ts`
5. ✅ `produtos-service.ts`
6. ✅ `custos-service.ts`
7. ✅ `manutencoes-service.ts`
8. ✅ `contratos-service.ts`
9. ✅ `documentos-service.ts`
10. ✅ `fornecedores-service.ts`
11. ✅ `notas-fiscais-service.ts`
12. ✅ `rastreamento-service.ts`
13. ✅ `auditoria-service.ts`
14. ✅ `relatorios-service.ts`

---

## 📋 PADRÃO DE IMPLEMENTAÇÃO

### Para CADA Módulo, implementar:

```typescript
// 1. IMPORTS
import { useToast } from '@/hooks/use-toast'
import { exportToJSON } from '@/lib/utils/export-helpers'
import { fetch[Modulo], create[Modulo], update[Modulo], delete[Modulo] } from '@/lib/services/[modulo]-service'

// 2. ESTADOS
const { toast } = useToast()
const [loading, setLoading] = useState(false)
const [items, setItems] = useState([])

// 3. CARREGAR DADOS
useEffect(() => {
  loadItems()
}, [])

const loadItems = async () => {
  setLoading(true)
  try {
    const data = await fetch[Modulo]()
    setItems(data)
  } catch (error) {
    toast({ title: 'Erro', description: 'Falha ao carregar', variant: 'destructive' })
  } finally {
    setLoading(false)
  }
}

// 4. BOTÃO EXPORTAR
const handleExport = () => {
  exportToJSON(items, 'nome-do-arquivo')
  toast({ title: 'Exportado!', description: 'Dados exportados com sucesso' })
}

// 5. BOTÃO NOVO
const handleNovo = () => {
  // Abrir dialog ou navegar
  setIsDialogOpen(true)
}

// 6. BOTÃO DELETAR
const handleDelete = async (id: string) => {
  if (!confirm('Deseja deletar?')) return
  
  try {
    await delete[Modulo](id)
    toast({ title: 'Deletado!', description: 'Item removido' })
    loadItems()
  } catch (error) {
    toast({ title: 'Erro', description: 'Falha ao deletar', variant: 'destructive' })
  }
}
```

---

## 🚀 IMPLEMENTAÇÃO POR MÓDULO

### 1. Motoristas ✅ (JÁ TEM SERVICE)
**Arquivo:** `src/app/dashboard/motoristas/page.tsx`
**Ações:**
- [x] Service já existe (`driversService.ts`)
- [ ] Adicionar botão Exportar com toast
- [ ] Conectar com loading states

### 2. Pedidos
**Arquivo:** `src/app/dashboard/pedidos/page.tsx`
**Service:** ✅ `pedidos-service.ts` PRONTO
**Ações:**
- [ ] Importar service
- [ ] Adicionar estados (loading, items)
- [ ] Implementar loadPedidos()
- [ ] Botão "Novo Pedido" → Dialog
- [ ] Botão "Exportar" → JSON
- [ ] Botão "Deletar" em cada linha

### 3. Estoque/Produtos
**Arquivo:** `src/app/dashboard/estoque/page.tsx`
**Service:** ✅ `produtos-service.ts` PRONTO
**Ações:**
- [ ] Importar service
- [ ] Carregar produtos
- [ ] Botão "Novo Produto"
- [ ] Botão "Exportar"
- [ ] Alertas de estoque baixo
- [ ] Botão "Deletar"

### 4. Custos
**Arquivo:** `src/app/dashboard/custos/page.tsx`
**Service:** ✅ `custos-service.ts` PRONTO
**Ações:**
- [ ] Importar service
- [ ] Carregar custos
- [ ] Botão "Novo Custo"
- [ ] Botão "Exportar"
- [ ] Botão "Importar OFX/CSV"
- [ ] Filtros por categoria

### 5. Manutenção
**Arquivo:** `src/app/dashboard/manutencao/page.tsx`
**Service:** ✅ `manutencoes-service.ts` PRONTO
**Ações:**
- [ ] Importar service
- [ ] Carregar manutenções
- [ ] Botão "Nova Manutenção"
- [ ] Botão "Exportar"
- [ ] Alertas de vencimento

### 6. Rastreamento
**Arquivo:** `src/app/dashboard/rastreamento/page.tsx`
**Service:** ✅ `rastreamento-service.ts` PRONTO
**Ações:**
- [ ] Importar service
- [ ] Carregar posições e alertas
- [ ] Atualização em tempo real
- [ ] Botão "Exportar"

### 7. Contratos
**Arquivo:** `src/app/dashboard/contratos/page.tsx`
**Service:** ✅ `contratos-service.ts` PRONTO
**Ações:**
- [ ] Importar service
- [ ] Carregar contratos
- [ ] Botão "Novo Contrato"
- [ ] Botão "Exportar"
- [ ] Alertas de renovação

### 8. Documentos
**Arquivo:** `src/app/dashboard/documentos/page.tsx`
**Service:** ✅ `documentos-service.ts` PRONTO
**Ações:**
- [ ] Importar service
- [ ] Carregar documentos
- [ ] Botão "Novo Documento"
- [ ] Upload de arquivos
- [ ] Botão "Exportar"
- [ ] Alertas de vencimento

### 9. Financeiro
**Arquivo:** `src/app/dashboard/financeiro/page.tsx`
**Services:** Usar `custos-service`, `contratos-service`
**Ações:**
- [ ] Dashboard financeiro
- [ ] Botão "Importar OFX"
- [ ] Botão "Exportar"
- [ ] Gráficos de fluxo de caixa

### 10. Fiscal
**Arquivo:** `src/app/dashboard/fiscal/page.tsx`
**Service:** ✅ `notas-fiscais-service.ts`, `fornecedores-service.ts` PRONTOS
**Ações:**
- [ ] Carregar notas fiscais
- [ ] Botão "Nova NF"
- [ ] Botão "Importar XML"
- [ ] Botão "Exportar"
- [ ] Relatórios fiscais

### 11. Auditoria
**Arquivo:** `src/app/dashboard/auditoria/page.tsx`
**Service:** ✅ `auditoria-service.ts` PRONTO
**Ações:**
- [ ] Carregar achados
- [ ] Botão "Novo Achado"
- [ ] Botão "Exportar"
- [ ] Dashboard de conformidade

### 12. Analytics
**Arquivo:** `src/app/dashboard/analytics/page.tsx`
**Actions:**
- [x] Já tem botão Exportar funcional
- [ ] Adicionar mais filtros
- [ ] Conectar com dados reais

### 13. Relatórios
**Arquivo:** `src/app/dashboard/relatorios/page.tsx`
**Service:** ✅ `relatorios-service.ts` PRONTO
**Ações:**
- [ ] Gerar relatórios diversos
- [ ] Exportar PDF/Excel
- [ ] Templates predefinidos

### 14-21. Módulos Menores
- Centro de Custos → Usar `custos-service`
- Data Hub → Agregação de dados
- Insights → Analytics
- Forecast → Previsões
- Radar → Alertas
- PegAI → IA (mock por enquanto)
- Gamificação → Sistema de pontos
- Configurações → Perfil e ajustes

---

## ⚡ ESTRATÉGIA DE IMPLEMENTAÇÃO

### Fase 1: Core (6 módulos) - 45 min
1. Pedidos
2. Estoque
3. Custos
4. Manutenção
5. Documentos
6. Contratos

### Fase 2: Especializados (5 módulos) - 30 min
7. Financeiro
8. Fiscal
9. Auditoria
10. Rastreamento
11. Relatórios

### Fase 3: Complementares (10 módulos) - 30 min
12-21. Ajustes finais e testes

---

## 📝 CHECKLIST FINAL

Para CADA módulo verificar:
- [ ] Service importado
- [ ] Loading state
- [ ] Empty state
- [ ] Botão Novo → Funcional
- [ ] Botão Exportar → Funcional
- [ ] Botão Deletar → Funcional
- [ ] Toasts de feedback
- [ ] Tratamento de erros
- [ ] Dados carregando do Supabase

---

## 🎯 RESULTADO ESPERADO

✅ 24/24 módulos com botões funcionais
✅ 100% integrado com Supabase
✅ Feedbacks visuais em todos
✅ Sistema completamente operacional

