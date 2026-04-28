'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, XCircle, ClipboardList, ChevronDown } from 'lucide-react'

// ─── Causas pré-definidas ────────────────────────────────────────────────────

export const CAUSAS_REPROVACAO = [
  'Itens indisponíveis no estoque',
  'Quantidade solicitada inviável',
  'Materiais não autorizados para este setor',
  'Pedido duplicado',
  'Documentação / informações incompletas',
  'Urgência não justificada',
  'Orçamento insuficiente',
  'Outro',
] as const

export type CausaReprovacao = (typeof CAUSAS_REPROVACAO)[number]

// ─── Props ───────────────────────────────────────────────────────────────────

interface ReprovacaoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  numeroPedido: string
  solicitanteNome?: string
  /** Quem está reprovando (nome do usuário logado) */
  reprovadoPor: string
  /** Título contextual: "ao Encarregado" | "ao Supervisor" */
  contexto?: 'encarregado' | 'supervisor'
  onConfirm: (causa: string, ajustes: string) => Promise<void>
  loading?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ReprovacaoDialog({
  open,
  onOpenChange,
  numeroPedido,
  solicitanteNome,
  reprovadoPor,
  contexto = 'supervisor',
  onConfirm,
  loading = false,
}: ReprovacaoDialogProps) {
  const [causaSelecionada, setCausaSelecionada] = useState<string>('')
  const [causaOutro, setCausaOutro] = useState('')
  const [ajustes, setAjustes] = useState('')
  const [erros, setErros] = useState<{ causa?: string; ajustes?: string }>({})

  const isOutro = causaSelecionada === 'Outro'

  const causaFinal = isOutro ? causaOutro.trim() : causaSelecionada

  function validar(): boolean {
    const e: typeof erros = {}
    if (!causaSelecionada) e.causa = 'Selecione a causa da reprovação'
    if (isOutro && !causaOutro.trim()) e.causa = 'Descreva a causa da reprovação'
    if (!ajustes.trim()) e.ajustes = 'Informe os ajustes necessários para reenvio'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleConfirmar() {
    if (!validar()) return
    await onConfirm(causaFinal, ajustes.trim())
    handleClose()
  }

  function handleClose() {
    setCausaSelecionada('')
    setCausaOutro('')
    setAjustes('')
    setErros({})
    onOpenChange(false)
  }

  const contextoLabel =
    contexto === 'encarregado' ? 'Reprovação ao Encarregado' : 'Reprovação ao Supervisor'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <XCircle className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <DialogTitle className="text-rose-700">{contextoLabel}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Pedido{' '}
                <Badge variant="outline" className="text-xs font-mono">
                  {numeroPedido}
                </Badge>
                {solicitanteNome && (
                  <span className="ml-1">— {solicitanteNome}</span>
                )}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* ── Alerta informativo ─────────────────────────────────────── */}
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
          <span>
            O solicitante será notificado com a causa e os ajustes necessários
            para que possa corrigir e reenviar o pedido.
          </span>
        </div>

        {/* ── Formulário ─────────────────────────────────────────────── */}
        <div className="space-y-4 py-1">

          {/* Causa */}
          <div className="space-y-1.5">
            <Label htmlFor="causa" className="flex items-center gap-1.5">
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              Causa da Reprovação
              <span className="text-rose-500">*</span>
            </Label>
            <Select value={causaSelecionada} onValueChange={setCausaSelecionada}>
              <SelectTrigger
                id="causa"
                className={erros.causa && !isOutro ? 'border-rose-400' : ''}
              >
                <SelectValue placeholder="Selecione uma causa..." />
              </SelectTrigger>
              <SelectContent>
                {CAUSAS_REPROVACAO.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isOutro && (
              <Textarea
                placeholder="Descreva a causa..."
                value={causaOutro}
                onChange={(e) => setCausaOutro(e.target.value)}
                rows={2}
                className={`mt-1.5 resize-none text-sm ${erros.causa ? 'border-rose-400' : ''}`}
              />
            )}

            {erros.causa && (
              <p className="text-xs text-rose-500">{erros.causa}</p>
            )}
          </div>

          {/* Ajustes necessários */}
          <div className="space-y-1.5">
            <Label htmlFor="ajustes" className="flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
              Ajustes Necessários
              <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="ajustes"
              placeholder="Descreva o que o solicitante precisa corrigir ou ajustar para reenvio do pedido..."
              value={ajustes}
              onChange={(e) => setAjustes(e.target.value)}
              rows={4}
              className={`resize-none text-sm ${erros.ajustes ? 'border-rose-400' : ''}`}
            />
            {erros.ajustes && (
              <p className="text-xs text-rose-500">{erros.ajustes}</p>
            )}
          </div>

          {/* Reprovado por */}
          <div className="rounded-md bg-slate-50 border px-3 py-2 text-xs text-muted-foreground">
            Reprovado por: <span className="font-medium text-foreground">{reprovadoPor}</span>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmar}
            disabled={loading}
            className="gap-1.5"
          >
            <XCircle className="h-4 w-4" />
            {loading ? 'Reprovando...' : 'Reprovar Pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Read-only: exibe os detalhes da reprovação no card ───────────────────────

interface ReprovacaoInfoProps {
  causa?: string | null
  ajustes?: string | null
  reprovadoPor?: string | null
  className?: string
}

export function ReprovacaoInfo({
  causa,
  ajustes,
  reprovadoPor,
  className = '',
}: ReprovacaoInfoProps) {
  if (!causa && !ajustes) return null

  return (
    <div
      className={`rounded-lg border border-rose-200 bg-rose-50 p-3 space-y-2 text-sm ${className}`}
    >
      <div className="flex items-center gap-1.5 text-rose-700 font-medium">
        <XCircle className="h-4 w-4" />
        Reprovação
        {reprovadoPor && (
          <span className="ml-auto text-xs font-normal text-rose-500">
            por {reprovadoPor}
          </span>
        )}
      </div>

      {causa && (
        <div>
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-0.5">
            Causa
          </p>
          <p className="text-rose-800">{causa}</p>
        </div>
      )}

      {ajustes && (
        <div>
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-0.5">
            Ajustes Necessários
          </p>
          <p className="text-rose-800">{ajustes}</p>
        </div>
      )}
    </div>
  )
}
