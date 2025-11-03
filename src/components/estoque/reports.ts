"use client"

import * as XLSX from "xlsx"
import { fetchProdutos } from '@/lib/services/produtos-service'
import { fetchMovimentacoes } from '@/lib/services/movimentacoes-service'
import { format } from 'date-fns'

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

export async function exportRelatorioEstoqueAtual() {
  try {
    const produtos = await fetchProdutos()
    const rows = produtos.map((p) => ({
      codigo: p.codigo,
      nome: p.nome,
      categoria: p.categoria,
      unidade: p.unidade,
      quantidade: p.estoque_atual,
      estoqueMinimo: p.estoque_minimo,
      estoqueMaximo: p.estoque_maximo || '-',
      status: p.estoque_atual === 0 ? 'Sem Estoque' : p.estoque_atual <= p.estoque_minimo ? 'Baixo' : 'OK',
      valorUnitario: p.preco_unitario || 0,
      valorTotal: Number((p.estoque_atual * (p.preco_unitario || 0)).toFixed(2)),
      localizacao: p.localizacao || '-',
      fornecedor: p.fornecedor || '-',
      lote: p.lote || '-',
      dataValidade: p.data_validade || '-',
      observacoes: p.observacoes || '-'
    }))
    downloadWorkbook('relatorio_estoque_atual.xlsx', [{ name: 'Estoque', rows }])
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    alert('Erro ao gerar relatório. Tente novamente.')
  }
}

export async function exportRelatorioProdutosCriticos() {
  try {
    const produtos = await fetchProdutos()
    const criticos = produtos.filter((p) => p.estoque_atual <= p.estoque_minimo)
    const rows = criticos.map((p) => ({
      codigo: p.codigo,
      nome: p.nome,
      categoria: p.categoria,
      quantidade: p.estoque_atual,
      estoqueMinimo: p.estoque_minimo,
      deficit: p.estoque_minimo - p.estoque_atual,
      valorUnitario: p.preco_unitario || 0,
      valorDeficit: Number(((p.estoque_minimo - p.estoque_atual) * (p.preco_unitario || 0)).toFixed(2)),
      fornecedor: p.fornecedor || '-',
      localizacao: p.localizacao || '-',
      status: p.estoque_atual === 0 ? 'CRÍTICO - SEM ESTOQUE' : 'BAIXO'
    }))
    
    // Calcular resumo
    const resumo = [{
      totalProdutosCriticos: criticos.length,
      valorTotalDeficit: Number(rows.reduce((acc, r) => acc + r.valorDeficit, 0).toFixed(2)),
      produtosSemEstoque: criticos.filter(p => p.estoque_atual === 0).length
    }]
    
    downloadWorkbook('relatorio_produtos_criticos.xlsx', [
      { name: 'Produtos Criticos', rows },
      { name: 'Resumo', rows: resumo }
    ])
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    alert('Erro ao gerar relatório. Tente novamente.')
  }
}

export async function exportRelatorioValorizacaoEstoque() {
  try {
    const produtos = await fetchProdutos()
    const rows = produtos.map((p) => ({
      codigo: p.codigo,
      nome: p.nome,
      categoria: p.categoria,
      quantidade: p.estoque_atual,
      unidade: p.unidade,
      valorUnitario: p.preco_unitario || 0,
      valorTotal: Number((p.estoque_atual * (p.preco_unitario || 0)).toFixed(2)),
    }))
    
    // Calcular resumo por categoria
    const porCategoria = produtos.reduce((acc, p) => {
      const cat = p.categoria || 'Sem Categoria'
      if (!acc[cat]) {
        acc[cat] = { categoria: cat, valorTotal: 0, quantidade: 0 }
      }
      acc[cat].valorTotal += p.estoque_atual * (p.preco_unitario || 0)
      acc[cat].quantidade += p.estoque_atual
      return acc
    }, {} as Record<string, any>)
    
    const resumoCategoria = Object.values(porCategoria).map((c: any) => ({
      categoria: c.categoria,
      quantidade: c.quantidade,
      valorTotal: Number(c.valorTotal.toFixed(2))
    }))
    
    const totalGeral = rows.reduce((acc, r) => acc + Number(r.valorTotal), 0)
    const resumoGeral = [{ 
      indicador: 'Valor Total do Estoque', 
      valor: Number(totalGeral.toFixed(2)),
      totalProdutos: produtos.length,
      quantidadeTotal: produtos.reduce((sum, p) => sum + p.estoque_atual, 0)
    }]
    
    downloadWorkbook('relatorio_valorizacao_estoque.xlsx', [
      { name: 'Valorizacao', rows },
      { name: 'Por Categoria', rows: resumoCategoria },
      { name: 'Resumo Geral', rows: resumoGeral },
    ])
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    alert('Erro ao gerar relatório. Tente novamente.')
  }
}

