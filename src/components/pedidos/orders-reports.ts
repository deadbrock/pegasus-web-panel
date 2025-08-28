import * as XLSX from 'xlsx'
import { OrderRecord } from '@/services/ordersService'

export function exportRelatorioPedidos(pedidos: OrderRecord[]) {
  const rows = pedidos.map(p => ({
    id: p.id || '',
    numero: p.numero,
    cliente: p.cliente,
    telefone: p.telefone || '',
    endereco: p.endereco,
    cidade: p.cidade || '',
    estado: p.estado || '',
    cep: p.cep || '',
    data_pedido: p.data_pedido,
    data_entrega: p.data_entrega || '',
    status: p.status,
    motorista: p.motorista || '',
    veiculo: p.veiculo || '',
    forma_pagamento: p.forma_pagamento || '',
    observacoes: p.observacoes || '',
    observacao_rejeicao: p.observacao_rejeicao || '',
    valor_total: p.valor_total,
    itens_qtd: Array.isArray((p as any).itens) ? (p as any).itens.length : 0,
  }))
  const wsPedidos = XLSX.utils.json_to_sheet(rows)

  // Aba de itens
  const itensRows: any[] = []
  for (const p of pedidos) {
    let itens: any[] = (p as any).itens || []
    if (!Array.isArray(itens)) {
      try { itens = itens ? JSON.parse(itens as unknown as string) : [] } catch { itens = [] }
    }
    itens.forEach((it: any, idx: number) => {
      itensRows.push({
        pedido_numero: p.numero,
        item_index: idx + 1,
        produto: it.produto || '',
        quantidade: it.quantidade ?? '',
        valorUnitario: it.valorUnitario ?? '',
        valorTotal: it.valorTotal ?? '',
      })
    })
  }
  const wsItens = XLSX.utils.json_to_sheet(itensRows)

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsPedidos, 'Pedidos')
  XLSX.utils.book_append_sheet(wb, wsItens, 'Itens')
  const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'relatorio_pedidos.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportPerformanceEntrega(metrics: any[]) {
  const ws = XLSX.utils.json_to_sheet(metrics)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Performance')
  const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'performance_entrega.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportProdutosMaisPedidos(pedidos: OrderRecord[]) {
  const mapa: Record<string, number> = {}
  for (const p of pedidos) {
    let itens: any[] = (p as any).itens || []
    if (!Array.isArray(itens)) {
      try { itens = itens ? JSON.parse(itens as unknown as string) : [] } catch { itens = [] }
    }
    for (const it of itens) {
      const nome = it.produto || 'Produto'
      const qtd = Number(it.quantidade || 1)
      mapa[nome] = (mapa[nome] || 0) + qtd
    }
  }
  const rows = Object.entries(mapa)
    .map(([produto, quantidade]) => ({ produto, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Produtos Mais Pedidos')
  const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'produtos_mais_pedidos.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}


