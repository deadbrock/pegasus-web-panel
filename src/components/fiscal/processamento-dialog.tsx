"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { fiscalService } from '@/lib/services/fiscal-service';
import { NotaFiscal } from '@/types/fiscal';
import { useToast } from '@/hooks/use-toast';
import { Settings, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ProcessamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notaFiscal: NotaFiscal | null;
}

export function ProcessamentoDialog({ isOpen, onClose, notaFiscal }: ProcessamentoDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [observacoes, setObservacoes] = useState('');
  const [etapasProcessamento, setEtapasProcessamento] = useState<
    Array<{ nome: string; status: 'pending' | 'processing' | 'completed' | 'error'; mensagem?: string }>
  >([]);

  // Mutation para processar nota fiscal
  const mutation = useMutation({
    mutationFn: async () => {
      if (!notaFiscal) throw new Error('Nota fiscal não encontrada');
      
      // Simular etapas de processamento
      const etapas = [
        { nome: 'Validação dos dados', status: 'pending' as const },
        { nome: 'Verificação de duplicatas', status: 'pending' as const },
        { nome: 'Cálculo de impostos', status: 'pending' as const },
        { nome: 'Atualização do estoque', status: 'pending' as const },
        { nome: 'Finalização', status: 'pending' as const }
      ];
      
      setEtapasProcessamento([...etapas]);

      // Processar cada etapa
      for (let i = 0; i < etapas.length; i++) {
        // Atualizar status para processando
        setEtapasProcessamento(prev => prev.map((etapa, index) => 
          index === i ? { ...etapa, status: 'processing' } : etapa
        ));

        // Simular tempo de processamento
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Atualizar status para completo
        setEtapasProcessamento(prev => prev.map((etapa, index) => 
          index === i ? { 
            ...etapa, 
            status: 'completed',
            mensagem: `${etapa.nome} concluída com sucesso`
          } : etapa
        ));
      }

      // Chamar serviço real
      return fiscalService.processarNotaFiscal(notaFiscal.id, observacoes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      queryClient.invalidateQueries({ queryKey: ['fiscal-stats'] });
      toast({
        title: "Sucesso",
        description: "Nota fiscal processada com sucesso",
      });
      setTimeout(() => onClose(), 2000); // Fechar após 2 segundos
    },
    onError: (error) => {
      console.error('Erro ao processar nota fiscal:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar nota fiscal",
        variant: "destructive",
      });
    }
  });

  const handleProcessar = () => {
    mutation.mutate();
  };

  const handleClose = () => {
    setObservacoes('');
    setEtapasProcessamento([]);
    onClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Processar Nota Fiscal
          </DialogTitle>
        </DialogHeader>

        {notaFiscal && (
          <div className="space-y-6">
            {/* Informações da nota */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3">Dados da Nota</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Número/Série:</strong> {notaFiscal.numero}/{notaFiscal.serie}
                  </div>
                  <div>
                    <strong>Fornecedor:</strong> {notaFiscal.fornecedor?.razao_social}
                  </div>
                  <div>
                    <strong>Valor Total:</strong> R$ {notaFiscal.valor_total.toFixed(2)}
                  </div>
                  <div>
                    <strong>Status Atual:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      notaFiscal.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                      notaFiscal.status === 'processada' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {notaFiscal.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações do processamento */}
            {!mutation.isPending && !mutation.isSuccess && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Observações do Processamento</h3>
                  <Textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Adicione observações sobre o processamento (opcional)..."
                    rows={3}
                  />
                </CardContent>
              </Card>
            )}

            {/* Etapas do processamento */}
            {etapasProcessamento.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Progresso do Processamento</h3>
                  <div className="space-y-3">
                    {etapasProcessamento.map((etapa, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {getStatusIcon(etapa.status)}
                        <div className="flex-1">
                          <div className="font-medium">{etapa.nome}</div>
                          {etapa.mensagem && (
                            <div className="text-sm text-gray-600">{etapa.mensagem}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resultado do processamento */}
            {mutation.isSuccess && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-green-700">
                      Processamento Concluído
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>A nota fiscal foi processada com sucesso e está disponível no sistema.</p>
                    <p>Status atualizado para: <strong>Processada</strong></p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações sobre o processamento */}
            {!mutation.isPending && !mutation.isSuccess && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">O que será processado?</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Validação dos dados da nota fiscal</p>
                    <p>• Verificação de duplicatas no sistema</p>
                    <p>• Cálculo e validação de impostos</p>
                    <p>• Atualização automática do estoque (se aplicável)</p>
                    <p>• Atualização do status para "Processada"</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          {!mutation.isPending && !mutation.isSuccess && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleProcessar}>
                Processar Nota
              </Button>
            </>
          )}
          {mutation.isSuccess && (
            <Button onClick={handleClose}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 