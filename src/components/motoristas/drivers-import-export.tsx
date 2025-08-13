'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, Download, FileSpreadsheet, Save } from 'lucide-react'
import * as XLSX from 'xlsx'
import { upsertDriversBulk, DriverRecord } from '@/services/driversService'
import { useToast } from '@/hooks/use-toast'

export function downloadDriversTemplate() {
  const ws = XLSX.utils.json_to_sheet([
    { nome: 'João da Silva', cpf: '000.000.000-00', cnh: '12345678901', telefone: '(11) 90000-0000', email: 'email@dominio.com', endereco: 'Rua X, 123, SP', status: 'Ativo' },
  ])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Motoristas')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'motoristas_template.xlsx'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

interface DriversImportExportProps {
  onImported?: () => void
}

export function DriversImportExport({ onImported }: DriversImportExportProps) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<DriverRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFile = async (file: File) => {
    const data = await file.arrayBuffer()
    const wb = XLSX.read(data)
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json<any>(sheet)
    const mapped: DriverRecord[] = json.map((r) => ({
      nome: r.Nome || r.nome || '',
      cpf: r.CPF || r.cpf || '',
      cnh: (r.CNH || r.cnh || '').toString(),
      telefone: r.Telefone || r.telefone || null,
      email: r.Email || r.email || null,
      endereco: r.Endereco || r.endereco || null,
      status: (r.Status || r.status || 'Ativo') as any,
    }))
    setRows(mapped.filter(r => r.nome && r.cpf && r.cnh))
  }

  const handleImport = async () => {
    if (!rows.length) return
    setIsLoading(true)
    try {
      const res = await upsertDriversBulk(rows)
      toast({ title: 'Importação concluída', description: `${res.ok} registros importados` })
      setOpen(false)
      setRows([])
      onImported?.()
    } catch (e: any) {
      toast({ title: 'Erro na importação', description: e?.message || 'Falha ao importar' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Upload className="w-4 h-4 mr-2" /> Importar
        </Button>
        <Button variant="outline" size="sm" onClick={downloadDriversTemplate}>
          <Download className="w-4 h-4 mr-2" /> Template
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Importar Motoristas (XLSX)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block">
              <input type="file" accept=".xlsx,.xls" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
            </label>
            {rows.length > 0 && (
              <div className="text-sm text-gray-700">
                <div className="flex items-center gap-2 mb-2"><FileSpreadsheet className="w-4 h-4" /> {rows.length} linhas preparadas</div>
                <div className="max-h-40 overflow-auto border rounded p-2 bg-gray-50">
                  {rows.slice(0, 5).map((r, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 text-xs py-1 border-b last:border-b-0">
                      <span>{r.nome}</span>
                      <span>{r.cpf}</span>
                      <span>{r.cnh}</span>
                    </div>
                  ))}
                  {rows.length > 5 && <div className="text-xs text-gray-500 mt-1">... e mais {rows.length - 5} linhas</div>}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button disabled={!rows.length || isLoading} onClick={handleImport}>
                <Save className="w-4 h-4 mr-2" /> {isLoading ? 'Importando...' : 'Importar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


