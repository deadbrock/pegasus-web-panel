'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import * as XLSX from 'xlsx'
import { upsertCostsBulk, type CostRecord } from '@/services/costsService'
import { useToast } from '@/hooks/use-toast'

let openImportCostsDialog: (() => void) | null = null

export function requestOpenImportCostsDialog() {
  if (openImportCostsDialog) openImportCostsDialog()
}

const REQUIRED_COLUMNS = [
  'data',
  'categoria',
  'descricao',
  'valor',
  'responsavel',
  // opcionais: veiculo_id, observacoes, status
]

export function CostsImportExport({ onImported }: { onImported?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  openImportCostsDialog = () => setOpen(true)

  const close = () => setOpen(false)

  const downloadTemplate = () => {
    const instructions = [
      ['Instruções'],
      ['- Não altere os nomes das colunas da aba Dados'],
      ['- Datas no formato YYYY-MM-DD'],
      ['- Valor em número (use ponto para decimais)'],
      ['- status permitido: Pago, Pendente, Vencido (opcional)'],
    ]
    const dataRows = [
      ['data', 'categoria', 'descricao', 'valor', 'responsavel', 'veiculo_id', 'observacoes', 'status'],
      ['2025-01-15', 'Combustível', 'Abastecimento - Posto Shell', 450.8, 'Carlos Lima', '', 'Tanque cheio', 'Pago'],
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(instructions), 'Instruções')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dataRows), 'Dados')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_importacao_custos.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = async (rows: CostRecord[]) => {
    const ws = XLSX.utils.json_to_sheet(rows.map(r => ({
      data: (r.data instanceof Date ? r.data.toISOString().slice(0, 10) : new Date(r.data).toISOString().slice(0, 10)),
      categoria: r.categoria,
      descricao: r.descricao,
      valor: r.valor,
      responsavel: r.responsavel,
      veiculo_id: r.veiculo_id || '',
      observacoes: r.observacoes || '',
      status: r.status || '',
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Custos')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `custos_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = async (file: File) => {
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[1] || wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' })
      if (!json.length) throw new Error('Planilha vazia')
      const cols = Object.keys(json[0])
      for (const c of REQUIRED_COLUMNS) {
        if (!cols.includes(c)) throw new Error(`Coluna obrigatória ausente: ${c}`)
      }
      const rows: CostRecord[] = json.map((r) => ({
        data: r.data,
        categoria: String(r.categoria || ''),
        descricao: String(r.descricao || ''),
        valor: Number(r.valor || 0),
        responsavel: String(r.responsavel || ''),
        veiculo_id: r.veiculo_id ? String(r.veiculo_id) : null,
        observacoes: r.observacoes ? String(r.observacoes) : null,
        status: r.status ? String(r.status) : undefined,
      }))
      const count = await upsertCostsBulk(rows)
      toast({ title: 'Importação concluída', description: `${count} registros importados.` })
      setOpen(false)
      onImported?.()
    } catch (e: any) {
      toast({ title: 'Falha na importação', description: e.message || 'Erro ao processar o arquivo', variant: 'destructive' })
    }
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0]
        if (f) handleFile(f)
      }} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Custos via Excel</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Baixe o template, preencha e importe de volta.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadTemplate}>Baixar Template</Button>
              <Button onClick={() => fileInputRef.current?.click()}>Selecionar Arquivo</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


