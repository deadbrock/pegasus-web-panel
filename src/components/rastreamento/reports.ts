import * as XLSX from 'xlsx'

function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportRastreamentoVeiculos(rows: any[]) {
  const data = (rows || []).map((v) => ({
    Placa: v.placa,
    Marca: v.marca,
    Modelo: v.modelo,
    Tipo: v.tipo || '',
    Ano: v.ano || '',
    Cor: v.cor || '',
    Combustivel: v.combustivel || '',
    Capacidade_kg: v.capacidade ?? '',
    KM_Total: v.kmTotal ?? v.km_atual ?? '',
    Status: v.status || '',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Veiculos')
  downloadWorkbook(wb, 'rastreamento_veiculos.xlsx')
}

export function exportRastreamentoRotas(rows: any[]) {
  const data = (rows || []).map((r) => ({
    Data: r.data,
    Hora: r.hora,
    Veiculo: r.veiculo,
    Motorista: r.motorista,
    Origem: r.origem,
    Destino: r.destino,
    Distancia_km: r.distancia,
    Duracao: r.duracao,
    Status: r.status,
    Combustivel_L: r.combustivelGasto ?? '',
    VelocidadeMedia_kmh: r.velocidadeMedia ?? '',
    Paradas: r.paradas ?? '',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Rotas')
  downloadWorkbook(wb, 'rastreamento_rotas.xlsx')
}

export function exportRastreamentoKPIs(resumo: Record<string, any>) {
  const rows = Object.entries(resumo).map(([k, v]) => ({ Indicador: k, Valor: v }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'KPIs')
  downloadWorkbook(wb, 'rastreamento_kpis.xlsx')
}

export function exportTemplateImportPositions() {
  const rows = [
    {
      deviceId: 'imei-...',
      vehicleId: '',
      latitude: -23.55,
      longitude: -46.63,
      recordedAt: '2025-01-01T12:00:00Z',
      speedKmh: 0,
      heading: 0,
      accuracyM: 10,
      altitudeM: 760,
      battery: 80,
      event: 'gps',
    },
  ]
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Positions')
  downloadWorkbook(wb, 'template_import_positions.xlsx')
}


