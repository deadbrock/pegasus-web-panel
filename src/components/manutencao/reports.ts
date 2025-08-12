"use client"

import * as XLSX from 'xlsx'
import { maintenanceData } from './maintenance-table'

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

export function downloadMaintenanceReports(kind: 'mensal' | 'custo-por-veiculo' | 'historico' | 'preventivas-vencidas') {
  const wb = XLSX.utils.book_new()

  if (kind === 'mensal') {
    const rows = maintenanceData.map(m => ({
      veiculo: m.veiculo,
      tipo: m.tipo,
      data: m.dataAgendada,
      status: m.status,
      custo: m.custo,
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Mensal')
    return saveWorkbook('relatorio_manutencoes_mensal.xlsx', wb)
  }

  if (kind === 'custo-por-veiculo') {
    const map = new Map<string, number>()
    for (const m of maintenanceData) {
      map.set(m.veiculo, (map.get(m.veiculo) || 0) + (m.custo || 0))
    }
    const rows = Array.from(map.entries()).map(([veiculo, custoTotal]) => ({ veiculo, custoTotal }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Custos por Veiculo')
    return saveWorkbook('relatorio_custo_por_veiculo.xlsx', wb)
  }

  if (kind === 'historico') {
    const rows = maintenanceData.map(m => ({
      veiculo: m.veiculo,
      tipo: m.tipo,
      descricao: m.descricao,
      data: m.dataAgendada,
      km: m.quilometragem,
      status: m.status,
      custo: m.custo,
      responsavel: m.responsavel,
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Historico')
    return saveWorkbook('relatorio_historico_manutencoes.xlsx', wb)
  }

  if (kind === 'preventivas-vencidas') {
    const today = new Date()
    const rows = maintenanceData
      .filter(m => m.tipo === 'Preventiva' && new Date(m.dataAgendada) < today && m.status !== 'Concluída')
      .map(m => ({ veiculo: m.veiculo, data: m.dataAgendada, status: m.status }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Preventivas Vencidas')
    return saveWorkbook('relatorio_preventivas_vencidas.xlsx', wb)
  }
}


