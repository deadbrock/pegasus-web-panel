"use client"

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Upload, Download, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { upsertOrdersBulk, OrderRecord } from '@/services/ordersService'

export function OrdersImportExport() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [parseResult, setParseResult] = useState<{ ok: boolean; total?: number; erros?: string[] } | null>(null)

  const REQUIRED_COLUMNS = [
    'numero*','cliente*','endereco*','data_pedido*','status*','valor_total*',
    'telefone','cidade','estado','cep','data_entrega','motorista','veiculo','forma_pagamento','observacoes'
  ]

  const downloadTemplate = () => {
    const header = [
      ['Instruções:'],
      ['- Não altere os nomes das colunas.'],
      ['- Use a aba Pedidos para importar.'],
      ['- Colunas com * são obrigatórias.'],
      [],
    ]
    const columns = [[
      'numero*','cliente*','endereco*','data_pedido*','status*','valor_total*',
      'telefone','cidade','estado','cep','data_entrega','motorista','veiculo','forma_pagamento','observacoes'
    ]]
    const sample = [
      ['P-001001','João da Silva','Rua A, 123','2025-01-10','Pendente',123.45,'(11) 99999-0000','São Paulo','SP','01000-000','2025-01-12','','','','Entrega matinal']
    ]

    const wsInfo = XLSX.utils.aoa_to_sheet(header)
    const wsOrders = XLSX.utils.aoa_to_sheet([...columns, ...sample])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsOrders, 'Pedidos')
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Instrucoes')
    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo_importacao_pedidos.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportOrders = async (rows: OrderRecord[]) => {
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos')
    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pedidos_export.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const validateColumns = (cols: string[]) => {
    const required = REQUIRED_COLUMNS.filter(c => c.endsWith('*')).map(c => c.replace('*',''))
    const normalized = cols.map(c => c.trim())
    const missing = required.filter(c => !normalized.includes(c))
    return missing
  }

  const handleFile = async (file: File) => {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf)
    const ws = wb.Sheets['Pedidos'] || wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' })
    if (!data || data.length === 0) {
      setParseResult({ ok: false, erros: ['Planilha vazia'] })
      return
    }
    const missing = validateColumns(Object.keys(data[0]))
    if (missing.length > 0) {
      setParseResult({ ok: false, erros: [`Colunas obrigatórias ausentes: ${missing.join(', ')}`] })
      return
    }

    // Normalização básica
    const normalized: OrderRecord[] = data.map((row) => ({
      numero: String(row.numero).trim(),
      cliente: String(row.cliente).trim(),
      endereco: String(row.endereco).trim(),
      telefone: row.telefone || null,
      cidade: row.cidade || null,
      estado: row.estado || null,
      cep: row.cep || null,
      data_pedido: new Date(row.data_pedido).toISOString(),
      data_entrega: row.data_entrega ? new Date(row.data_entrega).toISOString() : null,
      status: (row.status || 'Pendente') as any,
      motorista: row.motorista || null,
      veiculo: row.veiculo || null,
      forma_pagamento: row.forma_pagamento || null,
      observacoes: row.observacoes || null,
      observacao_rejeicao: null,
      valor_total: Number(String(row.valor_total).replace(',','.')) || 0,
      itens: [],
    }))

    const result = await upsertOrdersBulk(normalized)
    setParseResult({ ok: result.fail === 0, total: result.ok, erros: result.fail ? ['Falha ao gravar no Supabase'] : [] })
  }

  return (
    <div className="flex gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Pedidos via Excel</DialogTitle>
            <DialogDescription>
              Baixe o modelo, preencha e envie a planilha na aba Pedidos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" onClick={downloadTemplate} className="w-full justify-start">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Baixar modelo de importação
            </Button>
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium mb-2">Estrutura da planilha</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Aba obrigatória: <span className="font-mono">Pedidos</span></li>
                <li>Colunas obrigatórias: <span className="font-mono">numero, cliente, endereco, data_pedido, status, valor_total</span></li>
              </ul>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            <Button onClick={() => inputRef.current?.click()} className="w-full">
              Selecionar arquivo
            </Button>
            {parseResult && (
              <div className="text-sm">
                {parseResult.ok ? (
                  <p className="text-green-700">Arquivo válido. Registros enviados: {parseResult.total}</p>
                ) : (
                  <ul className="list-disc ml-6 text-red-700">
                    {parseResult.erros?.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
            <Button onClick={() => setOpen(false)}>Concluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="sm" onClick={() => exportOrders([])}>
        <Download className="w-4 h-4 mr-2" />
        Exportar
      </Button>
    </div>
  )
}


