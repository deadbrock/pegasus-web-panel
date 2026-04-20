'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Truck,
  Package,
  MapPin,
  FileText,
  Shield,
  Award,
  Settings,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Zap,
  Eye,
  Download,
  Minus,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { MetricCard } from '@/components/dashboard/metric-card'
import { useEffect, useState } from 'react'
import { fetchDashboardKPIs, type DashboardKPIs } from '@/lib/services/dashboard-service'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const now = new Date()
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const [selectedPeriod, setSelectedPeriod] = useState(`${months[now.getMonth()]} ${now.getFullYear()}`)
  const [selectedMonth, setSelectedMonth] = useState(months[now.getMonth()])
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString())
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => { fetchDashboardKPIs().then(setKpis) }, [])

  const years = Array.from({ length: 26 }, (_, i) => (2025 + i).toString())

  const handleApplyPeriod = () => {
    setSelectedPeriod(`${selectedMonth} ${selectedYear}`)
    setIsDialogOpen(false)
  }

  const handleQuickPeriod = (period: string) => {
    const now = new Date()
    const currentMonth = months[now.getMonth()]
    const currentYear = now.getFullYear().toString()
    switch (period) {
      case 'current':
        setSelectedMonth(currentMonth); setSelectedYear(currentYear)
        setSelectedPeriod(`${currentMonth} ${currentYear}`); break
      case 'last': {
        const lastIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1
        const lastYear = now.getMonth() === 0 ? (now.getFullYear() - 1).toString() : currentYear
        setSelectedMonth(months[lastIdx]); setSelectedYear(lastYear)
        setSelectedPeriod(`${months[lastIdx]} ${lastYear}`); break
      }
      case 'year':
        setSelectedMonth('Dezembro'); setSelectedYear(currentYear)
        setSelectedPeriod(`Ano ${currentYear}`); break
    }
    setIsDialogOpen(false)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value)

  const handleExportDashboard = () => {
    const data = {
      periodo: selectedPeriod,
      receita_total: kpis?.receita_total ?? 0,
      custo_total: kpis?.custo_total ?? 0,
      lucro_liquido: kpis?.lucro_liquido ?? 0,
      exportado_em: new Date().toLocaleString('pt-BR')
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `dashboard-executivo-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Insight bar dinâmica
  const insight = (() => {
    if (!kpis) return null
    const totalAlertas =
      kpis.estoque_critico + kpis.documentos_vencidos + kpis.documentos_vencendo +
      kpis.manutencoes_proximas + kpis.achados_criticos + kpis.contratos_vencendo + kpis.cnh_vencendo
    if (kpis.lucro_liquido <= 0)
      return { type: 'danger', msg: 'Atenção: lucro líquido zerado ou negativo no período selecionado.' }
    if (kpis.margem_lucro < 10)
      return { type: 'warning', msg: `Margem de lucro baixa: ${kpis.margem_lucro.toFixed(1)}%. Revise os custos operacionais.` }
    if (kpis.estoque_critico > 0)
      return { type: 'warning', msg: `${kpis.estoque_critico} item(s) com estoque crítico. Reposição necessária.` }
    if (totalAlertas > 0)
      return { type: 'warning', msg: `${totalAlertas} alerta(s) operacional requer atenção.` }
    if (kpis.margem_lucro >= 20)
      return { type: 'success', msg: `Margem operacional saudável: ${kpis.margem_lucro.toFixed(1)}%. Operação dentro das metas.` }
    return { type: 'info', msg: `Período ${selectedPeriod}: receita de ${formatCurrency(kpis.receita_total)} · ${kpis.pedidos_total} pedido(s).` }
  })()

  const insightStyles: Record<string, string> = {
    danger:  'bg-rose-50 border-rose-200 text-rose-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    info:    'bg-blue-50 border-blue-200 text-blue-800',
  }
  const insightDot: Record<string, string> = {
    danger: 'bg-rose-500', warning: 'bg-amber-500', success: 'bg-emerald-500', info: 'bg-blue-500',
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Executivo</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Visão consolidada — <span className="font-medium text-slate-700">{selectedPeriod}</span>
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ao vivo · {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="pg-btn-secondary text-xs h-8 px-3">
                <Calendar className="w-3.5 h-3.5" />
                {selectedPeriod}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Selecionar Período</DialogTitle>
                <DialogDescription>Escolha o mês e ano para visualizar os dados do dashboard</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Atalhos Rápidos</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="pg-btn-secondary text-xs py-2" onClick={() => handleQuickPeriod('current')}>Mês Atual</button>
                    <button className="pg-btn-secondary text-xs py-2" onClick={() => handleQuickPeriod('last')}>Mês Passado</button>
                    <button className="pg-btn-secondary text-xs py-2" onClick={() => handleQuickPeriod('year')}>Ano Atual</button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Período Personalizado</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="month" className="text-xs text-gray-600">Mês</Label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger id="month"><SelectValue /></SelectTrigger>
                        <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year" className="text-xs text-gray-600">Ano</Label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger id="year"><SelectValue /></SelectTrigger>
                        <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Período Selecionado</p>
                      <p className="text-sm font-bold text-blue-900">{selectedMonth} de {selectedYear}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="pg-btn-secondary flex-1 justify-center" onClick={() => setIsDialogOpen(false)}>Cancelar</button>
                  <button className="pg-btn-primary flex-1 justify-center" onClick={handleApplyPeriod}>Aplicar Período</button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <button className="pg-btn-secondary text-xs h-8 px-3" onClick={handleExportDashboard}>
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
          <button className="pg-btn-ghost text-xs h-8 px-2" onClick={() => router.push('/dashboard/configuracoes')}>
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Insight Bar */}
      {insight && (
        <div className={cn('flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium animate-scale-in', insightStyles[insight.type])}>
          <span className={cn('mt-1.5 w-2 h-2 rounded-full flex-shrink-0', insightDot[insight.type])} />
          <span>{insight.msg}</span>
        </div>
      )}
      {!kpis && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
          <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin flex-shrink-0" />
          Carregando indicadores do período...
        </div>
      )}

      {/* KPIs Financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Receita Total" value={formatCurrency(kpis?.receita_total ?? 0)} icon={DollarSign} iconColor="emerald" description="Período selecionado" loading={!kpis} />
        <MetricCard title="Custo Total" value={formatCurrency(kpis?.custo_total ?? 0)} icon={TrendingDown} iconColor="rose" description="Período selecionado" loading={!kpis} />
        <MetricCard
          title="Lucro Líquido"
          value={formatCurrency(kpis?.lucro_liquido ?? 0)}
          icon={Target} iconColor="blue"
          change={kpis ? `Margem: ${(kpis.margem_lucro ?? 0).toFixed(1)}%` : undefined}
          changeType={kpis && kpis.lucro_liquido > 0 ? 'positive' : 'negative'}
          loading={!kpis}
        />
        <MetricCard
          title="Margem de Lucro"
          value={`${kpis?.margem_lucro?.toFixed(1) ?? '0.0'}%`}
          icon={TrendingUp}
          iconColor={kpis && kpis.margem_lucro > 20 ? 'emerald' : 'amber'}
          change={kpis && kpis.margem_lucro > 20 ? 'Saudável' : 'Atenção'}
          changeType={kpis && kpis.margem_lucro > 20 ? 'positive' : 'negative'}
          description="Lucratividade" loading={!kpis}
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="pg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <div>
              <p className="pg-section-title">Evolução Financeira</p>
              <p className="text-xs text-slate-400">Últimos 5 meses</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [formatCurrency(v), '']} />
                <Area type="monotone" dataKey="receita" stroke="#10b981" fill="#10b981" fillOpacity={0.08} strokeWidth={2} />
                <Area type="monotone" dataKey="custos" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.08} strokeWidth={2} />
                <Area type="monotone" dataKey="lucro" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="pg-empty pt-2 pb-0">
            <div className="pg-empty-icon"><BarChart3 className="w-5 h-5" /></div>
            <p className="pg-empty-title">Sem dados históricos</p>
            <p className="pg-empty-description">Registre transações para ver a evolução mensal</p>
          </div>
        </div>

        <div className="pg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-blue-500" />
            <p className="pg-section-title">Performance vs Meta</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="categoria" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [`${v}%`, '']} />
                <Bar dataKey="valor" fill="#3b82f6" name="Atual" radius={[4,4,0,0]} />
                <Bar dataKey="meta" fill="#e2e8f0" name="Meta" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pg-empty pt-2 pb-0">
            <div className="pg-empty-icon"><Activity className="w-5 h-5" /></div>
            <p className="pg-empty-title">Sem dados de performance</p>
            <p className="pg-empty-description">Dados serão exibidos quando houver registros</p>
          </div>
        </div>
      </div>

      {/* Widgets Financeiros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="pg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <p className="pg-section-title">Despesas por Centro</p>
          </div>
          <div className="pg-empty">
            <div className="pg-empty-icon"><BarChart3 className="w-5 h-5" /></div>
            <p className="pg-empty-title">Nenhum dado de centro de custo</p>
            <p className="pg-empty-description">Importe transações OFX para ver o rateio</p>
          </div>
        </div>

        <div className="pg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <p className="pg-section-title">Transações Recentes</p>
            </div>
          </div>
          <div className="pg-empty">
            <div className="pg-empty-icon"><Activity className="w-5 h-5" /></div>
            <p className="pg-empty-title">Nenhuma transação recente</p>
            <p className="pg-empty-description">Importe extratos OFX para visualizar</p>
          </div>
          <button className="pg-btn-secondary w-full text-xs mt-2 justify-center" onClick={() => router.push('/dashboard/financeiro')}>
            <Eye className="w-3.5 h-3.5" />
            Ver Todas as Transações
          </button>
        </div>

        <div className="pg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <p className="pg-section-title">Resumo Financeiro</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 mb-1">Entradas</p>
              <p className="text-base font-bold text-emerald-700 tabular-nums">{formatCurrency(kpis?.receita_total ?? 0)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-500 mb-1">Saídas</p>
              <p className="text-base font-bold text-rose-700 tabular-nums">{formatCurrency(kpis?.custo_total ?? 0)}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Lucro Líquido</span>
              <span className="font-semibold text-blue-600 tabular-nums">{formatCurrency(kpis?.lucro_liquido ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500">Margem</span>
              <span className="font-semibold text-slate-700">{kpis?.margem_lucro?.toFixed(1) ?? '—'}%</span>
            </div>
          </div>
          <button className="pg-btn-primary w-full text-xs mt-4 justify-center" onClick={() => router.push('/dashboard/financeiro')}>
            <FileText className="w-3.5 h-3.5" />
            Importar OFX
          </button>
        </div>
      </div>

      {/* KPIs Operacionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Pedidos Ativos" value={(kpis?.pedidos_ativos ?? 0).toString()} change={kpis ? `Total: ${kpis.pedidos_total}` : undefined} changeType="neutral" icon={Package} iconColor="violet" description="Em andamento" loading={!kpis} />
        <MetricCard title="Taxa de Entrega" value={`${kpis?.taxa_entrega?.toFixed(1) ?? '0.0'}%`} change={kpis ? `${kpis.entregas_no_prazo} entregas` : undefined} changeType="positive" icon={CheckCircle} iconColor="emerald" description="No prazo" loading={!kpis} />
        <MetricCard title="Motoristas Ativos" value={`${kpis?.motoristas_ativos ?? 0}/${kpis?.total_motoristas ?? 0}`} change={kpis && kpis.cnh_vencendo > 0 ? `${kpis.cnh_vencendo} CNH vencendo` : 'Nenhum alerta'} changeType={kpis && kpis.cnh_vencendo > 0 ? 'negative' : 'positive'} icon={Users} iconColor="amber" description="CNH válidas" loading={!kpis} />
        <MetricCard title="Frota Ativa" value={`${kpis?.veiculos_ativos ?? 0}/${kpis?.total_veiculos ?? 0}`} change={kpis && kpis.veiculos_manutencao > 0 ? `${kpis.veiculos_manutencao} em manutenção` : 'Sem manutenções'} changeType={kpis && kpis.veiculos_manutencao > 0 ? 'negative' : 'positive'} icon={Truck} iconColor="blue" description="Disponíveis" loading={!kpis} />
      </div>

      {/* Status + Alertas + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status dos Módulos */}
        <div className="pg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-blue-500" />
            <p className="pg-section-title">Status dos Módulos</p>
          </div>
          <div className="space-y-1.5">
            {(['Pedidos', 'Rastreamento', 'Estoque', 'Frota', 'Financeiro', 'Compliance'] as const).map(mod => (
              <div key={mod} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{mod}</span>
                </div>
                <span className="pg-badge-success text-[10px]">Online</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas Críticos */}
        <div className="pg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="pg-section-title">Alertas Críticos</p>
          </div>
          <div className="space-y-2">
            {kpis && kpis.estoque_critico > 0 && (
              <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <div><p className="text-sm font-medium text-rose-800">Estoque Crítico</p><p className="text-xs text-rose-600">{kpis.estoque_critico} produtos zerados</p></div>
                </div>
                <button className="text-xs text-rose-600 hover:underline" onClick={() => router.push('/dashboard/estoque')}>Ver</button>
              </div>
            )}
            {kpis && kpis.documentos_vencidos > 0 && (
              <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <div><p className="text-sm font-medium text-rose-800">Docs. Vencidos</p><p className="text-xs text-rose-600">{kpis.documentos_vencidos} documentos</p></div>
                </div>
                <button className="text-xs text-rose-600 hover:underline" onClick={() => router.push('/dashboard/documentos')}>Ver</button>
              </div>
            )}
            {kpis && kpis.documentos_vencendo > 0 && (
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div><p className="text-sm font-medium text-amber-800">Docs. Vencendo</p><p className="text-xs text-amber-600">{kpis.documentos_vencendo} em 30 dias</p></div>
                </div>
                <button className="text-xs text-amber-600 hover:underline" onClick={() => router.push('/dashboard/documentos')}>Ver</button>
              </div>
            )}
            {kpis && kpis.manutencoes_proximas > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div><p className="text-sm font-medium text-blue-800">Manutenções</p><p className="text-xs text-blue-600">{kpis.manutencoes_proximas} em 30 dias</p></div>
                </div>
                <button className="text-xs text-blue-600 hover:underline" onClick={() => router.push('/dashboard/manutencao')}>Ver</button>
              </div>
            )}
            {kpis && kpis.cnh_vencendo > 0 && (
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div><p className="text-sm font-medium text-amber-800">CNH Vencendo</p><p className="text-xs text-amber-600">{kpis.cnh_vencendo} motoristas</p></div>
                </div>
                <button className="text-xs text-amber-600 hover:underline" onClick={() => router.push('/dashboard/motoristas')}>Ver</button>
              </div>
            )}
            {kpis && kpis.contratos_vencendo > 0 && (
              <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <div><p className="text-sm font-medium text-violet-800">Contratos</p><p className="text-xs text-violet-600">{kpis.contratos_vencendo} vencendo</p></div>
                </div>
                <button className="text-xs text-violet-600 hover:underline" onClick={() => router.push('/dashboard/contratos')}>Ver</button>
              </div>
            )}
            {!kpis && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="pg-shimmer h-14 rounded-xl" />)}</div>}
            {kpis && kpis.estoque_critico === 0 && kpis.documentos_vencidos === 0 && kpis.documentos_vencendo === 0 &&
             kpis.manutencoes_proximas === 0 && kpis.cnh_vencendo === 0 && kpis.contratos_vencendo === 0 && kpis.achados_criticos === 0 && (
              <div className="pg-empty py-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="pg-empty-title text-emerald-700">Tudo em ordem!</p>
                <p className="pg-empty-description">Nenhum alerta crítico no momento</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance */}
        <div className="pg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-blue-500" />
            <p className="pg-section-title">Performance</p>
          </div>
          {!kpis ? (
            <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="space-y-1.5"><div className="pg-shimmer h-3 w-32 rounded" /><div className="pg-shimmer h-2 rounded-full" /></div>)}</div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Entregas no Prazo', pct: kpis.taxa_entrega, color: 'bg-emerald-500' },
                { label: 'Score Compliance', pct: (kpis as any).score_compliance ?? 0, color: 'bg-blue-500' },
                { label: 'Frota Disponível', pct: kpis.total_veiculos > 0 ? (kpis.veiculos_ativos / kpis.total_veiculos) * 100 : 0, color: 'bg-violet-500' },
                { label: 'Motoristas Disp.', pct: kpis.total_motoristas > 0 ? (kpis.motoristas_ativos / kpis.total_motoristas) * 100 : 0, color: 'bg-amber-500' },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">{label}</span>
                    <span className="text-slate-800 font-semibold tabular-nums">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="pg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-blue-500" />
          <p className="pg-section-title">Ações Rápidas</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { label: 'Novo Pedido', icon: Package, href: '/dashboard/pedidos' },
            { label: 'Rastreamento', icon: MapPin, href: '/dashboard/rastreamento' },
            { label: 'Relatório', icon: FileText, href: '/dashboard/relatorios' },
            { label: 'Motoristas', icon: Users, href: '/dashboard/motoristas' },
            { label: 'Status Frota', icon: Truck, href: '/dashboard/veiculos' },
            { label: 'Análise Custos', icon: DollarSign, href: '/dashboard/custos' },
            { label: 'Gamificação', icon: Award, href: '/dashboard/gamificacao' },
            { label: 'Configurações', icon: Settings, href: '/dashboard/configuracoes' },
          ].map(({ label, icon: Icon, href }) => (
            <button key={href} onClick={() => router.push(href)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-card transition-all duration-150 group">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resumo Executivo Consolidado */}
      <div className="pg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="pg-section-title">Resumo Executivo — {selectedPeriod}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
          {[
            { icon: DollarSign, color: 'text-emerald-500', label: 'Receita Total', value: formatCurrency(kpis?.receita_total ?? 0), sub: 'Período selecionado' },
            { icon: Target, color: 'text-blue-500', label: 'Taxa de Entregas', value: kpis ? `${kpis.taxa_entrega.toFixed(1)}%` : '—', sub: kpis ? `${kpis.entregas_no_prazo} no prazo` : '' },
            { icon: Users, color: 'text-violet-500', label: 'Motoristas Ativos', value: kpis ? `${kpis.motoristas_ativos}/${kpis.total_motoristas}` : '—', sub: 'Disponíveis' },
            { icon: TrendingUp, color: 'text-amber-500', label: 'Margem de Lucro', value: kpis ? `${kpis.margem_lucro.toFixed(1)}%` : '—', sub: formatCurrency(kpis?.lucro_liquido ?? 0) },
          ].map(({ icon: Icon, color, label, value, sub }) => (
            <div key={label} className="px-5 py-5 text-center">
              <Icon className={cn('w-6 h-6 mx-auto mb-2', color)} />
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
              {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Destaques + Próximas Ações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="pg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <p className="pg-section-title">Destaques do Período</p>
          </div>
          {kpis ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-600" /><span className="text-xs font-semibold text-emerald-800">Receita do Período</span></div>
                <p className="text-sm text-emerald-700">{formatCurrency(kpis.receita_total)} em receita total no período selecionado.</p>
              </div>
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /><span className="text-xs font-semibold text-blue-800">Taxa de Entregas</span></div>
                <p className="text-sm text-blue-700">Taxa de entregas no prazo: {kpis.taxa_entrega.toFixed(1)}% ({kpis.entregas_no_prazo} entregas).</p>
              </div>
              <div className="p-3.5 bg-violet-50 border border-violet-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1"><Zap className="w-3.5 h-3.5 text-violet-600" /><span className="text-xs font-semibold text-violet-800">Frota e Equipe</span></div>
                <p className="text-sm text-violet-700">{kpis.motoristas_ativos}/{kpis.total_motoristas} motoristas ativos · {kpis.veiculos_ativos}/{kpis.total_veiculos} veículos disponíveis.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="pg-shimmer h-16 rounded-xl" />)}</div>
          )}
        </div>

        <div className="pg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-blue-500" />
            <p className="pg-section-title">Ações Pendentes</p>
          </div>
          <div className="space-y-2">
            {kpis && kpis.estoque_critico > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/estoque')}>
                <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                <div className="flex-1"><p className="text-sm font-medium text-slate-800">Estoque Crítico</p><p className="text-xs text-slate-500">{kpis.estoque_critico} produtos precisam reposição</p></div>
                <span className="pg-badge-danger">Urgente</span>
              </div>
            )}
            {kpis && kpis.documentos_vencendo > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-200 hover:bg-amber-50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/documentos')}>
                <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <div className="flex-1"><p className="text-sm font-medium text-slate-800">Documentos Vencendo</p><p className="text-xs text-slate-500">{kpis.documentos_vencendo} documentos em 30 dias</p></div>
                <span className="pg-badge-warning">Médio</span>
              </div>
            )}
            {kpis && kpis.manutencoes_proximas > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/manutencao')}>
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <div className="flex-1"><p className="text-sm font-medium text-slate-800">Manutenções Próximas</p><p className="text-xs text-slate-500">{kpis.manutencoes_proximas} agendadas em 30 dias</p></div>
                <span className="pg-badge-info">Normal</span>
              </div>
            )}
            {kpis && kpis.cnh_vencendo > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-200 hover:bg-amber-50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/motoristas')}>
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <div className="flex-1"><p className="text-sm font-medium text-slate-800">CNH Vencendo</p><p className="text-xs text-slate-500">{kpis.cnh_vencendo} motoristas em 30 dias</p></div>
                <span className="pg-badge-warning">Atenção</span>
              </div>
            )}
            {kpis && kpis.contratos_vencendo > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-violet-200 hover:bg-violet-50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/contratos')}>
                <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                <div className="flex-1"><p className="text-sm font-medium text-slate-800">Contratos Vencendo</p><p className="text-xs text-slate-500">{kpis.contratos_vencendo} contratos em 30 dias</p></div>
                <span className="pg-badge-neutral">Atenção</span>
              </div>
            )}
            {!kpis && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="pg-shimmer h-14 rounded-xl" />)}</div>}
            {kpis && kpis.estoque_critico === 0 && kpis.documentos_vencendo === 0 && kpis.manutencoes_proximas === 0 && kpis.cnh_vencendo === 0 && kpis.contratos_vencendo === 0 && (
              <div className="pg-empty py-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="pg-empty-title text-emerald-700">Nenhuma ação pendente</p>
                <p className="pg-empty-description">Todos os indicadores estão normais</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
