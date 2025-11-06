"use client"

import * as XLSX from 'xlsx'
import { Manutencao } from '@/lib/services/manutencoes-service'

function saveWorkbook(filename: string, workbook: XLSX.WorkBook) {
  const data = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadMaintenanceReports(
  kind: 'mensal' | 'custo-por-veiculo' | 'historico' | 'preventivas-vencidas',
  manutencoes: Manutencao[] = []
) {
  const wb = XLSX.utils.book_new()

  if (kind === 'mensal') {
    const rows = manutencoes.map(m => ({
      veiculo: m.veiculo_placa || 'N/A',
      tipo: m.tipo,
      data: new Date(m.data_agendada).toLocaleDateString('pt-BR'),
      status: m.status,
      custo: m.custo || 0,
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Mensal')
    return saveWorkbook('relatorio_manutencoes_mensal.xlsx', wb)
  }

  if (kind === 'custo-por-veiculo') {
    const map = new Map<string, number>()
    for (const m of manutencoes) {
      const veiculo = m.veiculo_placa || 'N/A'
      map.set(veiculo, (map.get(veiculo) || 0) + (m.custo || 0))
    }
    const rows = Array.from(map.entries()).map(([veiculo, custoTotal]) => ({ 
      veiculo, 
      custoTotal: custoTotal.toFixed(2)
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Custos por Veiculo')
    return saveWorkbook('relatorio_custo_por_veiculo.xlsx', wb)
  }

  if (kind === 'historico') {
    const rows = manutencoes.map(m => ({
      veiculo: m.veiculo_placa || 'N/A',
      tipo: m.tipo,
      descricao: m.descricao,
      data_agendada: new Date(m.data_agendada).toLocaleDateString('pt-BR'),
      data_conclusao: m.data_conclusao ? new Date(m.data_conclusao).toLocaleDateString('pt-BR') : 'N/A',
      km: m.quilometragem,
      status: m.status,
      custo: m.custo || 0,
      responsavel: m.responsavel || 'N/A',
      oficina: m.oficina || 'N/A',
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Historico')
    return saveWorkbook('relatorio_historico_manutencoes.xlsx', wb)
  }

  if (kind === 'preventivas-vencidas') {
    const today = new Date()
    const rows = manutencoes
      .filter(m => 
        m.tipo === 'Preventiva' && 
        new Date(m.data_agendada) < today && 
        m.status !== 'Concluída'
      )
      .map(m => ({ 
        veiculo: m.veiculo_placa || 'N/A',
        data: new Date(m.data_agendada).toLocaleDateString('pt-BR'),
        status: m.status,
        descricao: m.descricao
      }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Preventivas Vencidas')
    return saveWorkbook('relatorio_preventivas_vencidas.xlsx', wb)
  }
}


