"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building2, MapPin, FileSpreadsheet, Download, Filter, Search, Edit, Trash2 } from 'lucide-react'
import { fetchContracts, fetchContractsQuery, deleteContract, type ContractRecord } from '@/services/contractsService'
import { ContractsImportExport } from '@/components/contratos/contracts-import-export'
import { ContractDialog } from '@/components/contratos/contract-dialog'

export default function ContratosPage() {
  const [contracts, setContracts] = useState<ContractRecord[]>([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ContractRecord | null>(null)
  const [search, setSearch] = useState('')
  useEffect(() => { fetchContracts().then(setContracts) }, [])
  const load = async () => setContracts(await fetchContractsQuery({ search }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Contratos</h1>
          <p className="text-gray-600 mt-1">Relação e análise de contratos ativos</p>
        </div>
        <div className="flex gap-3">
          <ContractsImportExport onImported={load} rowsForExport={contracts} />
          <Button onClick={() => { setSelected(null); setOpen(true) }}><Plus className="w-4 h-4 mr-2" />Novo Contrato</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Contratos</span>
            <div className="flex gap-2 items-center">
              <input className="border rounded px-3 py-1 text-sm" placeholder="Buscar nome, cidade, CNPJ" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button variant="outline" size="sm" onClick={load}><Search className="w-4 h-4 mr-2" />Buscar</Button>
              <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtrar</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(contracts.length ? contracts : [{ nome: 'Assaí Paulista', cidade: 'São Paulo', estado: 'SP' }, { nome: 'Mix Mateus Caxangá', cidade: 'Recife', estado: 'PE' }]).map((c: any) => (
              <div key={c.nome} className="border rounded-lg p-4 hover:shadow-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{c.nome}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{c.cidade}/{c.estado}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => { setSelected(c); setOpen(true) }}><Edit className="w-3 h-3 mr-1" />Editar</Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={async () => { if (confirm('Excluir contrato?')) { await deleteContract(String(c.id)); load() } }}><Trash2 className="w-3 h-3 mr-1" />Excluir</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <ContractDialog open={open} onClose={() => setOpen(false)} contract={selected} onSaved={load} />
    </div>
  )
}


