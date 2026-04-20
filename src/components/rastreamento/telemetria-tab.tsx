'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Fuel, Route, TrendingUp, Wallet, Plus, Trash2, Loader2, X, Car,
} from 'lucide-react'
import {
  fetchTelemetriaStats,
  fetchViagens,
  fetchAbastecimentos,
  createAbastecimento,
  deleteAbastecimento,
  type Viagem,
  type Abastecimento,
  type TelemetriaStats,
  type NovoAbastecimento,
} from '@/lib/services/telemetria-service'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number, decimals = 1) => n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

function duracao(inicio: string, fim?: string) {
  const ms = new Date(fim ?? new Date()).getTime() - new Date(inicio).getTime()
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, color }: {
  title: string; value: string; sub: string; icon: any; color: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Form de Abastecimento ────────────────────────────────────────────────────

const EMPTY_FORM: Partial<NovoAbastecimento> = {
  tipo_combustivel: 'Diesel',
  data: new Date().toISOString().substring(0, 16),
}

function AbastecimentoForm({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<NovoAbastecimento>>(EMPTY_FORM)
  const set = (k: keyof NovoAbastecimento, v: any) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.litros || form.litros <= 0) return alert('Informe a quantidade de litros.')
    setSaving(true)
    const ok = await createAbastecimento({
      ...form,
      litros: Number(form.litros),
      valor_total: form.valor_total ? Number(form.valor_total) : undefined,
      km_atual: form.km_atual ? Number(form.km_atual) : undefined,
      data: form.data ?? new Date().toISOString(),
    } as NovoAbastecimento)
    setSaving(false)
    if (ok) { setOpen(false); setForm(EMPTY_FORM); onSaved() }
    else alert('Erro ao salvar abastecimento.')
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />Registrar Abastecimento
      </Button>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2"><Fuel className="w-4 h-4" />Novo Abastecimento</span>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}><X className="w-4 h-4" /></Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Data/Hora *</Label>
            <Input type="datetime-local" value={form.data?.substring(0, 16) ?? ''} onChange={e => set('data', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Veículo (placa/modelo)</Label>
            <Input placeholder="ex: ABC-1234" value={form.veiculo_info ?? ''} onChange={e => set('veiculo_info', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Motorista</Label>
            <Input placeholder="Nome do motorista" value={form.motorista_nome ?? ''} onChange={e => set('motorista_nome', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Litros *</Label>
            <Input type="number" min="0" step="0.001" placeholder="0.000" value={form.litros ?? ''} onChange={e => set('litros', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Valor Total (R$)</Label>
            <Input type="number" min="0" step="0.01" placeholder="0,00" value={form.valor_total ?? ''} onChange={e => set('valor_total', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hodômetro (km)</Label>
            <Input type="number" min="0" placeholder="ex: 125400" value={form.km_atual ?? ''} onChange={e => set('km_atual', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Combustível</Label>
            <Select value={form.tipo_combustivel ?? 'Diesel'} onValueChange={v => set('tipo_combustivel', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Diesel', 'Gasolina', 'Etanol', 'GNV', 'Flex'].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Posto</Label>
            <Input placeholder="Nome do posto" value={form.posto ?? ''} onChange={e => set('posto', e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-1">
            <Label className="text-xs">Observações</Label>
            <Input placeholder="Opcional" value={form.observacoes ?? ''} onChange={e => set('observacoes', e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Periodo = '7d' | '30d' | '90d' | 'total'

const periodos: { label: string; value: Periodo }[] = [
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
  { label: 'Total', value: 'total' },
]

function periodoToDate(p: Periodo): string | undefined {
  if (p === 'total') return undefined
  const d = new Date()
  d.setDate(d.getDate() - parseInt(p))
  return d.toISOString()
}

export function TelemetriaTab() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [stats, setStats] = useState<TelemetriaStats | null>(null)
  const [viagens, setViagens] = useState<Viagem[]>([])
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const inicio = periodoToDate(periodo)
    const [s, v, a] = await Promise.all([
      fetchTelemetriaStats(),
      fetchViagens({ status: 'finalizada', data_inicio: inicio }),
      fetchAbastecimentos({ data_inicio: inicio }),
    ])
    setStats(s)
    setViagens(v)
    setAbastecimentos(a)
    setLoading(false)
  }

  useEffect(() => { load() }, [periodo])

  const handleDeleteAbastec = async (id: string) => {
    if (!confirm('Excluir este abastecimento?')) return
    setDeletingId(id)
    const ok = await deleteAbastecimento(id)
    setDeletingId(null)
    if (ok) setAbastecimentos(prev => prev.filter(a => a.id !== id))
    else alert('Erro ao excluir.')
  }

  return (
    <div className="space-y-6">
      {/* Período */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Período:</span>
        {periodos.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              periodo === p.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="KM Percorridos (mês)"
            value={`${fmt(stats?.km_mes ?? 0, 0)} km`}
            sub={`Total: ${fmt(stats?.km_total ?? 0, 0)} km`}
            icon={Route}
            color="bg-blue-500"
          />
          <KpiCard
            title="Litros Abastecidos (mês)"
            value={`${fmt(stats?.litros_mes ?? 0)} L`}
            sub={`Total: ${fmt(stats?.litros_total ?? 0)} L`}
            icon={Fuel}
            color="bg-green-500"
          />
          <KpiCard
            title="Gasto com Combustível (mês)"
            value={fmtBRL(stats?.custo_mes ?? 0)}
            sub={`Total: ${fmtBRL(stats?.custo_total ?? 0)}`}
            icon={Wallet}
            color="bg-orange-500"
          />
          <KpiCard
            title="Custo por KM"
            value={`R$ ${fmt(stats?.custo_por_km ?? 0, 2)}`}
            sub={`${stats?.total_viagens ?? 0} jornadas · média ${fmt(stats?.media_km_viagem ?? 0, 0)} km`}
            icon={TrendingUp}
            color="bg-purple-500"
          />
        </div>
      )}

      {/* Jornadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Car className="w-4 h-4" />
            Jornadas GPS ({viagens.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viagens.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Nenhuma jornada registrada no período.<br />
              <span className="text-xs">As jornadas são iniciadas pelo app mobile do motorista.</span>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500 text-xs">
                    <th className="pb-2 pr-4">Motorista</th>
                    <th className="pb-2 pr-4">Veículo</th>
                    <th className="pb-2 pr-4">Início</th>
                    <th className="pb-2 pr-4">Duração</th>
                    <th className="pb-2 pr-4 text-right">KM</th>
                  </tr>
                </thead>
                <tbody>
                  {viagens.map(v => (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium">{v.motorista_nome ?? '—'}</td>
                      <td className="py-2 pr-4 text-gray-600">{v.veiculo_info ?? '—'}</td>
                      <td className="py-2 pr-4 text-gray-600">{fmtDate(v.data_inicio)}</td>
                      <td className="py-2 pr-4 text-gray-600">{duracao(v.data_inicio, v.data_fim)}</td>
                      <td className="py-2 text-right font-semibold text-blue-600">{fmt(v.km_percorrido, 1)} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abastecimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><Fuel className="w-4 h-4" />Abastecimentos ({abastecimentos.length})</span>
            <AbastecimentoForm onSaved={load} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {abastecimentos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Nenhum abastecimento registrado no período.<br />
              <span className="text-xs">Clique em "Registrar Abastecimento" para adicionar.</span>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500 text-xs">
                    <th className="pb-2 pr-4">Data</th>
                    <th className="pb-2 pr-4">Veículo</th>
                    <th className="pb-2 pr-4">Motorista</th>
                    <th className="pb-2 pr-4">Tipo</th>
                    <th className="pb-2 pr-4 text-right">Litros</th>
                    <th className="pb-2 pr-4 text-right">Valor</th>
                    <th className="pb-2 pr-4 text-right">R$/L</th>
                    <th className="pb-2 pr-4 text-right">Hodômetro</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {abastecimentos.map(a => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 pr-4 text-gray-600">{fmtDate(a.data)}</td>
                      <td className="py-2 pr-4 font-medium">{a.veiculo_info ?? '—'}</td>
                      <td className="py-2 pr-4 text-gray-600">{a.motorista_nome ?? '—'}</td>
                      <td className="py-2 pr-4">
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                          {a.tipo_combustivel ?? 'Diesel'}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right font-semibold">{fmt(a.litros, 3)} L</td>
                      <td className="py-2 pr-4 text-right text-green-700 font-semibold">
                        {a.valor_total != null ? fmtBRL(a.valor_total) : '—'}
                      </td>
                      <td className="py-2 pr-4 text-right text-gray-500">
                        {a.valor_litro != null ? `R$ ${fmt(a.valor_litro, 3)}` : '—'}
                      </td>
                      <td className="py-2 pr-4 text-right text-gray-500">
                        {a.km_atual != null ? `${a.km_atual.toLocaleString('pt-BR')} km` : '—'}
                      </td>
                      <td className="py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                          disabled={deletingId === a.id}
                          onClick={() => handleDeleteAbastec(a.id)}
                        >
                          {deletingId === a.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Trash2 className="w-3 h-3" />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
