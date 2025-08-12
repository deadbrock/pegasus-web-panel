'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, Plus, Trash2, Package, FileText, Building2, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { NotaFiscal, NotaFiscalInsert, ItemNotaFiscal, ItemNotaFiscalInsert, Fornecedor } from '@/types/fiscal';
import { fiscalService } from '@/lib/services/fiscal-service';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

const notaFiscalSchema = z.object({
  numero: z.string().min(1, 'Número é obrigatório'),
  serie: z.string().min(1, 'Série é obrigatória'),
  fornecedor_id: z.string().min(1, 'Fornecedor é obrigatório'),
  data_emissao: z.string().min(1, 'Data de emissão é obrigatória'),
  data_vencimento: z.string().optional(),
  valor_total: z.number().min(0, 'Valor deve ser positivo'),
  valor_icms: z.number().min(0, 'ICMS deve ser positivo').optional(),
  tipo: z.enum(['entrada', 'saida']),
  observacoes: z.string().optional(),
  chave_acesso: z.string().optional(),
});

const itemSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidade: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  valor_unitario: z.number().min(0, 'Valor unitário deve ser positivo'),
  valor_total: z.number().min(0, 'Valor total deve ser positivo'),
  ncm: z.string().optional(),
  cfop: z.string().optional(),
});

type NotaFiscalFormData = z.infer<typeof notaFiscalSchema>;
type ItemFormData = z.infer<typeof itemSchema>;

interface NotaFiscalDialogProps {
  open: boolean;
  onClose: () => void;
  nota?: NotaFiscal | null;
}

