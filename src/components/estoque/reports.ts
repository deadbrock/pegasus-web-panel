"use client"

import * as XLSX from "xlsx"
import { stockData } from "./stock-data"

function saveWorkbook(filename: string, workbook: XLSX.WorkBook) {
  try {
    const data = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    // fallback
    // eslint-disable-next-line no-console
    console.error('Falha ao gerar XLSX, tentando fallback:', err)
    try {
      // Tenta método nativo da lib
      XLSX.writeFile(workbook, filename)
    } catch (err2) {
      // eslint-disable-next-line no-console
      console.error('Fallback também falhou:', err2)
    }
  }
}

function downloadWorkbook(filename: string, sheets: Array<{ name: string; rows: any[] }>) {
  const wb = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.rows)
    XLSX.utils.book_append_sheet(wb, ws, sheet.name)
  }
  saveWorkbook(filename, wb)
}

export function exportRelatorioEstoqueAtual() {
  const rows = stockData.map((p) => ({
    codigo: p.codigo,
    nome: p.nome,
    categoria: p.categoria,
    unidade: p.unidade,
    quantidade: p.quantidade,
    estoqueMinimo: p.estoqueMinimo,
    status: p.quantidade === 0 ? 'Sem Estoque' : p.quantidade <= p.estoqueMinimo ? 'Baixo' : 'OK',
    valorUnitario: p.valorUnitario,
    valorTotal: Number((p.quantidade * p.valorUnitario).toFixed(2)),
    localizacao: p.localizacao,
    fornecedor: p.fornecedor,
    ultimaMovimentacao: p.ultimaMovimentacao,
  }))
  downloadWorkbook('relatorio_estoque_atual.xlsx', [{ name: 'Estoque', rows }])
}

export function exportRelatorioProdutosCriticos() {
  const criticos = stockData.filter((p) => p.quantidade <= p.estoqueMinimo)
  const rows = criticos.map((p) => ({
    codigo: p.codigo,
    nome: p.nome,
    categoria: p.categoria,
    quantidade: p.quantidade,
    estoqueMinimo: p.estoqueMinimo,
    deficit: p.estoqueMinimo - p.quantidade,
    fornecedor: p.fornecedor,
    localizacao: p.localizacao,
  }))
  downloadWorkbook('relatorio_produtos_criticos.xlsx', [{ name: 'Criticos', rows }])
}

export function exportRelatorioValorizacaoEstoque() {
  const rows = stockData.map((p) => ({
    codigo: p.codigo,
    nome: p.nome,
    quantidade: p.quantidade,
    valorUnitario: p.valorUnitario,
    valorTotal: Number((p.quantidade * p.valorUnitario).toFixed(2)),
  }))
  const totalGeral = rows.reduce((acc, r) => acc + Number(r.valorTotal), 0)
  const resumo = [{ indicador: 'Valor Total do Estoque', valor: Number(totalGeral.toFixed(2)) }]
  downloadWorkbook('relatorio_valorizacao_estoque.xlsx', [
    { name: 'Valorizacao', rows },
    { name: 'Resumo', rows: resumo },
  ])
}

export function exportRelatorioAnaliseABC() {
  const rowsBase = stockData.map((p) => ({
    codigo: p.codigo,
    nome: p.nome,
    valorTotal: p.quantidade * p.valorUnitario,
  }))
  const ordenado = rowsBase.sort((a, b) => b.valorTotal - a.valorTotal)
  const total = ordenado.reduce((acc, x) => acc + x.valorTotal, 0)
  let acumulado = 0
  const rows = ordenado.map((x) => {
    acumulado += x.valorTotal
    const percAcum = total > 0 ? (acumulado / total) * 100 : 0
    const classe = percAcum <= 80 ? 'A' : percAcum <= 95 ? 'B' : 'C'
    return {
      codigo: x.codigo,
      nome: x.nome,
      valorTotal: Number(x.valorTotal.toFixed(2)),
      percentualAcumulado: Number(percAcum.toFixed(2)),
      classe,
    }
  })
  downloadWorkbook('relatorio_analise_abc.xlsx', [{ name: 'ABC', rows }])
}

export function exportRelatorioMovimentacoesTemplate() {
  // Template simples até termos a integração de movimentações
  const rows = [
    { data: 'AAAA-MM-DD', codigo: 'PRD001', quantidade: 0, tipo: 'entrada|saida', documento: 'ref' },
  ]
  downloadWorkbook('template_movimentacoes.xlsx', [{ name: 'Movimentacoes', rows }])
}


