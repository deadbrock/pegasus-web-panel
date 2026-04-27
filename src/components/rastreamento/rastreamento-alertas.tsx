'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Filter,
  MapPin,
  RefreshCw,
  Route,
  Search,
  Settings,
  Truck,
  X,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { RotaEntrega } from '@/lib/services/rotas-service'
import { cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type AlertaTipo  = 'Rota' | 'Veículo' | 'Entrega' | 'Sistema'
type AlertaGrav  = 'Alta' | 'Média' | 'Baixa'
type AlertaStatus = 'Ativo' | 'Resolvido'

interface Alerta {
  id: string
  tipo: AlertaTipo
  gravidade: AlertaGrav
  status: AlertaStatus
  titulo: string
  descricao: string
  referencia?: string
  tempo: Date
}

// ─── Gerador de alertas reais ─────────────────────────────────────────────────

function gerarAlertas(veiculos: any[], rotas: RotaEntrega[]): Alerta[] {
  const alertas: Alerta[] = []
  const agora = new Date()

  const HORA = 60 * 60 * 1000
  const DIA  = 24 * HORA

  // Veículos em manutenção
  veiculos
    .filter((v) => v.status === 'Manutenção')
    .forEach((v) => {
      alertas.push({
        id:         `manut-${v.id}`,
        tipo:       'Veículo',
        gravidade:  'Alta',
        status:     'Ativo',
        titulo:     'Veículo em Manutenção',
        descricao:  `${v.placa} (${v.marca ?? ''} ${v.modelo}) está em manutenção e indisponível.`,
        referencia: v.placa,
        tempo:      new Date(v.updated_at ?? agora),
      })
    })

  // Rotas aguardando atribuição há mais de 2h
  rotas
    .filter((r) => r.status === 'Aguardando Atribuição')
    .forEach((r) => {
      const diff = agora.getTime() - new Date(r.created_at).getTime()
      const gravidade: AlertaGrav = diff > 24 * HORA ? 'Alta' : diff > 4 * HORA ? 'Média' : 'Baixa'
      const horas = Math.floor(diff / HORA)
      alertas.push({
        id:         `ag-atrib-${r.id}`,
        tipo:       'Rota',
        gravidade,
        status:     'Ativo',
        titulo:     'Rota sem Motorista/Veículo',
        descricao:  `Rota ${r.numero_rota} aguarda atribuição há ${horas < 1 ? 'menos de 1h' : `${horas}h`}.`,
        referencia: r.numero_rota,
        tempo:      new Date(r.created_at),
      })
    })

  // Rotas atrasadas
  rotas
    .filter((r) =>
      r.status === 'Atrasada' ||
      (r.status === 'Atribuída' && r.data_prevista_entrega && new Date(r.data_prevista_entrega) < agora)
    )
    .forEach((r) => {
      alertas.push({
        id:         `atraso-${r.id}`,
        tipo:       'Entrega',
        gravidade:  'Alta',
        status:     'Ativo',
        titulo:     'Rota com Atraso',
        descricao:  `Rota ${r.numero_rota}${r.endereco_completo ? ` — ${r.endereco_completo}` : ''} está atrasada.`,
        referencia: r.numero_rota,
        tempo:      r.data_prevista_entrega ? new Date(r.data_prevista_entrega) : new Date(r.created_at),
      })
    })

  // Rotas sem endereço configurado
  rotas
    .filter((r) => !r.endereco_completo && r.status === 'Aguardando Atribuição')
    .forEach((r) => {
      alertas.push({
        id:         `sem-end-${r.id}`,
        tipo:       'Rota',
        gravidade:  'Média',
        status:     'Ativo',
        titulo:     'Rota sem Endereço',
        descricao:  `Rota ${r.numero_rota} foi criada sem endereço de entrega. Configure antes de atribuir.`,
        referencia: r.numero_rota,
        tempo:      new Date(r.created_at),
      })
    })

  // CNH vencida/vencendo (se veículo tiver motoristas associados)
  veiculos
    .filter((v) => v.cnh_vencimento)
    .forEach((v) => {
      const venc = new Date(v.cnh_vencimento)
      const diff = venc.getTime() - agora.getTime()
      if (diff < 0) {
        alertas.push({
          id:        `cnh-venc-${v.id}`,
          tipo:      'Veículo',
          gravidade: 'Alta',
          status:    'Ativo',
          titulo:    'CNH Vencida',
          descricao: `Veículo ${v.placa} com CNH vencida em ${venc.toLocaleDateString('pt-BR')}.`,
          referencia: v.placa,
          tempo:     venc,
        })
      } else if (diff < 30 * DIA) {
        alertas.push({
          id:        `cnh-venc30-${v.id}`,
          tipo:      'Veículo',
          gravidade: 'Média',
          status:    'Ativo',
          titulo:    'CNH Vencendo em Breve',
          descricao: `Veículo ${v.placa} tem CNH vencendo em ${venc.toLocaleDateString('pt-BR')}.`,
          referencia: v.placa,
          tempo:     venc,
        })
      }
    })

  // Se não há alertas ativos, adicionar alerta informativo
  if (alertas.length === 0) {
    alertas.push({
      id:        'ok-sistema',
      tipo:      'Sistema',
      gravidade: 'Baixa',
      status:    'Resolvido',
      titulo:    'Sistema em ordem',
      descricao: 'Nenhum alerta crítico detectado. Frota e rotas operando normalmente.',
      tempo:     agora,
    })
  }

  return alertas.sort((a, b) => {
    const order = { Alta: 0, Média: 1, Baixa: 2 }
    return order[a.gravidade] - order[b.gravidade]
  })
}

// ─── Helpers visuais ──────────────────────────────────────────────────────────

function GravidadeBadge({ gravidade }: { gravidade: AlertaGrav }) {
  const map = {
    Alta:  'bg-red-100 text-red-700 border-red-200',
    Média: 'bg-amber-100 text-amber-700 border-amber-200',
    Baixa: 'bg-blue-50 text-blue-600 border-blue-200',
  }
  return <Badge className={cn('text-[11px] font-semibold border', map[gravidade])}>{gravidade}</Badge>
}

function TipoIcon({ tipo }: { tipo: AlertaTipo }) {
  const map: Record<AlertaTipo, { icon: React.ElementType; cls: string }> = {
    Rota:     { icon: Route,          cls: 'text-blue-600 bg-blue-50' },
    Veículo:  { icon: Truck,          cls: 'text-amber-600 bg-amber-50' },
    Entrega:  { icon: MapPin,         cls: 'text-red-600 bg-red-50' },
    Sistema:  { icon: Settings,       cls: 'text-slate-500 bg-slate-100' },
  }
  const { icon: Icon, cls } = map[tipo]
  return (
    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', cls)}>
      <Icon className="w-4 h-4" />
    </div>
  )
}

function tempoRelativo(d: Date): string {
  const diff = Date.now() - d.getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'Agora'
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24)   return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  veiculos: any[]
  rotas: RotaEntrega[]
  onReload: () => void
}

