"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Upload, Download, FileSpreadsheet, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"
import { REQUIRED_COLUMNS, OPTIONAL_COLUMNS, stockData } from "./stock-data"
import { createProduto } from "@/lib/services/produtos-service"
import { useToast } from "@/hooks/use-toast"

export function requestOpenImportDialog() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('estoque:openImportDialog'))
  }
}

export function downloadImportTemplate() {
  const header = [
    ['INSTRUÇÕES DE IMPORTAÇÃO'],
    [''],
    ['COLUNAS OBRIGATÓRIAS (não podem estar vazias):'],
    ['- codigo: Código único do produto'],
    ['- nome: Nome do produto'],
    ['- categoria: Categoria do produto (ex: Fixação, Lubrificantes)'],
    ['- unidade: Unidade de medida (ex: UN, KG, L, M)'],
    ['- estoque_minimo: Quantidade mínima em estoque (número)'],
    ['- estoque_atual: Quantidade atual em estoque (número)'],
    ['- preco_unitario: Preço unitário (número, use ponto ou vírgula para decimais)'],
    [''],
    ['COLUNAS OPCIONAIS:'],
    ['- localizacao: Localização física (ex: Prateleira A3, Galpão 2)'],
    ['- fornecedor: Nome do fornecedor'],
    ['- estoque_maximo: Quantidade máxima'],
    ['- descricao: Descrição detalhada do produto'],
    ['- lote: Número do lote'],
    ['- data_validade: Data de validade (formato: AAAA-MM-DD)'],
    ['- observacoes: Observações gerais'],
    [''],
    ['IMPORTANTE:'],
    ['- Não altere os nomes das colunas'],
    ['- Use a aba "Produtos" para colocar seus dados'],
    ['- Os produtos serão criados com status "Ativo"'],
    [],
  ]
  
  const columns = [[
    'codigo*', 'nome*', 'categoria*', 'unidade*', 'estoque_minimo*',
    'estoque_atual*', 'preco_unitario*', 'localizacao', 'fornecedor', 
    'estoque_maximo', 'descricao', 'lote', 'data_validade', 'observacoes'
  ]]
  
  const sample = [
    ['PRD001', 'Parafuso M6x20', 'Fixação', 'UN', 100, 850, 0.25, 'Prateleira A3', 'Parafusos ABC', 1000, 'Parafuso sextavado', '', '', ''],
    ['PRD002', 'Óleo Lubrificante 1L', 'Lubrificantes', 'L', 50, 45, 18.50, 'Setor C2', 'Petróleo XYZ', 200, '', '', '', ''],
    ['PRD003', 'Filtro de Ar', 'Filtros', 'UN', 25, 15, 45.90, 'Rack B1', 'Filtros Brasil', 100, '', '', '', ''],
  ]

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
  const [parseResult, setParseResult] = useState<{ ok: boolean; total?: number; erros?: string[]; importados?: number } | null>(null)
  const [importing, setImporting] = useState(false)
  const { toast } = useToast()

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
    setImporting(true)
    setParseResult(null)
    
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const ws = wb.Sheets['Produtos'] || wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' })
      
      if (!data || data.length === 0) {
        setParseResult({ ok: false, erros: ['Planilha vazia'] })
        setImporting(false)
        return
      }

      // Normalizar nomes das colunas (remover asteriscos e espaços)
      const normalizedData = data.map(row => {
        const newRow: Record<string, any> = {}
        for (const key in row) {
          const normalizedKey = key.replace(/\*/g, '').trim()
          newRow[normalizedKey] = row[key]
        }
        return newRow
      })

      const missing = validateColumns(Object.keys(normalizedData[0]))
      if (missing.length > 0) {
        setParseResult({ ok: false, erros: [`Colunas obrigatórias ausentes: ${missing.join(', ')}`] })
        setImporting(false)
        return
      }

      // Validação de tipos básicos
      const numericFields = ['estoque_minimo', 'estoque_atual', 'preco_unitario', 'estoque_maximo']
      const errors: string[] = []
      const normalized = normalizedData.map((row, idx) => {
        const obj: Record<string, any> = { ...row }
        for (const f of numericFields) {
          if (obj[f] !== '' && obj[f] !== null && obj[f] !== undefined) {
            const n = Number(String(obj[f]).replace(',', '.'))
            if (Number.isNaN(n)) {
              errors.push(`Linha ${idx + 2}: campo "${f}" inválido (valor: ${obj[f]})`)
            } else {
              obj[f] = n
            }
          }
        }
        return obj
      })

      if (errors.length) {
        setParseResult({ ok: false, erros: errors })
        setImporting(false)
        return
      }

      // Importar para o Supabase
      let importados = 0
      const errosImportacao: string[] = []
      
      for (let i = 0; i < normalized.length; i++) {
        const produto = normalized[i]
        try {
          await createProduto({
            codigo: produto.codigo,
            nome: produto.nome,
            descricao: produto.descricao || null,
            categoria: produto.categoria,
            unidade: produto.unidade,
            estoque_atual: produto.estoque_atual,
            estoque_minimo: produto.estoque_minimo,
            estoque_maximo: produto.estoque_maximo || null,
            preco_unitario: produto.preco_unitario,
            localizacao: produto.localizacao || null,
            fornecedor: produto.fornecedor || null,
            data_validade: produto.data_validade || null,
            lote: produto.lote || null,
            status: 'Ativo',
            observacoes: produto.observacoes || null,
            ativo: true
          })
          importados++
        } catch (error: any) {
          errosImportacao.push(`Linha ${i + 2} (${produto.codigo}): ${error.message}`)
        }
      }

      if (errosImportacao.length > 0) {
        setParseResult({ 
          ok: false, 
          total: normalized.length,
          importados,
          erros: errosImportacao 
        })
        toast({
          title: 'Importação parcial',
          description: `${importados} de ${normalized.length} produtos importados com sucesso.`,
          variant: 'default'
        })
      } else {
        setParseResult({ ok: true, total: normalized.length, importados })
        toast({
          title: 'Importação concluída!',
          description: `${importados} produto(s) importado(s) com sucesso.`,
        })
        
        // Recarregar página após 1 segundo
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error: any) {
      setParseResult({ ok: false, erros: [error.message || 'Erro ao processar arquivo'] })
      toast({
        title: 'Erro na importação',
        description: error.message || 'Erro ao processar arquivo',
        variant: 'destructive'
      })
    } finally {
      setImporting(false)
    }
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
            <div className="rounded-md border p-3 text-sm bg-blue-50">
              <p className="font-medium mb-2 text-blue-900">📋 Estrutura da planilha</p>
              <ul className="list-disc ml-6 space-y-1 text-blue-800">
                <li>Aba obrigatória: <span className="font-mono font-bold">Produtos</span></li>
                <li>Colunas obrigatórias: <span className="font-mono text-xs">{REQUIRED_COLUMNS.join(', ')}</span></li>
                <li>Colunas opcionais: <span className="font-mono text-xs">{OPTIONAL_COLUMNS.join(', ')}</span></li>
                <li>Campos numéricos: Use ponto ou vírgula para decimais (ex: 10.5 ou 10,5)</li>
                <li>Os produtos serão criados com status <span className="font-semibold">"Ativo"</span></li>
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
            {importing && (
              <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importando produtos para o banco de dados...</span>
              </div>
            )}
            
            {parseResult && (
              <div className="text-sm">
                {parseResult.ok ? (
                  <div className="text-green-700 bg-green-50 border border-green-200 rounded p-3">
                    <p className="font-semibold">✅ Importação concluída com sucesso!</p>
                    <p className="mt-1">
                      {parseResult.importados || parseResult.total} produto(s) importado(s)
                    </p>
                    <p className="mt-1 text-xs">A página será recarregada automaticamente...</p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    {parseResult.importados !== undefined && parseResult.importados > 0 && (
                      <p className="text-green-700 font-semibold mb-2">
                        ✅ {parseResult.importados} produto(s) importado(s) com sucesso
                      </p>
                    )}
                    <p className="text-red-700 font-semibold">❌ Erros encontrados:</p>
                    <ul className="list-disc ml-6 text-red-700 mt-1 max-h-48 overflow-y-auto">
                      {parseResult.erros?.map((e, i) => (
                        <li key={i} className="text-xs">{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setOpen(false)
              setParseResult(null)
            }} disabled={importing}>
              Fechar
            </Button>
            {parseResult?.ok && (
              <Button onClick={() => window.location.reload()} disabled={importing}>
                Recarregar Página
              </Button>
            )}
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


