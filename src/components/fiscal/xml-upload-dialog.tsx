"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { fiscalService } from '@/lib/services/fiscal-service';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface XMLUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

export function XMLUploadDialog({ open, onClose }: XMLUploadDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [xmlContent, setXmlContent] = useState('');
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [dados, setDados] = useState<any | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      return fiscalService.validarXML(file);
    },
    onSuccess: (result) => {
      if (result) {
        setDados(result);
        setErrors([]);
        toast({ title: 'XML Válido', description: 'XML processado com sucesso.' });
      } else {
        setDados(null);
        setErrors(['XML inválido ou não processado.']);
      }
    },
    onError: (error) => {
      console.error('Erro ao processar XML:', error);
      setDados(null);
      setErrors(['Erro ao processar arquivo XML']);
      toast({ title: 'Erro', description: 'Erro ao processar arquivo XML', variant: 'destructive' });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/xml' && !file.name.endsWith('.xml')) {
        toast({ title: 'Erro', description: 'Selecione apenas arquivos XML', variant: 'destructive' });
        return;
      }
      setFileObj(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setXmlContent(content);
        setDados(null);
        setErrors([]);
      };
      reader.readAsText(file);
    }
  };

  const handleValidateXML = () => {
    if (!fileObj) {
      toast({ title: 'Erro', description: 'Carregue um arquivo XML primeiro', variant: 'destructive' });
      return;
    }
    setIsValidating(true);
    mutation.mutate(fileObj);
    setIsValidating(false);
  };

  const handleCreateFromXML = () => {
    if (dados) {
      // Aqui poderíamos criar a NF com fiscalService.createNotaFiscal + itens.
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast({ title: 'Sucesso', description: 'Nota fiscal criada a partir do XML (simulado).' });
      onClose();
    }
  };

  const handleClose = () => {
    setXmlContent('');
    setDados(null);
    setErrors([]);
    setFileObj(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de XML - Nota Fiscal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload do arquivo */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Selecionar Arquivo XML</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".xml"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleValidateXML}
                    disabled={!fileObj || isValidating}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isValidating ? 'Validando...' : 'Validar XML'}
                  </Button>
                </div>

                {xmlContent && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Conteúdo do XML</label>
                    <Textarea
                      value={xmlContent}
                      onChange={(e) => setXmlContent(e.target.value)}
                      placeholder="Cole o conteúdo XML aqui ou use o upload acima..."
                      rows={8}
                      className="font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resultado da validação */}
          {(dados || errors.length) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  {dados ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <h3 className="text-lg font-semibold">
                    {dados ? 'XML Válido' : 'Erros de Validação'}
                  </h3>
                </div>

                {dados ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                      <div>
                        <strong>Número:</strong> {dados.numero}
                      </div>
                      <div>
                        <strong>Série:</strong> {dados.serie}
                      </div>
                      <div>
                        <strong>Fornecedor:</strong> {dados.fornecedor}
                      </div>
                      <div>
                        <strong>Valor Total:</strong> R$ {dados.valor_total?.toFixed(2)}
                      </div>
                      <div>
                        <strong>Data Emissão:</strong> {dados.data_emissao}
                      </div>
                      <div>
                        <strong>Chave de Acesso:</strong> {dados.chave_acesso}
                      </div>
                    </div>

                    {dados.itens && dados.itens.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">
                          Itens ({dados.itens.length})
                        </h4>
                        <div className="space-y-2">
                          {dados.itens.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                              <strong>{item.codigo}</strong> - {item.descricao}
                              <br />
                              Qtd: {item.quantidade} x R$ {item.valor_unitario?.toFixed(2)} = R$ {item.valor_total?.toFixed(2)}
                            </div>
                          ))}
                          {dados.itens.length > 3 && (
                            <div className="text-sm text-gray-500">
                              ... e mais {dados.itens.length - 3} itens
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instruções */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3">Instruções</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Selecione um arquivo XML de nota fiscal eletrônica (NF-e)</p>
                <p>• O sistema irá validar a estrutura e extrair os dados principais</p>
                <p>• Após a validação, você pode criar automaticamente a nota fiscal</p>
                <p>• Formatos aceitos: .xml</p>
                <p>• Tamanho máximo: 5MB</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {validation?.isValid && (
            <Button onClick={handleCreateFromXML}>
              Criar Nota Fiscal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 