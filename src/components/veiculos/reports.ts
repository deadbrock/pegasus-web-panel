import * as XLSX from 'xlsx'
import { VehicleRecord } from '@/services/vehiclesService'

function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportRelatorioFrota(vehicles: VehicleRecord[]) {
  const rows = vehicles.map(v => ({
    Placa: v.placa,
    Marca: v.marca,
    Modelo: v.modelo,
    Tipo: v.tipo || '',
    Ano: v.ano || '',
    Cor: v.cor || '',
    Combustível: v.combustivel || '',
    Capacidade_kg: v.capacidade ?? '',
    KM_Total: v.kmTotal ?? '',
    Status: v.status || '',
    Chassi: v.chassi || '',
    RENAVAM: v.renavam || '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Frota')
  downloadWorkbook(wb, 'relatorio_frota.xlsx')
}

export function exportHistoricoKm(vehicles: VehicleRecord[]) {
  const rows = vehicles.map(v => ({
    Placa: v.placa,
    KM_Total: v.kmTotal ?? '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'KM')
  downloadWorkbook(wb, 'historico_km.xlsx')
}

export function exportCustosManutencaoTemplate() {
  const rows = [
    { Veiculo_ID: '', Placa: '', Data: '', Tipo: '', Descricao: '', Custo: '' },
  ]
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Custos')
  downloadWorkbook(wb, 'custos_manutencao_template.xlsx')
}

export function exportEficienciaCombustivelTemplate() {
  const rows = [
    { Placa: '', KM_Rodados: '', Litros: '', Media_km_l: '' },
  ]
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Consumo')
  downloadWorkbook(wb, 'eficiencia_combustivel_template.xlsx')
}

export function exportAgendaManutencoesTemplate() {
  const rows = [
    { Veiculo_ID: '', Placa: '', Data: '', Tipo: '', Responsavel: '', Observacoes: '' },
  ]
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Agenda')
  downloadWorkbook(wb, 'agenda_manutencoes_template.xlsx')
}


