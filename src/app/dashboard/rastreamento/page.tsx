'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Activity,
  AlertTriangle,
  Clock,
  Download,
  MapPin,
  Navigation,
  Pause,
  Play,
  RefreshCw,
  Route,
  Truck,
} from 'lucide-react'
import dynamic from 'next/dynamic'

const TrackingMap = dynamic(
  () => import('@/components/rastreamento/tracking-map').then((m) => m.TrackingMap),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center bg-slate-50 rounded-xl" style={{ height: 480 }}>
      <div className="text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm">Carregando mapa...</p>
      </div>
    </div>
  )}
)
import { VehiclesTable } from '@/components/rastreamento/vehicles-table'
import { RouteHistory } from '@/components/rastreamento/route-history'
import { RastreamentoAnalytics } from '@/components/rastreamento/rastreamento-analytics'
import { RastreamentoAlertas } from '@/components/rastreamento/rastreamento-alertas'
import { fetchVeiculos, subscribePosicoes, subscribeVeiculos } from '@/lib/services/rastreamento-realtime'
import { fetchRotas } from '@/lib/services/rotas-service'
import { exportRastreamentoKPIs } from '@/components/rastreamento/reports'
import { cn } from '@/lib/utils'

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, color = 'blue', loading,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color?: 'blue' | 'green' | 'amber' | 'violet' | 'red' | 'slate'
  loading?: boolean
}) {
  const palette = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700' },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  val: 'text-amber-700' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', val: 'text-violet-700' },
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    val: 'text-red-700' },
    slate:  { bg: 'bg-slate-50',  icon: 'text-slate-500',  val: 'text-slate-700' },
  }[color]

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', palette.bg)}>
          <Icon className={cn('w-5 h-5', palette.icon)} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className={cn('text-2xl font-bold leading-none mt-0.5', loading ? 'text-slate-300' : palette.val)}>
            {loading ? '—' : value}
          </p>
          {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RastreamentoPage() {
  const [realtime, setRealtime]         = useState(true)
  const [lastUpdate, setLastUpdate]     = useState(new Date())
  const [veiculos, setVeiculos]         = useState<any[]>([])
  const [rotas, setRotas]               = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [loading, setLoading]           = useState(true)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [v, r] = await Promise.all([fetchVeiculos(), fetchRotas()])
      setVeiculos(v)
      setRotas(r)
      setLastUpdate(new Date())
    } catch (e) {
      console.error('[Rastreamento] load error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    const unPos = subscribePosicoes(() => loadAll())
    const unVeh = subscribeVeiculos(() => loadAll())
    return () => { unPos?.(); unVeh?.() }
  }, [])

  // ── KPIs derivados ────────────────────────────────────────────────────
  const veiculosAtivos  = veiculos.filter((v) => v.status === 'Ativo' || v.status === 'Em Rota').length
  const emMovimento     = veiculos.filter((v) => v.status === 'Em Rota').length
  const emManutencao    = veiculos.filter((v) => v.status === 'Manutenção').length
  const rotasAtribuidas = rotas.filter((r) => r.status === 'Atribuída' || r.status === 'Em Rota').length
  const rotasEntregues  = rotas.filter((r) => r.status === 'Entregue').length
  const rotasPendentes  = rotas.filter((r) => r.status === 'Aguardando Atribuição').length

  const alertCount = rotasPendentes + emManutencao
  
  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            Rastreamento da Frota
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitoramento em tempo real · veículos, rotas e entregas
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badge */}
          <div className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border',
            realtime
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          )}>
            <span className={cn('w-2 h-2 rounded-full', realtime ? 'bg-green-500 animate-pulse' : 'bg-slate-400')} />
            {realtime ? 'Tempo Real Ativo' : 'Pausado'}
          </div>
          <Button variant="outline" size="sm" onClick={() => setRealtime((v) => !v)} className="gap-1.5">
            {realtime ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {realtime ? 'Pausar' : 'Retomar'}
          </Button>
          <Button variant="outline" size="sm" onClick={loadAll} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5"
            onClick={() => exportRastreamentoKPIs({
              'Veículos Ativos': veiculosAtivos,
              'Em Movimento': emMovimento,
              'Em Manutenção': emManutencao,
              'Rotas Atribuídas': rotasAtribuidas,
              'Rotas Entregues': rotasEntregues,
              'Rotas Pendentes': rotasPendentes,
            })}>
            <Download className="w-3.5 h-3.5" />
            Exportar
          </Button>
        </div>
      </div>

      {/* ── Última atualização ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Clock className="w-3.5 h-3.5" />
        Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
        {alertCount > 0 && (
          <span className="ml-2 flex items-center gap-1 text-amber-600 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            {alertCount} alerta{alertCount !== 1 ? 's' : ''} pendente{alertCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Veículos Ativos"  value={veiculosAtivos}   sub={`${veiculos.length} total`}   icon={Truck}    color="blue"   loading={loading} />
        <KpiCard label="Em Movimento"     value={emMovimento}      sub="Em Rota"                       icon={Navigation} color="green" loading={loading} />
        <KpiCard label="Em Manutenção"    value={emManutencao}     sub="Fora de operação"              icon={Activity} color="amber"  loading={loading} />
        <KpiCard label="Rotas Ativas"     value={rotasAtribuidas}  sub="Atribuída / Em Rota"           icon={Route}    color="violet" loading={loading} />
        <KpiCard label="Entregas Feitas"  value={rotasEntregues}   sub="Total histórico"               icon={MapPin}   color="green"  loading={loading} />
        <KpiCard label="Ag. Atribuição"   value={rotasPendentes}   sub="Precisam de motorista"         icon={AlertTriangle} color={rotasPendentes > 0 ? 'red' : 'slate'} loading={loading} />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="mapa" className="space-y-5">
        <TabsList className="grid w-full grid-cols-5 h-11">
          <TabsTrigger value="mapa"     className="gap-1.5 text-xs"><MapPin    className="w-3.5 h-3.5" />Mapa</TabsTrigger>
          <TabsTrigger value="veiculos" className="gap-1.5 text-xs"><Truck     className="w-3.5 h-3.5" />Veículos</TabsTrigger>
          <TabsTrigger value="rotas"    className="gap-1.5 text-xs"><Route     className="w-3.5 h-3.5" />Rotas</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs"><Activity className="w-3.5 h-3.5" />Analytics</TabsTrigger>
          <TabsTrigger value="alertas"  className="gap-1.5 text-xs relative">
            <AlertTriangle className="w-3.5 h-3.5" />Alertas
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Mapa */}
        <TabsContent value="mapa">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <Card className="shadow-sm">
                <CardContent className="p-0 overflow-hidden rounded-xl">
                  <TrackingMap
                    selectedVehicle={selectedVehicle}
                    isRealTime={realtime}
                    data={veiculos}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-3">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-500" />Frota ({veiculos.length})
                  </p>
                  <VehiclesTable
                    compact
                    onVehicleSelect={setSelectedVehicle}
                    selectedVehicle={selectedVehicle}
                    data={veiculos}
                  />
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Resumo rápido</p>
                  {[
                    { label: 'Ativos',       val: veiculosAtivos,  cls: 'text-blue-600' },
                    { label: 'Em movimento', val: emMovimento,      cls: 'text-green-600' },
                    { label: 'Parados',      val: veiculosAtivos - emMovimento, cls: 'text-amber-600' },
                    { label: 'Manutenção',   val: emManutencao,     cls: 'text-red-500' },
                    { label: 'Rotas ativas', val: rotasAtribuidas,  cls: 'text-violet-600' },
                  ].map(({ label, val, cls }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className={cn('font-semibold', cls)}>{val}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Veículos */}
        <TabsContent value="veiculos">
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <VehiclesTable
                onVehicleSelect={setSelectedVehicle}
                selectedVehicle={selectedVehicle}
                data={veiculos}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rotas */}
        <TabsContent value="rotas">
          <RouteHistory selectedVehicle={selectedVehicle} rotas={rotas} onReload={loadAll} />
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <RastreamentoAnalytics veiculos={veiculos} rotas={rotas} loading={loading} />
        </TabsContent>

        {/* Alertas */}
        <TabsContent value="alertas">
          <RastreamentoAlertas veiculos={veiculos} rotas={rotas} onReload={loadAll} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
