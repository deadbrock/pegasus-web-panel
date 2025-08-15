'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Upload, Download, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { upsertContractsBulk, type ContractRecord } from '@/services/contractsService'

export function ContractsImportExport({ onImported, rowsForExport }: { onImported?: () => void; rowsForExport?: ContractRecord[] }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)

  const downloadTemplate = () => {
    const wsInfo = XLSX.utils.aoa_to_sheet([
      ['Instruções:'],
      ['- Não altere os nomes das colunas.'],
      ['- Colunas com * são obrigatórias.'],
    ])
    const wsData = XLSX.utils.aoa_to_sheet([
      ['nome*','cnpj','cidade','estado','endereco','inicio_vigencia','fim_vigencia','status','responsavel'],
      ['Assaí Paulista','00.000.000/0000-00','São Paulo','SP','Rua A, 123','2025-01-01','2025-12-31','Ativo','Fulano'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsData, 'Contratos')
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Instrucoes')
    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo_importacao_contratos.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = async (file: File) => {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf)
    const ws = wb.Sheets['Contratos'] || wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' })
    if (!data.length) return
    const rows: ContractRecord[] = data.map(r => ({
      nome: String(r.nome).trim(),
      cnpj: r.cnpj || null,
      cidade: r.cidade || null,
      estado: r.estado || null,
      endereco: r.endereco || null,
      inicio_vigencia: r.inicio_vigencia ? new Date(r.inicio_vigencia).toISOString() : null,
      fim_vigencia: r.fim_vigencia ? new Date(r.fim_vigencia).toISOString() : null,
      status: (r.status || 'Ativo') as any,
      responsavel: r.responsavel || null,
    }))
    const count = await upsertContractsBulk(rows)
    setOpen(false)
    onImported?.()
  }

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet((rowsForExport || []).map(r => ({
      nome: r.nome,
      cnpj: r.cnpj || '',
      cidade: r.cidade || '',
      estado: r.estado || '',
      endereco: r.endereco || '',
      inicio_vigencia: r.inicio_vigencia || '',
      fim_vigencia: r.fim_vigencia || '',
      status: r.status || '',
      responsavel: r.responsavel || '',
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Contratos')
    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contratos_export.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Importar</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Contratos</DialogTitle>
            <DialogDescription>Baixe o modelo, preencha e importe.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button variant="outline" onClick={downloadTemplate} className="w-full justify-start"><FileSpreadsheet className="w-4 h-4 mr-2" />Baixar modelo</Button>
            <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            <Button onClick={() => inputRef.current?.click()} className="w-full">Selecionar arquivo</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Exportar</Button>
    </div>
  )
}


