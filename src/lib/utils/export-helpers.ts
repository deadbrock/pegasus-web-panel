/**
 * Helpers para exportação de dados
 */

/**
 * Exportar dados como JSON
 */
export function exportToJSON(data: any, filename: string) {
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exportar dados como CSV
 */
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  if (data.length === 0) {
    throw new Error('Nenhum dado para exportar')
  }

  // Usar headers fornecidos ou extrair do primeiro objeto
  const cols = headers || Object.keys(data[0])
  
  // Criar linhas do CSV
  const csvRows = [
    cols.join(','), // Header
    ...data.map(row => 
      cols.map(col => {
        const value = row[col]
        // Escapar valores que contêm vírgula ou aspas
        if (value === null || value === undefined) return ''
        const str = String(value)
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
      }).join(',')
    )
  ]

  const csvContent = csvRows.join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exportar dados como Excel (XLSX)
 */
export async function exportToExcel(data: any[], filename: string) {
  // Converter para CSV e baixar com extensão xlsx
  // Para uma solução mais robusta, use a biblioteca 'xlsx'
  exportToCSV(data, filename)
}

/**
 * Formatar moeda BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value)
}

/**
 * Formatar data
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

/**
 * Formatar data e hora
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR')
}

