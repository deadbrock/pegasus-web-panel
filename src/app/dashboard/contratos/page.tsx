"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building2, MapPin, FileSpreadsheet, Download, Filter, Search } from 'lucide-react'
import { fetchContracts } from '@/services/contractsService'

export default function ContratosPage() {
  const [contracts, setContracts] = useState<any[]>([])
  useEffect(() => { fetchContracts().then(setContracts) }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Contratos</h1>
          <p className="text-gray-600 mt-1">Relação e análise de contratos ativos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><FileSpreadsheet className="w-4 h-4 mr-2" />Importar</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exportar</Button>
          <Button><Plus className="w-4 h-4 mr-2" />Novo Contrato</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Contratos</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2" />Buscar</Button>
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


