'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Activity, MapPin, Route, Truck } from 'lucide-react'
import type { RotaEntrega } from '@/lib/services/rotas-service'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  veiculos: any[]
  rotas: RotaEntrega[]
  loading?: boolean
}

// ─── Cores ────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  'Aguardando Atribuição': '#94a3b8',
  'Atribuída':             '#3b82f6',
  'Em Rota':               '#6366f1',
  'Entregue':              '#22c55e',
  'Cancelada':             '#ef4444',
  'Atrasada':              '#f97316',
}

const VEICULO_COLORS: Record<string, string> = {
  'Ativo':      '#22c55e',
  'Em Rota':    '#3b82f6',
  'Manutenção': '#f97316',
  'Inativo':    '#94a3b8',
}

// ─── Tooltip customizado ──────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color ?? entry.fill }} className="font-medium">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function RastreamentoAnalytics({ veiculos, rotas, loading }: Props) {

  // ── Rotas por status ─────────────────────────────────────────────────
  const rotasPorStatus = useMemo(() => {
    const map: Record<string, number> = {}
    rotas.forEach((r) => { map[r.status] = (map[r.status] ?? 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [rotas])

  // ── Veículos por status ───────────────────────────────────────────────
  const veiculosPorStatus = useMemo(() => {
    const map: Record<string, number> = {}
    veiculos.forEach((v) => { map[v.status] = (map[v.status] ?? 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [veiculos])

  // ── Rotas por prioridade ──────────────────────────────────────────────
  const rotasPorPrioridade = useMemo(() => {
    const map: Record<string, number> = {}
    rotas.forEach((r) => { map[r.prioridade] = (map[r.prioridade] ?? 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [rotas])

  // ── Rotas dos últimos 7 dias ──────────────────────────────────────────
  const rotasPorDia = useMemo(() => {
    const dias: Record<string, { criadas: number; entregues: number }> = {}
    const hoje = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoje)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      dias[key] = { criadas: 0, entregues: 0 }
    }
    rotas.forEach((r) => {
      const key = new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      if (dias[key]) dias[key].criadas++
      if (r.status === 'Entregue' && r.data_entrega) {
        const k2 = new Date(r.data_entrega).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        if (dias[k2]) dias[k2].entregues++
      }
    })
    return Object.entries(dias).map(([data, vals]) => ({ data, ...vals }))
  }, [rotas])

  // ── KPIs calculados ───────────────────────────────────────────────────
  const totalRotas       = rotas.length
  const taxaEntrega      = totalRotas ? Math.round((rotas.filter((r) => r.status === 'Entregue').length / totalRotas) * 100) : 0
  const rotasComMotorista = rotas.filter((r) => !!r.motorista_id).length
  const taxaAtribuicao   = totalRotas ? Math.round((rotasComMotorista / totalRotas) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Activity className="w-6 h-6 animate-spin mr-2" />
        Carregando analytics...
      </div>
    )
  }

  if (totalRotas === 0 && veiculos.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="font-semibold text-slate-600">Nenhum dado disponível</p>
        <p className="text-sm mt-1">Cadastre veículos e crie rotas para visualizar o analytics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total de Rotas',    value: totalRotas,      icon: Route,    color: 'text-blue-700',   bg: 'bg-blue-50'  },
          { label: 'Taxa de Entrega',   value: `${taxaEntrega}%`, icon: MapPin, color: 'text-green-700',  bg: 'bg-green-50' },
          { label: 'Taxa de Atribuição',value: `${taxaAtribuicao}%`, icon: Truck, color: 'text-violet-700', bg: 'bg-violet-50'},
          { label: 'Frota Total',       value: veiculos.length, icon: Activity, color: 'text-slate-700',  bg: 'bg-slate-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Rotas por status — Pie */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Route className="w-4 h-4 text-blue-500" />Rotas por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rotasPorStatus.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={rotasPorStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${value}`}
                    labelLine={false}
                  >
                    {rotasPorStatus.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] ?? '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Veículos por status — Pie */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-500" />Frota por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {veiculosPorStatus.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={veiculosPorStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${value}`}
                    labelLine={false}
                  >
                    {veiculosPorStatus.map((entry, i) => (
                      <Cell key={i} fill={VEICULO_COLORS[entry.name] ?? '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Rotas últimos 7 dias — Bar */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-500" />Rotas — Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={rotasPorDia} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="data" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
                <Bar dataKey="criadas"   name="Criadas"   fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="entregues" name="Entregues" fill="#22c55e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rotas por prioridade */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-500" />Rotas por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rotasPorPrioridade.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sem dados</p>
            ) : (
              <div className="space-y-3 pt-2">
                {[
                  { key: 'Urgente', color: 'bg-red-500' },
                  { key: 'Alta',    color: 'bg-orange-500' },
                  { key: 'Normal',  color: 'bg-blue-500' },
                  { key: 'Baixa',   color: 'bg-slate-300' },
                ].map(({ key, color }) => {
                  const item = rotasPorPrioridade.find((r) => r.name === key)
                  const val = item?.value ?? 0
                  const total = rotasPorPrioridade.reduce((a, b) => a + b.value, 0)
                  const pct = total ? Math.round((val / total) * 100) : 0
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span className="font-medium">{key}</span>
                        <span>{val} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
