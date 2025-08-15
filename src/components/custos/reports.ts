import * as XLSX from 'xlsx'
import type { CostRecord } from '@/services/costsService'

function downloadWorkbook(filename: string, sheets: Array<{ name: string; rows: any[] }>) {
  const wb = XLSX.utils.book_new()
  for (const s of sheets) {
    const ws = XLSX.utils.json_to_sheet(s.rows)
    XLSX.utils.book_append_sheet(wb, ws, s.name)
  }
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportRelatorioMensalCustos(rows: CostRecord[]) {
  const ordered = [...rows].sort((a, b) => (new Date(a.data).getTime() - new Date(b.data).getTime()))
  const plan = ordered.map(r => ({
    Data: new Date(r.data).toISOString().slice(0, 10),
    Categoria: r.categoria,
    Descricao: r.descricao,
    Valor: r.valor,
    Responsavel: r.responsavel,
    Veiculo: r.veiculo_id || '',
    Status: r.status || '',
  }))
  const total = plan.reduce((s, r) => s + (Number(r.Valor) || 0), 0)
  downloadWorkbook(`relatorio_custos_${new Date().toISOString().split('T')[0]}.xlsx`, [
    { name: 'Custos', rows: plan },
    { name: 'Resumo', rows: [{ Total: total }] },
  ])
}

export function exportCustosPorCategoria(rows: CostRecord[]) {
  const map = new Map<string, number>()
  for (const r of rows) {
    map.set(r.categoria || 'Outros', (map.get(r.categoria || 'Outros') || 0) + (r.valor || 0))
  }
  const plan = Array.from(map.entries()).map(([Categoria, Total]) => ({ Categoria, Total }))
  downloadWorkbook('custos_por_categoria.xlsx', [{ name: 'Categorias', rows: plan }])
}


