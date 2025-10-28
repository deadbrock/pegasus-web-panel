'use client'

import { MapPin } from 'lucide-react'

export function StockLocationsTable() {
  // Dados virão do campo localizacao da tabela produtos
  return (
    <div className="text-center py-16 text-gray-500">
      <MapPin className="mx-auto h-16 w-16 mb-4 text-gray-400" />
      <p className="text-lg font-medium">Localizações em Desenvolvimento</p>
      <p className="text-sm mt-2">
        Você pode definir a localização dos produtos ao editá-los
      </p>
      <p className="text-xs mt-4 text-gray-400">
        Ex: "Prateleira A3", "Galpão 2", "Setor B - Rack 15"
      </p>
    </div>
  )
}