export async function exportRelatorioAnaliseABC() {
  try {
    const produtos = await fetchProdutos()
    const rowsBase = produtos.map((p) => ({
      codigo: p.codigo,
      nome: p.nome,
      categoria: p.categoria,
      valorTotal: p.estoque_atual * (p.preco_unitario || 0),
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
        categoria: x.categoria,
        valorTotal: Number(x.valorTotal.toFixed(2)),
        percentualAcumulado: Number(percAcum.toFixed(2)),
        classe,
      }
    })
    
    // Resumo por classe
    const resumo = [
      { 
        classe: 'A', 
        produtos: rows.filter(r => r.classe === 'A').length,
        percentual: '0-80%',
        descricao: 'Produtos de alta prioridade'
      },
      { 
        classe: 'B', 
        produtos: rows.filter(r => r.classe === 'B').length,
        percentual: '80-95%',
        descricao: 'Produtos de média prioridade'
      },
      { 
        classe: 'C', 
        produtos: rows.filter(r => r.classe === 'C').length,
        percentual: '95-100%',
        descricao: 'Produtos de baixa prioridade'
      },
    ]
    
    downloadWorkbook('relatorio_analise_abc.xlsx', [
      { name: 'Analise ABC', rows },
      { name: 'Resumo', rows: resumo }
    ])
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    alert('Erro ao gerar relatório. Tente novamente.')
  }
}

export async function exportRelatorioMovimentacoesTemplate() {
  try {
    const movimentacoes = await fetchMovimentacoes(500) // Últimas 500 movimentações
    
    if (movimentacoes.length === 0) {
      // Se não houver movimentações, criar template
      const rows = [
        { 
          data: format(new Date(), 'yyyy-MM-dd HH:mm'),
          codigo: 'EX: PRD001',
          produto: 'EXEMPLO',
          tipo: 'entrada|saida|ajuste|transferencia',
          quantidade: 0,
          estoqueAnterior: 0,
          estoqueNovo: 0,
          documento: 'NF-123456',
          motivo: 'Compra/Venda/Ajuste/Transferência'
        },
      ]
      downloadWorkbook('template_movimentacoes.xlsx', [{ name: 'Template', rows }])
    } else {
      // Exportar movimentações reais
      const rows = movimentacoes.map((m) => ({
        data: m.data_movimentacao || m.created_at 
          ? format(new Date(m.data_movimentacao || m.created_at!), 'yyyy-MM-dd HH:mm')
          : '-',
        codigo: m.produto?.codigo || '-',
        produto: m.produto?.nome || '-',
        tipo: m.tipo,
        quantidade: m.quantidade,
        estoqueAnterior: m.estoque_anterior || '-',
        estoqueNovo: m.estoque_novo || '-',
        documento: m.documento || '-',
        motivo: m.motivo || '-',
        usuario: m.usuario || '-'
      }))
      
      downloadWorkbook('relatorio_movimentacoes.xlsx', [{ name: 'Movimentacoes', rows }])
    }
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    alert('Erro ao gerar relatório. Tente novamente.')
  }
}

