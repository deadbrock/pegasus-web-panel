'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createContract, updateContract, type ContractRecord } from '@/services/contractsService'

export function ContractDialog({ open, onClose, contract, onSaved }: { open: boolean; onClose: () => void; contract?: ContractRecord | null; onSaved?: () => void }) {
  const [form, setForm] = useState<ContractRecord>({ nome: '', status: 'Ativo', custo_material: null })
  useEffect(() => {
    if (contract) setForm(contract)
    else setForm({ nome: '', status: 'Ativo', custo_material: null })
  }, [contract, open])

  const set = (k: keyof ContractRecord, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.nome.trim()) return
    if (contract?.id) await updateContract(String(contract.id), form)
    else await createContract(form)
    onSaved?.()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{contract ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
          <DialogDescription>Informe os dados do contrato</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input value={form.nome || ''} onChange={(e) => set('nome', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>CNPJ</Label>
            <Input value={form.cnpj || ''} onChange={(e) => set('cnpj', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={form.cidade || ''} onChange={(e) => set('cidade', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Input value={form.estado || ''} onChange={(e) => set('estado', e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Endereço</Label>
            <Input value={form.endereco || ''} onChange={(e) => set('endereco', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Início Vigência</Label>
            <Input type="date" value={form.inicio_vigencia ? form.inicio_vigencia.substring(0,10) : ''} onChange={(e) => set('inicio_vigencia', e.target.value ? new Date(e.target.value).toISOString() : null)} />
          </div>
          <div className="space-y-2">
            <Label>Fim Vigência</Label>
            <Input type="date" value={form.fim_vigencia ? form.fim_vigencia.substring(0,10) : ''} onChange={(e) => set('fim_vigencia', e.target.value ? new Date(e.target.value).toISOString() : null)} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status || 'Ativo'} onValueChange={(v) => set('status', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Suspenso">Suspenso</SelectItem>
                <SelectItem value="Encerrado">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Responsável</Label>
            <Input value={form.responsavel || ''} onChange={(e) => set('responsavel', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Custo de Material</Label>
            <Input type="number" inputMode="decimal" value={form.custo_material ?? ''} onChange={(e) => set('custo_material', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