export function RastreamentoAlertas({ veiculos, rotas, onReload }: Props) {
  const [search,       setSearch]       = useState('')
  const [filterTipo,   setFilterTipo]   = useState('todos')
  const [filterGrav,   setFilterGrav]   = useState('todos')
  const [filterStatus, setFilterStatus] = useState('Ativo')

  const alertas = useMemo(() => gerarAlertas(veiculos, rotas), [veiculos, rotas])

  const filtrados = alertas.filter((a) => {
    if (filterTipo   !== 'todos' && a.tipo      !== filterTipo)   return false
    if (filterGrav   !== 'todos' && a.gravidade !== filterGrav)   return false
    if (filterStatus !== 'todos' && a.status    !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      if (!a.titulo.toLowerCase().includes(q) && !a.descricao.toLowerCase().includes(q)) return false
    }
    return true
  })

  const ativos    = alertas.filter((a) => a.status === 'Ativo')
  const criticos  = ativos.filter((a) => a.gravidade === 'Alta')
  const medios    = ativos.filter((a) => a.gravidade === 'Média')
  const resolvidos = alertas.filter((a) => a.status === 'Resolvido')

  return (
    <div className="space-y-4">

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Alertas Ativos',   val: ativos.length,     icon: Bell,          cls: 'text-red-600',   bg: 'bg-red-50'    },
          { label: 'Críticos',          val: criticos.length,   icon: AlertTriangle, cls: 'text-orange-600',bg: 'bg-orange-50' },
          { label: 'Médios',            val: medios.length,     icon: Clock,         cls: 'text-amber-600', bg: 'bg-amber-50'  },
          { label: 'Resolvidos',        val: resolvidos.length, icon: CheckCircle,   cls: 'text-green-600', bg: 'bg-green-50'  },
        ].map(({ label, val, icon: Icon, cls, bg }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
                <Icon className={cn('w-5 h-5', cls)} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className={cn('text-xl font-bold', cls)}>{val}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Buscar alerta..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="Rota">Rota</SelectItem>
                <SelectItem value="Veículo">Veículo</SelectItem>
                <SelectItem value="Entrega">Entrega</SelectItem>
                <SelectItem value="Sistema">Sistema</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterGrav} onValueChange={setFilterGrav}>
              <SelectTrigger><SelectValue placeholder="Gravidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus} >
                <SelectTrigger className="flex-1"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>
              {(search || filterTipo !== 'todos' || filterGrav !== 'todos' || filterStatus !== 'Ativo') && (
                <Button variant="ghost" size="icon" className="flex-shrink-0 h-9 w-9 text-slate-400"
                  onClick={() => { setSearch(''); setFilterTipo('todos'); setFilterGrav('todos'); setFilterStatus('Ativo') }}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-400" />
            <p className="font-semibold text-slate-600">Nenhum alerta encontrado</p>
            <p className="text-sm text-slate-400 mt-1">
              {alertas.every((a) => a.status === 'Resolvido')
                ? 'Frota e rotas operando normalmente!'
                : 'Ajuste os filtros para ver todos os alertas.'}
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={onReload}>
              <RefreshCw className="w-3.5 h-3.5" />Recarregar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtrados.map((alerta) => (
            <Card
              key={alerta.id}
              className={cn(
                'border shadow-sm transition-shadow hover:shadow-md',
                alerta.gravidade === 'Alta'  ? 'border-red-200'    : '',
                alerta.gravidade === 'Média' ? 'border-amber-200'  : '',
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <TipoIcon tipo={alerta.tipo} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{alerta.titulo}</p>
                      <GravidadeBadge gravidade={alerta.gravidade} />
                      <Badge
                        className={cn(
                          'text-[11px] border',
                          alerta.status === 'Ativo'
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        )}
                      >
                        {alerta.status}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">{alerta.tipo}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{alerta.descricao}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tempoRelativo(alerta.tempo)}
                      </span>
                      {alerta.referencia && (
                        <span className="font-medium text-slate-500">{alerta.referencia}</span>
                      )}
                    </div>
                  </div>
                  {alerta.status === 'Ativo' && alerta.id !== 'ok-sistema' && (
                    <div className="flex-shrink-0">
                      <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={onReload}>
                        <RefreshCw className="w-3 h-3" />Ver
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-center text-slate-400 pt-1">
            {filtrados.length} alerta{filtrados.length !== 1 ? 's' : ''} exibido{filtrados.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
