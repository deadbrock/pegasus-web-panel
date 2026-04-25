'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Package,
  TrendingUp,
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { PedidosMateriaisPanel } from '@/components/pedidos/pedidos-materiais-panel'
import { OrderStatusChart } from '@/components/pedidos/order-status-chart'
import { OrderTimelineChart } from '@/components/pedidos/order-timeline-chart'
import {
  calcularStatsPedidos,
  fetchPedidosMateriais,
  STATUS_LABELS,
  type PedidoMaterial,
  type PedidoMaterialStatus,
} from '@/services/pedidosMateriaisService'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcularTimeline(pedidos: PedidoMaterial[]) {
  const hoje = new Date()
  return Array.from({ length: 30 }, (_, idx) => {
    const d = new Date(hoje)
    d.setDate(d.getDate() - (29 - idx))
    const ds = d.toISOString().split('T')[0]
    const doDia = pedidos.filter((p) => p.created_at.startsWith(ds))
    return {
      dia: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
      pedidos: doDia.length,
      entregues: doDia.filter((p) => p.status === 'Entregue').length,
      cancelados: doDia.filter((p) => p.status === 'Cancelado' || p.status === 'Rejeitado').length,
    }
  })
}

function buildPorStatus(pedidos: PedidoMaterial[]) {
  const count = (s: PedidoMaterialStatus) => pedidos.filter((p) => p.status === s).length
  return {
    Pendente: count('Pendente') + pedidos.filter((p) => p.status === 'Aguardando Validação').length,
    Aprovado: count('Aprovado'),
    'Em Separação': count('Em Separação') + count('Separado'),
    'Saiu para Entrega': 0,
    Entregue: count('Entregue'),
    Cancelado: count('Cancelado'),
    Rejeitado: count('Rejeitado'),
  }
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const BADGE_COLORS: Partial<Record<PedidoMaterialStatus, string>> = {
  'Aguardando Validação': 'bg-yellow-50 text-yellow-700',
  Pendente:              'bg-slate-100 text-slate-600',
  'Em Análise':          'bg-blue-50 text-blue-700',
  Aprovado:              'bg-indigo-50 text-indigo-700',
  'Em Separação':        'bg-violet-50 text-violet-700',
  Separado:              'bg-purple-50 text-purple-700',
  Entregue:              'bg-emerald-50 text-emerald-700',
  Rejeitado:             'bg-rose-50 text-rose-600',
  Cancelado:             'bg-rose-50 text-rose-600',
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PedidosPage() {
  const [pedidos, setPedidos]           = useState<PedidoMaterial[]>([])
  const [loading, setLoading]           = useState(true)
  const [timelineData, setTimelineData] = useState<ReturnType<typeof calcularTimeline>>([])

  const stats    = useMemo(() => calcularStatsPedidos(pedidos), [pedidos])
  const porStatus = useMemo(() => buildPorStatus(pedidos), [pedidos])
  const recentes = useMemo(() => pedidos.slice(0, 5), [pedidos])

  const emAndamento = stats.emAnalise + stats.aprovados

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPedidosMateriais()
      setPedidos(data)
      setTimelineData(calcularTimeline(data))
    } catch {
      // erros são exibidos dentro do PedidosMateriaisPanel
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Pedidos</h1>
          <p className="text-gray-600 mt-1">
            Pedidos de materiais criados pelo Portal Operacional
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Pedidos"
          value={loading ? '—' : stats.total.toString()}
          change={stats.total > 0 ? `+${stats.total}` : '0'}
          changeType="positive"
          icon={Package}
          description="Todos os pedidos"
        />
        <MetricCard
          title="Pedidos Entregues"
          value={loading ? '—' : stats.entregues.toString()}
          change={stats.total > 0 ? `${Math.round((stats.entregues / stats.total) * 100)}%` : '0%'}
          changeType="positive"
          icon={CheckCircle}
          description={`Taxa: ${stats.total > 0 ? Math.round((stats.entregues / stats.total) * 100) : 0}%`}
        />
        <MetricCard
          title="Em Andamento"
          value={loading ? '—' : emAndamento.toString()}
          change={emAndamento > 0 ? `+${emAndamento}` : '0'}
          changeType="neutral"
          icon={Clock}
          description="Em análise ou aprovados"
        />
        <MetricCard
          title="Pendentes"
          value={loading ? '—' : stats.pendentes.toString()}
          change={stats.pendentes > 0 ? `${stats.pendentes} aguardando` : '0'}
          changeType={stats.pendentes > 0 ? 'negative' : 'neutral'}
          icon={AlertCircle}
          description="Aguardando ação"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* ── Dashboard Tab ─────────────────────────────────────────────── */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de status */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusChart data={porStatus} />
              </CardContent>
            </Card>

            {/* Pedidos recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pedidos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhum pedido recente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentes.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg gap-2"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">
                            {pedido.numero_pedido}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {pedido.solicitante_nome}
                            {pedido.solicitante_setor ? ` · ${pedido.solicitante_setor}` : ''}
                            {' · '}{pedido.itens?.length ?? 0} {pedido.itens?.length === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                        <span className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
                          BADGE_COLORS[pedido.status as PedidoMaterialStatus] ?? 'bg-slate-100 text-slate-600'
                        )}>
                          {STATUS_LABELS[pedido.status as PedidoMaterialStatus] ?? pedido.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolução de Pedidos — Últimos 30 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimelineChart data={timelineData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Pedidos Tab (antigo Materiais) ────────────────────────────── */}
        <TabsContent value="pedidos">
          <PedidosMateriaisPanel />
        </TabsContent>

        {/* ── Analytics Tab ─────────────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      label: 'Taxa de Entrega',
                      value: stats.total > 0 ? Math.round((stats.entregues / stats.total) * 100) : 0,
                      color: 'bg-emerald-600',
                    },
                    {
                      label: 'Em Andamento',
                      value: stats.total > 0 ? Math.round((emAndamento / stats.total) * 100) : 0,
                      color: 'bg-blue-600',
                    },
                    {
                      label: 'Cancelados / Rejeitados',
                      value: stats.total > 0 ? Math.round((stats.rejeitados / stats.total) * 100) : 0,
                      color: 'bg-rose-500',
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{label}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={cn('h-2 rounded-full transition-all', color)} style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Resumo por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {([
                    ['Aguardando Validação', pedidos.filter((p) => p.status === 'Aguardando Validação').length, 'text-yellow-600'],
                    ['Pendente',             stats.pendentes,  'text-slate-600'],
                    ['Em Análise',           stats.emAnalise,  'text-blue-600'],
                    ['Aprovados+Separação',  stats.aprovados,  'text-indigo-600'],
                    ['Entregues',            stats.entregues,  'text-emerald-600'],
                    ['Rejeitados/Cancelados',stats.rejeitados, 'text-rose-600'],
                  ] as [string, number, string][]).map(([label, value, color]) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className={cn('font-semibold text-sm', color)}>{value} pedidos</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Total</span>
                    <span className="font-bold text-gray-900">{stats.total} pedidos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Relatórios Tab ────────────────────────────────────────────── */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const rows = pedidos.map((p) => ({
                      Número: p.numero_pedido,
                      Solicitante: p.solicitante_nome,
                      Setor: p.solicitante_setor ?? '',
                      Urgência: p.urgencia,
                      Status: p.status,
                      Itens: p.itens?.length ?? 0,
                      Data: new Date(p.created_at).toLocaleDateString('pt-BR'),
                    }))
                    const csv = [Object.keys(rows[0] ?? {}).join(','), ...rows.map((r) => Object.values(r).join(','))].join('\n')
                    const a = document.createElement('a')
                    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
                    a.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Pedidos (CSV)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pedidos.filter((p) => p.status === 'Aguardando Validação').length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-yellow-800 text-sm">
                          {pedidos.filter((p) => p.status === 'Aguardando Validação').length} pedido(s) aguardando validação no portal
                        </p>
                        <p className="text-xs text-yellow-600">Supervisor precisa validar</p>
                      </div>
                    </div>
                  )}
                  {stats.pendentes > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Clock className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {stats.pendentes} pedido(s) pendente(s)
                        </p>
                        <p className="text-xs text-slate-600">Aguardando processamento</p>
                      </div>
                    </div>
                  )}
                  {emAndamento > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-800 text-sm">
                          {emAndamento} pedido(s) em andamento
                        </p>
                        <p className="text-xs text-blue-600">Em análise ou aprovados</p>
                      </div>
                    </div>
                  )}
                  {stats.total === 0 || (
                    pedidos.filter((p) => p.status === 'Aguardando Validação').length === 0 &&
                    stats.pendentes === 0 &&
                    emAndamento === 0
                  ) ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Nenhum alerta no momento</p>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
