'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye, Edit, ArrowUpRight, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchFindings, updateFinding, deleteFinding, upsertFindingsBulk, subscribeFindings, type AuditFindingRecord } from '@/services/auditoriaService'
import * as XLSX from 'xlsx'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRange } from 'react-day-picker'

// Dados agora vêm do Supabase (sem mocks)

export function AuditFindingsTable() {
  const [rows, setRows] = useState<AuditFindingRecord[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [severity, setSeverity] = useState<string>('all')
  const [area, setArea] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const load = async () => setRows(await fetchFindings({
    search,
    status: (status === 'all' ? undefined : (status as any)),
    severidade: (severity === 'all' ? undefined : (severity as any)),
    area: (area === 'all' ? undefined : area),
    from: dateRange?.from,
    to: dateRange?.to
  }))
  useEffect(() => { load() }, [])
  useEffect(() => { load() }, [search, status, severity, area, dateRange?.from?.toISOString?.(), dateRange?.to?.toISOString?.()])
  useEffect(() => subscribeFindings(load), [])

  const exportList = () => {
    const data = rows.map(r => ({
      Área: r.area,
      Descrição: r.descricao,
      Severidade: r.severidade,
      Status: r.status,
      'Primeira Ocorrência': r.data_criacao,
      'Última Ocorrência': r.data_ultima_ocorrencia
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, 'Apontamentos')
    XLSX.writeFile(wb, 'apontamentos_auditoria.xlsx')
  }
  useEffect(() => {
    const handler = () => exportList()
    window.addEventListener('auditoria:exportar-lista', handler as any)
    return () => window.removeEventListener('auditoria:exportar-lista', handler as any)
  }, [rows])

  const handleFile = async (file: File) => {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json<any>(ws)
    const parsed: AuditFindingRecord[] = json.map((row) => ({
      id: row.id,
      area: String(row.area || row.Área || ''),
      descricao: String(row.descricao || row.Descrição || ''),
      severidade: (row.severidade || row.Severidade || 'Média') as any,
      status: (row.status || row.Status || 'Pendente') as any,
      data_criacao: row.data_criacao || row['Primeira Ocorrência'] || new Date().toISOString(),
      data_ultima_ocorrencia: row.data_ultima_ocorrencia || row['Última Ocorrência'] || new Date().toISOString(),
      dados_referencia: row.dados_referencia ? JSON.parse(row.dados_referencia) : null
    }))
    await upsertFindingsBulk(parsed)
    load()
  }
  const getSeverityBadge = (severidade: string) => {
    switch (severidade) {
      case 'Crítica':
        return <Badge variant="destructive">Crítica</Badge>
      case 'Alta':
        return <Badge className="bg-orange-500">Alta</Badge>
      case 'Média':
        return <Badge className="bg-yellow-500">Média</Badge>
      case 'Baixa':
        return <Badge variant="outline">Baixa</Badge>
      default:
        return <Badge variant="secondary">Normal</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendente':
        return <Badge variant="outline" className="text-red-600 border-red-300">Pendente</Badge>
      case 'Em Análise':
        return <Badge className="bg-blue-500">Em Análise</Badge>
      case 'Resolvido':
        return <Badge className="bg-green-500">Resolvido</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'Manutenção':
        return '🔧'
      case 'Entregas':
        return '📦'
      case 'Custos':
        return '💰'
      case 'Estoque':
        return '📊'
      case 'Pedidos':
        return '📋'
      case 'Documentos':
        return '📄'
      case 'Rotas':
        return '🗺️'
      case 'Combustível':
        return '⛽'
      default:
        return '📌'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    return `${diffDays} dias atrás`
  }

  const handleAnalyze = (finding: any) => {
    console.log('Analisar apontamento:', finding)
  }

  const handleView = (finding: any) => {
    console.log('Visualizar detalhes:', finding)
  }

  const handleNavigate = (finding: any) => {
    console.log('Navegar para origem:', finding)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center gap-2">
                Área
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Entregas">Entregas</SelectItem>
                    <SelectItem value="Custos">Custos</SelectItem>
                    <SelectItem value="Estoque">Estoque</SelectItem>
                    <SelectItem value="Pedidos">Pedidos</SelectItem>
                    <SelectItem value="Documentos">Documentos</SelectItem>
                    <SelectItem value="Rotas">Rotas</SelectItem>
                    <SelectItem value="Combustível">Combustível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                Descrição do Apontamento
                <Input placeholder="Buscar..." className="h-8 w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                Severidade
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Crítica">Crítica</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                Status
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                    <SelectItem value="Resolvido">Resolvido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableHead>
            <TableHead>Primeira Ocorrência</TableHead>
            <TableHead>Última Ocorrência</TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2">
                Ações
                <input type="file" accept=".xlsx,.xls" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <Button variant="outline" size="sm" onClick={exportList}>Exportar Lista</Button>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((finding) => (
            <TableRow key={finding.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getAreaIcon(finding.area)}</span>
                  <span className="font-medium">{finding.area}</span>
                </div>
              </TableCell>
              
              <TableCell className="max-w-md">
                <p className="text-sm">{finding.descricao}</p>
                {finding.dados_referencia && (
                  <div className="flex gap-2 mt-1">
                    {Object.entries((finding as any).dados_referencia || {}).slice(0, 2).map(([key, value]) => (
                      <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                {getSeverityBadge(String(finding.severidade))}
              </TableCell>
              
              <TableCell>
                {getStatusBadge(String(finding.status))}
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <p>{formatDate(String(finding.data_criacao))}</p>
                  <p className="text-xs text-gray-500">{getDaysAgo(String(finding.data_criacao))}</p>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <p>{formatDate(String(finding.data_ultima_ocorrencia))}</p>
                  <p className="text-xs text-gray-500">{getDaysAgo(String(finding.data_ultima_ocorrencia))}</p>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(finding)}
                    title="Visualizar Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {String(finding.status) === 'Pendente' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => { await updateFinding(String(finding.id), { status: 'Em Análise' }); load() }}
                      title="Analisar"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {String(finding.status) !== 'Resolvido' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => { await updateFinding(String(finding.id), { status: 'Resolvido' }); load() }}
                      title="Marcar como Resolvido"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => { if (confirm('Excluir apontamento?')) { await deleteFinding(String(finding.id)); load() } }}
                    title="Excluir"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate(finding)}
                    title="Ir para Origem"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Resumo na parte inferior */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-gray-600">
              Total: {rows.length} apontamentos
            </span>
            <span className="text-red-600">
              Críticos: {rows.filter(f => f.severidade === 'Crítica').length}
            </span>
            <span className="text-orange-600">
              Alta: {rows.filter(f => f.severidade === 'Alta').length}
            </span>
            <span className="text-yellow-600">
              Média: {rows.filter(f => f.severidade === 'Média').length}
            </span>
            <span className="text-blue-600">
              Em Análise: {rows.filter(f => f.status === 'Em Análise').length}
            </span>
            <span className="text-green-600">
              Resolvidos: {rows.filter(f => f.status === 'Resolvido').length}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {typeof window !== 'undefined' ? `Última atualização: ${new Date().toLocaleString('pt-BR')}` : null}
          </div>
        </div>
      </div>
    </div>
  )
}