"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Upload, Download, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"
import { REQUIRED_COLUMNS, stockData } from "./stock-data"

export function requestOpenImportDialog() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('estoque:openImportDialog'))
  }
}

export function downloadImportTemplate() {
  const header = [
    ['Instruções:'],
    ['- Não altere os nomes das colunas.'],
    ['- Use a aba Produtos para importar.'],
    ['- Colunas obrigatórias estão marcadas com *.'],
    [],
  ]
  const columns = [[
    'codigo*', 'nome*', 'categoria*', 'unidade*', 'estoqueMinimo*',
    'quantidade*', 'valorUnitario*', 'localizacao', 'fornecedor'
  ]]
  const sample = stockData.slice(0, 3).map(p => [
    p.codigo, p.nome, p.categoria, p.unidade, p.estoqueMinimo,
    p.quantidade, p.valorUnitario, p.localizacao, p.fornecedor
  ])

  const wsInfo = XLSX.utils.aoa_to_sheet(header)
  const wsProducts = XLSX.utils.aoa_to_sheet([...columns, ...sample])

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Produtos')
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Instrucoes')
  XLSX.writeFile(wb, 'modelo_importacao_estoque.xlsx')
}

export function ImportExportButtons() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [parseResult, setParseResult] = useState<{ ok: boolean; total?: number; erros?: string[] } | null>(null)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('estoque:openImportDialog', handler as EventListener)
    return () => window.removeEventListener('estoque:openImportDialog', handler as EventListener)
  }, [])

  const handleExport = () => {
    const rows = stockData.map(p => ({
      codigo: p.codigo,
      nome: p.nome,
      categoria: p.categoria,
      unidade: p.unidade,
      estoqueMinimo: p.estoqueMinimo,
      quantidade: p.quantidade,
      valorUnitario: p.valorUnitario,
      localizacao: p.localizacao,
      fornecedor: p.fornecedor,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos')
    // salvar via blob para melhor compatibilidade
    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'estoque_export.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const validateColumns = (cols: string[]) => {
    const required = new Set(REQUIRED_COLUMNS)
    const normalized = cols.map(c => c.trim())
    const missing = Array.from(required).filter(c => !normalized.includes(c))
    return missing
  }

  const handleFile = async (file: File) => {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf)
    const ws = wb.Sheets['Produtos'] || wb.Sheets[wb.SheetNames[0]]
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

    // Validação de tipos básicos
    const numericFields = ['estoqueMinimo', 'quantidade', 'valorUnitario']
    const errors: string[] = []
    const normalized = data.map((row, idx) => {
      const obj: Record<string, any> = { ...row }
      for (const f of numericFields) {
        const n = Number(String(obj[f]).replace(',', '.'))
        if (Number.isNaN(n)) {
          errors.push(`Linha ${idx + 2}: campo "${f}" inválido (valor: ${obj[f]})`)
        } else {
          obj[f] = n
        }
      }
      return obj
    })

    if (errors.length) {
      setParseResult({ ok: false, erros: errors })
      return
    }

    // TODO: integrar com Supabase (upsert em massa)
    setParseResult({ ok: true, total: normalized.length })
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
            <DialogTitle>Importar Produtos via Excel</DialogTitle>
            <DialogDescription>
              Baixe o modelo, preencha e envie a planilha na aba Produtos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" onClick={downloadImportTemplate} className="w-full justify-start">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Baixar modelo de importação
            </Button>
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium mb-2">Estrutura da planilha</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Aba obrigatória: <span className="font-mono">Produtos</span></li>
                <li>Colunas obrigatórias: <span className="font-mono">{REQUIRED_COLUMNS.join(', ')}</span></li>
                <li>Tipos: <span className="font-mono">estoqueMinimo</span>, <span className="font-mono">quantidade</span> e <span className="font-mono">valorUnitario</span> devem ser numéricos.</li>
                <li>Use ponto ou vírgula para decimais; ambos são aceitos.</li>
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
                  <p className="text-green-700">Arquivo válido. Registros encontrados: {parseResult.total}</p>
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

      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="w-4 h-4 mr-2" />
        Exportar
      </Button>
    </div>
  )
}


