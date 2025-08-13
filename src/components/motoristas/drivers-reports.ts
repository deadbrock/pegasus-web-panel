import * as XLSX from 'xlsx'
import { DriverRecord } from '@/services/driversService'

function download(wb: XLSX.WorkBook, filename: string) {
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

export function exportListaMotoristas(rows: DriverRecord[]) {
  const data = rows.map(d => ({
    Nome: d.nome,
    CPF: d.cpf,
    CNH: d.cnh,
    Telefone: d.telefone || '',
    Email: d.email || '',
    Endereco: d.endereco || '',
    Status: d.status || 'Ativo',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Motoristas')
  download(wb, 'lista_motoristas.xlsx')
}

export function exportCNHVencendo(rows: DriverRecord[]) {
  const soon = rows.filter((r: any) => {
    if (!r.validadeCnh) return false
    const diff = (new Date(r.validadeCnh).getTime() - Date.now()) / (1000*60*60*24)
    return diff >= 0 && diff <= 60
  })
  const ws = XLSX.utils.json_to_sheet(soon.map(r => ({ Nome: r.nome, CPF: r.cpf, CNH: r.cnh, Validade: r.validadeCnh })))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'CNH_Vencendo')
  download(wb, 'cnh_vencendo.xlsx')
}

export function exportDocumentosPendentesTemplate() {
  const ws = XLSX.utils.json_to_sheet([{ motorista_id: '', documento: '', validade: '', status: 'Pendente' }])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Docs')
  download(wb, 'documentos_pendentes_template.xlsx')
}


