"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building2, MapPin, Search, Edit, Trash2, Loader2, FileX, X } from 'lucide-react'
import { fetchContracts, deleteContract, type ContractRecord } from '@/services/contractsService'
import { ContractsImportExport } from '@/components/contratos/contracts-import-export'
import { ContractDialog } from '@/components/contratos/contract-dialog'

type StatusFilter = 'Todos' | 'Ativo' | 'Suspenso' | 'Encerrado'

export default function ContratosPage() {
  const [allContracts, setAllContracts] = useState<ContractRecord[]>([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ContractRecord | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadAll = async () => {
    setLoading(true)
    try {
      const data = await fetchContracts()
      setAllContracts(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  // Filtragem feita no cliente — instantânea e sem closure issues
  const filtered = allContracts.filter((c) => {
    const term = search.trim().toLowerCase()
    const matchSearch =
      !term ||
      c.nome?.toLowerCase().includes(term) ||
      c.cidade?.toLowerCase().includes(term) ||
      c.estado?.toLowerCase().includes(term) ||
      c.cnpj?.toLowerCase().includes(term) ||
      c.responsavel?.toLowerCase().includes(term)
    const matchStatus = statusFilter === 'Todos' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = async (c: ContractRecord) => {
    if (!c.id) return
    if (!confirm(`Excluir o contrato "${c.nome}"?`)) return
    setDeletingId(String(c.id))
    const ok = await deleteContract(String(c.id))
    setDeletingId(null)
    if (ok) {
      setAllContracts((prev) => prev.filter((x) => x.id !== c.id))
    } else {
      alert('Erro ao excluir contrato. Verifique as permissões ou tente novamente.')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('Todos')
  }

  const hasActiveFilter = search.trim() !== '' || statusFilter !== 'Todos'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Contratos</h1>
          <p className="text-gray-600 mt-1">Relação e análise de contratos ativos</p>
        </div>
        <div className="flex gap-3">
          <ContractsImportExport onImported={loadAll} rowsForExport={allContracts} />
          <Button onClick={() => { setSelected(null); setOpen(true) }}>
            <Plus className="w-4 h-4 mr-2" />Novo Contrato
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Contratos{' '}
              {!loading && (
                <span className="text-sm font-normal text-gray-500">
                  ({filtered.length}{hasActiveFilter ? ` de ${allContracts.length}` : ''})
                </span>
              )}
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  className="border rounded pl-7 pr-3 py-1 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Nome, cidade, CNPJ…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* Filtro por status */}
              <select
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="Todos">Todos os status</option>
                <option value="Ativo">Ativo</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Encerrado">Encerrado</option>
              </select>
              {/* Limpar filtros */}
              {hasActiveFilter && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                  <X className="w-3.5 h-3.5 mr-1" />Limpar
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando contratos...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileX className="w-12 h-12 mb-3" />
              {hasActiveFilter ? (
                <>
                  <p className="text-sm font-medium">Nenhum contrato corresponde ao filtro</p>
                  <button className="text-xs mt-2 text-blue-500 underline" onClick={clearFilters}>Limpar filtros</button>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">Nenhum contrato cadastrado</p>
                  <p className="text-xs mt-1">Clique em "Novo Contrato" para cadastrar o primeiro.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <div key={c.id ?? c.nome} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-medium text-sm">{c.nome}</span>
                    </div>
                    {c.status && (
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'Ativo' ? 'bg-green-100 text-green-700' : c.status === 'Suspenso' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.status}
                      </span>
                    )}
                  </div>
                  {(c.cidade || c.estado) && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{[c.cidade, c.estado].filter(Boolean).join(' / ')}</span>
                    </div>
                  )}
                  {c.responsavel && (
                    <p className="text-xs text-gray-500 mt-1">Resp.: {c.responsavel}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => { setSelected(c); setOpen(true) }}>
                      <Edit className="w-3 h-3 mr-1" />Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={deletingId === String(c.id)}
                      onClick={() => handleDelete(c)}
                    >
                      {deletingId === String(c.id)
                        ? <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        : <Trash2 className="w-3 h-3 mr-1" />}
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <ContractDialog open={open} onClose={() => setOpen(false)} contract={selected} onSaved={loadAll} />
    </div>
  )
}