export function NotaFiscalDialog({ open, onClose, nota }: NotaFiscalDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NotaFiscalFormData>({
    resolver: zodResolver(notaFiscalSchema),
  });

  const {
    register: registerItem,
    handleSubmit: handleSubmitItem,
    reset: resetItem,
    setValue: setValueItem,
    watch: watchItem,
    formState: { errors: errorsItem },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  const [items, setItems] = React.useState<ItemNotaFiscal[]>([]);
  const [showItemForm, setShowItemForm] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ItemNotaFiscal | null>(null);

  // Buscar fornecedores
  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => fiscalService.getFornecedores(),
  });

  // Buscar itens da nota se estiver editando
  const { data: notaItems = [] } = useQuery({
    queryKey: ['nota-items', nota?.id],
    queryFn: () => nota?.id ? fiscalService.getItensNotaFiscal(nota.id) : Promise.resolve([]),
    enabled: !!nota?.id,
  });

  // Mutation para salvar nota
  const saveMutation = useMutation({
    mutationFn: async (data: NotaFiscalFormData) => {
      if (nota?.id) {
        return fiscalService.updateNotaFiscal(nota.id, data);
      } else {
        return fiscalService.createNotaFiscal(data);
      }
    },
    onSuccess: (savedNota) => {
      // Salvar itens
      saveItems(savedNota.id);
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar nota fiscal',
        variant: 'destructive',
      });
    },
  });

  // Função para salvar itens
  const saveItems = async (notaId: string) => {
    try {
      // Deletar itens existentes se estiver editando
      if (nota?.id) {
        const existingItems = await fiscalService.getItensNotaFiscal(nota.id);
        for (const item of existingItems) {
          await fiscalService.deleteItemNotaFiscal(item.id);
        }
      }

      // Adicionar novos itens
      for (const item of items) {
        const itemData: ItemNotaFiscalInsert = {
          nota_fiscal_id: notaId,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
          ncm: item.ncm,
          cfop: item.cfop,
        };
        await fiscalService.addItemNotaFiscal(itemData);
      }

      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      queryClient.invalidateQueries({ queryKey: ['fiscal-stats'] });
      
      toast({
        title: 'Sucesso',
        description: `Nota fiscal ${nota ? 'atualizada' : 'criada'} com sucesso`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar itens da nota fiscal',
        variant: 'destructive',
      });
    }
  };

  // Resetar form quando abrir/fechar
  useEffect(() => {
    if (open) {
      if (nota) {
        reset({
          numero: nota.numero,
          serie: nota.serie,
          fornecedor_id: nota.fornecedor_id,
          data_emissao: nota.data_emissao,
          data_vencimento: nota.data_vencimento || '',
          valor_total: nota.valor_total,
          valor_icms: nota.valor_icms || 0,
          tipo: nota.tipo as 'entrada' | 'saida',
          observacoes: nota.observacoes || '',
          chave_acesso: nota.chave_acesso || '',
        });
      } else {
        reset({
          numero: '',
          serie: '',
          fornecedor_id: '',
          data_emissao: new Date().toISOString().split('T')[0],
          data_vencimento: '',
          valor_total: 0,
          valor_icms: 0,
          tipo: 'entrada',
          observacoes: '',
          chave_acesso: '',
        });
      }
      setItems([]);
      setShowItemForm(false);
      setEditingItem(null);
    }
  }, [open, nota, reset]);

  // Carregar itens quando nota mudar
  useEffect(() => {
    if (notaItems.length > 0) {
      setItems(notaItems);
    }
  }, [notaItems]);

  const onSubmit = (data: NotaFiscalFormData) => {
    if (items.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Adicione pelo menos um item à nota fiscal',
        variant: 'destructive',
      });
      return;
    }

    // Verificar se valor total bate com soma dos itens
    const totalItens = items.reduce((sum, item) => sum + item.valor_total, 0);
    if (Math.abs(totalItens - data.valor_total) > 0.01) {
      toast({
        title: 'Atenção',
        description: 'O valor total da nota deve ser igual à soma dos itens',
        variant: 'destructive',
      });
      return;
    }

    saveMutation.mutate(data);
  };

  const onSubmitItem = (data: ItemFormData) => {
    const newItem: ItemNotaFiscal = {
      id: editingItem?.id || Date.now().toString(),
      nota_fiscal_id: nota?.id || '',
      descricao: data.descricao,
      quantidade: data.quantidade,
      valor_unitario: data.valor_unitario,
      valor_total: data.valor_total,
      ncm: data.ncm,
      cfop: data.cfop,
      processado: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editingItem) {
      setItems(items.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      setItems([...items, newItem]);
    }

    // Atualizar valor total da nota
    const newTotal = editingItem 
      ? items.reduce((sum, item) => sum + (item.id === editingItem.id ? newItem.valor_total : item.valor_total), 0)
      : items.reduce((sum, item) => sum + item.valor_total, 0) + newItem.valor_total;
    
    setValue('valor_total', newTotal);

    resetItem();
    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleEditItem = (item: ItemNotaFiscal) => {
    setEditingItem(item);
    setValueItem('descricao', item.descricao);
    setValueItem('quantidade', item.quantidade);
    setValueItem('valor_unitario', item.valor_unitario);
    setValueItem('valor_total', item.valor_total);
    setValueItem('ncm', item.ncm || '');
    setValueItem('cfop', item.cfop || '');
    setShowItemForm(true);
  };

  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = items.find(item => item.id === itemId);
    const newItems = items.filter(item => item.id !== itemId);
    setItems(newItems);
    
    // Atualizar valor total
    const newTotal = newItems.reduce((sum, item) => sum + item.valor_total, 0);
    setValue('valor_total', newTotal);
  };

  // Calcular valor total do item automaticamente
  const quantidade = watchItem('quantidade') || 0;
  const valorUnitario = watchItem('valor_unitario') || 0;
  
  useEffect(() => {
    setValueItem('valor_total', quantidade * valorUnitario);
  }, [quantidade, valorUnitario, setValueItem]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {nota ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Dados Básicos
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  {...register('numero')}
                  error={errors.numero?.message}
                />
              </div>

              <div>
                <Label htmlFor="serie">Série *</Label>
                <Input
                  id="serie"
                  {...register('serie')}
                  error={errors.serie?.message}
                />
              </div>

              <div>
                <Label htmlFor="fornecedor_id">Fornecedor *</Label>
                <Select
                  value={watch('fornecedor_id')}
                  onValueChange={(value) => setValue('fornecedor_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map((fornecedor) => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.fornecedor_id && (
                  <span className="text-red-500 text-sm">{errors.fornecedor_id.message}</span>
                )}
              </div>

              <div>
                <Label htmlFor="data_emissao">Data de Emissão *</Label>
                <Input
                  id="data_emissao"
                  type="date"
                  {...register('data_emissao')}
                  error={errors.data_emissao?.message}
                />
              </div>

              <div>
                <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                <Input
                  id="data_vencimento"
                  type="date"
                  {...register('data_vencimento')}
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={watch('tipo')}
                  onValueChange={(value) => setValue('tipo', value as 'entrada' | 'saida')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor_total">Valor Total *</Label>
                <Input
                  id="valor_total"
                  type="number"
                  step="0.01"
                  {...register('valor_total', { valueAsNumber: true })}
                  error={errors.valor_total?.message}
                />
              </div>

              <div>
                <Label htmlFor="valor_icms">Valor ICMS</Label>
                <Input
                  id="valor_icms"
                  type="number"
                  step="0.01"
                  {...register('valor_icms', { valueAsNumber: true })}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="chave_acesso">Chave de Acesso</Label>
                <Input
                  id="chave_acesso"
                  {...register('chave_acesso')}
                  maxLength={44}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  {...register('observacoes')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Itens */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Itens ({items.length})
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowItemForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Form de item */}
              {showItemForm && (
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmitItem(onSubmitItem)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="item_descricao">Descrição *</Label>
                          <Input
                            id="item_descricao"
                            {...registerItem('descricao')}
                            error={errorsItem.descricao?.message}
                          />
                        </div>

                        <div>
                          <Label htmlFor="item_quantidade">Quantidade *</Label>
                          <Input
                            id="item_quantidade"
                            type="number"
                            step="0.01"
                            {...registerItem('quantidade', { valueAsNumber: true })}
                            error={errorsItem.quantidade?.message}
                          />
                        </div>

                        <div>
                          <Label htmlFor="item_valor_unitario">Valor Unitário *</Label>
                          <Input
                            id="item_valor_unitario"
                            type="number"
                            step="0.01"
                            {...registerItem('valor_unitario', { valueAsNumber: true })}
                            error={errorsItem.valor_unitario?.message}
                          />
                        </div>

                        <div>
                          <Label htmlFor="item_valor_total">Valor Total</Label>
                          <Input
                            id="item_valor_total"
                            type="number"
                            step="0.01"
                            {...registerItem('valor_total', { valueAsNumber: true })}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>

                        <div>
                          <Label htmlFor="item_ncm">NCM</Label>
                          <Input
                            id="item_ncm"
                            {...registerItem('ncm')}
                          />
                        </div>

                        <div>
                          <Label htmlFor="item_cfop">CFOP</Label>
                          <Input
                            id="item_cfop"
                            {...registerItem('cfop')}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" size="sm">
                          {editingItem ? 'Atualizar' : 'Adicionar'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowItemForm(false);
                            setEditingItem(null);
                            resetItem();
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Lista de itens */}
              {items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.descricao}</div>
                        <div className="text-sm text-gray-600">
                          Qtd: {item.quantidade} × {formatCurrency(item.valor_unitario)} = {formatCurrency(item.valor_total)}
                          {item.ncm && ` • NCM: ${item.ncm}`}
                          {item.cfop && ` • CFOP: ${item.cfop}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-right font-medium text-lg">
                    Total: {formatCurrency(items.reduce((sum, item) => sum + item.valor_total, 0))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum item adicionado
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending || items.length === 0}>
              {saveMutation.isPending ? 'Salvando...' : nota ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 