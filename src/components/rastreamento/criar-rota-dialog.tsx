'use client'

import { useEffect, useId, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Plus,
  Route,
  Trash2,
  Truck,
  User,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { criarRota, type CriarRotaPayload, type Parada } from '@/lib/services/rotas-service'
import { fetchMotoristas } from '@/lib/services/motoristas-service'
import { cn } from '@/lib/utils'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface PedidoRef {
  id: string
  numero_pedido: string
  supervisor_nome: string
  contrato_nome?: string
  contrato_endereco?: string
  urgencia: string
}

interface CriarRotaDialogProps {
  open: boolean
  onClose: () => void
  pedido: PedidoRef | null
  onSuccess?: () => void
}

type Motorista = { id: string; nome: string; cpf: string; telefone?: string; status: string }
type Veiculo   = { id: string; placa: string; marca?: string; modelo: string; tipo?: string; ano?: number }

// ─── Map Preview ─────────────────────────────────────────────────────────────

function MapPreview({ address }: { address: string }) {
  const encoded = encodeURIComponent(address)
  const gmapsEmbed = `https://maps.google.com/maps?q=${encoded}&output=embed`
  const gmapsLink  = `https://www.google.com/maps/search/?api=1&query=${encoded}`

  if (!address.trim()) {
    return (
      <div className="flex items-center justify-center bg-slate-100 rounded-xl h-48 border border-slate-200">
        <div className="text-center text-slate-400">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Informe o endereço de entrega para ver o mapa</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-slate-200">
        <iframe
          src={gmapsEmbed}
          width="100%"
          height="220"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa de entrega"
        />
      </div>
      <a
        href={gmapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
      >
        <ExternalLink className="w-3 h-3" />
        Abrir no Google Maps
      </a>
    </div>
  )
}

// ─── Paradas ─────────────────────────────────────────────────────────────────

function ParadasEditor({
  paradas,
  onChange,
}: {
  paradas: Parada[]
  onChange: (p: Parada[]) => void
}) {
  const uid = useId()

  function addParada() {
    onChange([...paradas, { id: `${Date.now()}`, endereco: '', descricao: '' }])
  }

  function removeParada(id: string) {
    onChange(paradas.filter((p) => p.id !== id))
  }

  function updateParada(id: string, field: keyof Parada, value: string) {
    onChange(paradas.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  return (
    <div className="space-y-2">
      {paradas.map((parada, idx) => (
        <div key={parada.id} className="flex gap-2 items-start">
          <div className="flex-shrink-0 w-6 h-6 mt-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
            {idx + 1}
          </div>
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Endereço da parada"
              value={parada.endereco}
              onChange={(e) => updateParada(parada.id, 'endereco', e.target.value)}
              id={`${uid}-stop-addr-${parada.id}`}
            />
            <Input
              placeholder="Descrição (opcional)"
              value={parada.descricao ?? ''}
              onChange={(e) => updateParada(parada.id, 'descricao', e.target.value)}
              className="text-sm"
              id={`${uid}-stop-desc-${parada.id}`}
            />
          </div>
          <button
            type="button"
            onClick={() => removeParada(parada.id)}
            className="mt-2 text-rose-400 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addParada}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <Plus className="w-4 h-4" />
        Adicionar parada
      </button>
    </div>
  )
}

// ─── Dialog Principal ─────────────────────────────────────────────────────────

export function CriarRotaDialog({ open, onClose, pedido, onSuccess }: CriarRotaDialogProps) {
  const { toast } = useToast()

  // Listas
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [veiculos,   setVeiculos]   = useState<Veiculo[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Campos do formulário
  const [pontoPartida,     setPontoPartida]     = useState('')
  const [enderecoEntrega,  setEnderecoEntrega]  = useState('')
  const [paradas,          setParadas]          = useState<Parada[]>([])
  const [destinatarioNome, setDestinatarioNome] = useState('')
  const [destinatarioTel,  setDestinatarioTel]  = useState('')
  const [destinatarioDoc,  setDestinatarioDoc]  = useState('')
  const [motoristaId,      setMotoristaId]      = useState('')
  const [veiculoId,        setVeiculoId]        = useState('')
  const [prioridade,       setPrioridade]       = useState<'Baixa'|'Normal'|'Alta'|'Urgente'>('Normal')
  const [dataPrevista,     setDataPrevista]     = useState('')
  const [distancia,        setDistancia]        = useState('')
  const [tempo,            setTempo]            = useState('')
  const [observacoes,      setObservacoes]      = useState('')

  const [saving, setSaving] = useState(false)

  // Pré-preencher endereço de entrega do pedido
  useEffect(() => {
    if (open && pedido) {
      setEnderecoEntrega(pedido.contrato_endereco ?? '')
    }
  }, [open, pedido])

  // Carregar motoristas e veículos
  useEffect(() => {
    if (!open) return
    setLoadingData(true)
    Promise.all([
      fetchMotoristas(),
      supabase.from('veiculos').select('id,placa,marca,modelo,tipo,ano,status').eq('status', 'Ativo').order('placa'),
    ]).then(([mots, { data: veics }]) => {
      setMotoristas(mots.filter((m) => m.status === 'Ativo'))
      setVeiculos(veics ?? [])
    }).catch(console.error).finally(() => setLoadingData(false))
  }, [open])

  function resetForm() {
    setPontoPartida(''); setEnderecoEntrega(''); setParadas([])
    setDestinatarioNome(''); setDestinatarioTel(''); setDestinatarioDoc('')
    setMotoristaId(''); setVeiculoId(''); setPrioridade('Normal')
    setDataPrevista(''); setDistancia(''); setTempo(''); setObservacoes('')
  }

  function handleClose() {
    if (saving) return
    resetForm()
    onClose()
  }

  async function handleSalvar() {
    if (!pedido) return
    if (!enderecoEntrega.trim()) {
      toast({ title: 'Campo obrigatório', description: 'Informe o endereço de entrega.', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const payload: CriarRotaPayload = {
        pedido_id:           pedido.id,
        ponto_partida:       pontoPartida.trim() || undefined,
        endereco_completo:   enderecoEntrega.trim(),
        paradas:             paradas.filter((p) => p.endereco.trim()),
        destinatario_nome:   destinatarioNome.trim() || undefined,
        destinatario_tel:    destinatarioTel.trim() || undefined,
        destinatario_doc:    destinatarioDoc.trim() || undefined,
        motorista_id:        motoristaId || undefined,
        veiculo_id:          veiculoId || undefined,
        prioridade,
        data_prevista_entrega: dataPrevista ? new Date(dataPrevista).toISOString() : undefined,
        distancia_est_km:    distancia ? parseFloat(distancia) : undefined,
        tempo_est_min:       tempo ? parseInt(tempo, 10) : undefined,
        observacoes:         observacoes.trim() || undefined,
        atribuido_por:       user?.email ?? 'Sistema',
      }

      await criarRota(payload)

      toast({
        title: 'Rota criada!',
        description: `Rota de entrega para o pedido ${pedido.numero_pedido} criada com sucesso.`,
      })

      resetForm()
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('[CriarRotaDialog]', err)
      toast({ title: 'Erro ao criar rota', description: 'Verifique os dados e tente novamente.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const URGENCIA_COLORS: Record<string, string> = {
    Urgente: 'text-red-700 bg-red-50 border-red-200',
    Alta:    'text-orange-700 bg-orange-50 border-orange-200',
    Média:   'text-blue-700 bg-blue-50 border-blue-200',
    Baixa:   'text-slate-600 bg-slate-50 border-slate-200',
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Route className="w-5 h-5 text-blue-600" />
            Criar Rota de Entrega
          </DialogTitle>
        </DialogHeader>

        {!pedido ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <AlertCircle className="w-6 h-6 mr-2" />Nenhum pedido selecionado.
          </div>
        ) : (
          <div className="space-y-6 py-2">

            {/* Info do pedido */}
            <div className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', URGENCIA_COLORS[pedido.urgencia] ?? URGENCIA_COLORS['Baixa'])}>
              <Package className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-sm">{pedido.numero_pedido}</p>
                <p className="text-xs mt-0.5">{pedido.supervisor_nome}</p>
                {pedido.contrato_nome && (
                  <p className="text-xs font-medium mt-0.5">Cliente: {pedido.contrato_nome}</p>
                )}
              </div>
              <span className="ml-auto text-xs font-bold whitespace-nowrap">{pedido.urgencia}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Coluna esquerda — Rota */}
              <div className="space-y-4">

                {/* Ponto de partida */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <Navigation className="w-3.5 h-3.5 text-blue-500" />
                    Ponto de partida
                  </Label>
                  <Input
                    placeholder="Ex: Rua das Palmeiras, 200 - São Paulo"
                    value={pontoPartida}
                    onChange={(e) => setPontoPartida(e.target.value)}
                  />
                </div>

                {/* Ponto de entrega */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    Endereço de entrega *
                  </Label>
                  <Input
                    placeholder="Ex: Av. Paulista, 1500 - São Paulo, SP"
                    value={enderecoEntrega}
                    onChange={(e) => setEnderecoEntrega(e.target.value)}
                  />
                  <p className="text-xs text-slate-400">Pré-preenchido com o endereço do contrato</p>
                </div>

                {/* Paradas */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Paradas intermediárias</Label>
                  <ParadasEditor paradas={paradas} onChange={setParadas} />
                </div>

                {/* Destinatário */}
                <div className="space-y-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />Dados do destinatário
                  </p>
                  <Input placeholder="Nome completo" value={destinatarioNome} onChange={(e) => setDestinatarioNome(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Telefone" value={destinatarioTel} onChange={(e) => setDestinatarioTel(e.target.value)} />
                    <Input placeholder="CPF / CNPJ" value={destinatarioDoc} onChange={(e) => setDestinatarioDoc(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Coluna direita — Mapa e atribuição */}
              <div className="space-y-4">

                {/* Mapa */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Visualização
                  </Label>
                  <MapPreview address={enderecoEntrega} />
                </div>

                {/* Motorista */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <User className="w-3.5 h-3.5 text-violet-500" />
                    Motorista <span className="text-slate-400 font-normal">(opcional)</span>
                  </Label>
                  {loadingData ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400 py-1">
                      <Loader2 className="w-4 h-4 animate-spin" />Carregando...
                    </div>
                  ) : (
                    <Select value={motoristaId} onValueChange={setMotoristaId}>
                      <SelectTrigger><SelectValue placeholder="Atribuir depois" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Atribuir depois</SelectItem>
                        {motoristas.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.nome} — {m.cpf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Veículo */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <Truck className="w-3.5 h-3.5 text-blue-500" />
                    Veículo <span className="text-slate-400 font-normal">(opcional)</span>
                  </Label>
                  {loadingData ? null : (
                    <Select value={veiculoId} onValueChange={setVeiculoId}>
                      <SelectTrigger><SelectValue placeholder="Atribuir depois" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Atribuir depois</SelectItem>
                        {veiculos.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.placa} — {v.marca} {v.modelo} {v.ano ? `(${v.ano})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Prioridade + Data prevista */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Prioridade</Label>
                    <Select value={prioridade} onValueChange={(v) => setPrioridade(v as typeof prioridade)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(['Baixa','Normal','Alta','Urgente'] as const).map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Data prevista</Label>
                    <Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
                  </div>
                </div>

                {/* Distância e tempo */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Distância estimada (km)</Label>
                    <Input type="number" min="0" step="0.1" placeholder="Ex: 15.5" value={distancia} onChange={(e) => setDistancia(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Tempo estimado (min)</Label>
                    <Input type="number" min="0" placeholder="Ex: 45" value={tempo} onChange={(e) => setTempo(e.target.value)} />
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Observações</Label>
                  <Textarea
                    placeholder="Instruções especiais, portaria, horário..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={handleClose} disabled={saving}>Cancelar</Button>
              <Button onClick={handleSalvar} disabled={saving} className="bg-blue-600 hover:bg-blue-700 gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Route className="w-4 h-4" />}
                {saving ? 'Criando...' : 'Criar Rota'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
