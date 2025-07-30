'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MapPin, Package } from 'lucide-react'

const locationsData = [
  { id: 1, localizacao: 'A1-B3', produto: 'Parafuso M6x20', quantidade: 850 },
  { id: 2, localizacao: 'C2-A1', produto: 'Óleo Lubrificante 1L', quantidade: 45 },
  { id: 3, localizacao: 'B1-C2', produto: 'Filtro de Ar', quantidade: 15 },
  { id: 4, localizacao: 'D1-A1', produto: 'Pneu 205/55R16', quantidade: 8 },
  { id: 5, localizacao: 'E1-B2', produto: 'Bateria 12V 60Ah', quantidade: 25 }
]

export function StockLocationsTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Localização</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Quantidade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locationsData.map((location) => (
            <TableRow key={location.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="font-mono font-medium">{location.localizacao}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{location.produto}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{location.quantidade}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}