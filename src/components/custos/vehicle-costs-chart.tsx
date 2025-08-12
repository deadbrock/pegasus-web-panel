'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data para custos por veículo
const vehicleCostsData = [
  {
    veiculo: 'BRA-2023',
    combustivel: 5240,
    manutencao: 2180,
    outros: 450,
    total: 7870,
    kmMes: 2340
  },
  {
    veiculo: 'BRA-2024',
    combustivel: 4850,
    manutencao: 1950,
    outros: 320,
    total: 7120,
    kmMes: 2180
  },
  {
    veiculo: 'BRA-2025',
    combustivel: 6200,
    manutencao: 2950,
    outros: 580,
    total: 9730,
    kmMes: 2680
  },
  {
    veiculo: 'BRA-2026',
    combustivel: 4950,
    manutencao: 1820,
    outros: 395,
    total: 7165,
    kmMes: 2250
  },
  {
    veiculo: 'BRA-2027',
    combustivel: 5180,
    manutencao: 2250,
    outros: 420,
    total: 7850,
    kmMes: 2380
  }
]

export function VehicleCostsChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = vehicleCostsData.find(item => item.veiculo === label)
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-orange-600">
            Combustível: R$ {data?.combustivel.toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-blue-600">
            Manutenção: R$ {data?.manutencao.toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-gray-600">
            Outros: R$ {data?.outros.toLocaleString('pt-BR')}
          </p>
          <div className="border-t pt-1 mt-1">
            <p className="text-sm font-medium">
              Total: R$ {data?.total.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-gray-500">
              KM Mês: {data?.kmMes.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-gray-500">
              Custo/KM: R$ {data ? (data.total / data.kmMes).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={vehicleCostsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="veiculo" />
            <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              dataKey="combustivel" 
              stackId="a" 
              fill="#f97316" 
              name="Combustível"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="manutencao" 
              stackId="a" 
              fill="#3b82f6" 
              name="Manutenção"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="outros" 
              stackId="a" 
              fill="#6b7280" 
              name="Outros"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela detalhada */}
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700">Veículo</th>
              <th className="text-right p-3 font-medium text-gray-700">Combustível</th>
              <th className="text-right p-3 font-medium text-gray-700">Manutenção</th>
              <th className="text-right p-3 font-medium text-gray-700">Outros</th>
              <th className="text-right p-3 font-medium text-gray-700">Total</th>
              <th className="text-right p-3 font-medium text-gray-700">KM Mês</th>
              <th className="text-right p-3 font-medium text-gray-700">Custo/KM</th>
            </tr>
          </thead>
          <tbody>
            {vehicleCostsData.map((vehicle, index) => (
              <tr key={vehicle.veiculo} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="p-3 font-medium">{vehicle.veiculo}</td>
                <td className="p-3 text-right text-orange-600">
                  R$ {vehicle.combustivel.toLocaleString('pt-BR')}
                </td>
                <td className="p-3 text-right text-blue-600">
                  R$ {vehicle.manutencao.toLocaleString('pt-BR')}
                </td>
                <td className="p-3 text-right text-gray-600">
                  R$ {vehicle.outros.toLocaleString('pt-BR')}
                </td>
                <td className="p-3 text-right font-bold">
                  R$ {vehicle.total.toLocaleString('pt-BR')}
                </td>
                <td className="p-3 text-right">
                  {vehicle.kmMes.toLocaleString('pt-BR')} km
                </td>
                <td className="p-3 text-right font-medium">
                  R$ {(vehicle.total / vehicle.kmMes).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-blue-50 border-t-2">
            <tr>
              <td className="p-3 font-bold">TOTAL</td>
              <td className="p-3 text-right font-bold text-orange-600">
                R$ {vehicleCostsData.reduce((sum, v) => sum + v.combustivel, 0).toLocaleString('pt-BR')}
              </td>
              <td className="p-3 text-right font-bold text-blue-600">
                R$ {vehicleCostsData.reduce((sum, v) => sum + v.manutencao, 0).toLocaleString('pt-BR')}
              </td>
              <td className="p-3 text-right font-bold text-gray-600">
                R$ {vehicleCostsData.reduce((sum, v) => sum + v.outros, 0).toLocaleString('pt-BR')}
              </td>
              <td className="p-3 text-right font-bold text-lg">
                R$ {vehicleCostsData.reduce((sum, v) => sum + v.total, 0).toLocaleString('pt-BR')}
              </td>
              <td className="p-3 text-right font-bold">
                {vehicleCostsData.reduce((sum, v) => sum + v.kmMes, 0).toLocaleString('pt-BR')} km
              </td>
              <td className="p-3 text-right font-bold">
                R$ {(
                  vehicleCostsData.reduce((sum, v) => sum + v.total, 0) / 
                  vehicleCostsData.reduce((sum, v) => sum + v.kmMes, 0)
                ).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}