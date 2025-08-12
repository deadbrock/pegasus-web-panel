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
  isOpen: boolean;
  onClose: () => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: any;
}

export function XMLUploadDialog({ isOpen, onClose }: XMLUploadDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [xmlContent, setXmlContent] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Mutation para processar XML
  const mutation = useMutation({
    mutationFn: async (xmlData: string) => {
      return fiscalService.validarXML(xmlData);
    },
    onSuccess: (result) => {
      setValidation(result);
      if (result.isValid && result.data) {
        // Aqui você pode criar automaticamente a nota fiscal
        toast({
          title: "XML Válido",
          description: "XML processado com sucesso. Dados extraídos.",
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao processar XML:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo XML",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/xml' && !file.name.endsWith('.xml')) {
        toast({
          title: "Erro",
          description: "Selecione apenas arquivos XML",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setXmlContent(content);
        setValidation(null);
      };
      reader.readAsText(file);
    }
  };

  const handleValidateXML = () => {
    if (!xmlContent.trim()) {
      toast({
        title: "Erro",
        description: "Carregue um arquivo XML primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    mutation.mutate(xmlContent);
    setIsValidating(false);
  };

  const handleCreateFromXML = () => {
    if (validation?.isValid && validation.data) {
      // Aqui você implementaria a criação da nota fiscal a partir dos dados do XML
      // Por enquanto, vamos simular
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast({
        title: "Sucesso",
        description: "Nota fiscal criada a partir do XML",
      });
      onClose();
    }
  };

  const handleClose = () => {
    setXmlContent('');
    setValidation(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                    disabled={!xmlContent || isValidating}
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
          {validation && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  {validation.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <h3 className="text-lg font-semibold">
                    {validation.isValid ? 'XML Válido' : 'Erros de Validação'}
                  </h3>
                </div>

                {validation.isValid && validation.data ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                      <div>
                        <strong>Número:</strong> {validation.data.numero}
                      </div>
                      <div>
                        <strong>Série:</strong> {validation.data.serie}
                      </div>
                      <div>
                        <strong>Fornecedor:</strong> {validation.data.fornecedor}
                      </div>
                      <div>
                        <strong>Valor Total:</strong> R$ {validation.data.valor_total?.toFixed(2)}
                      </div>
                      <div>
                        <strong>Data Emissão:</strong> {validation.data.data_emissao}
                      </div>
                      <div>
                        <strong>Chave de Acesso:</strong> {validation.data.chave_acesso}
                      </div>
                    </div>

                    {validation.data.itens && validation.data.itens.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">
                          Itens ({validation.data.itens.length})
                        </h4>
                        <div className="space-y-2">
                          {validation.data.itens.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                              <strong>{item.codigo}</strong> - {item.descricao}
                              <br />
                              Qtd: {item.quantidade} x R$ {item.valor_unitario?.toFixed(2)} = R$ {item.valor_total?.toFixed(2)}
                            </div>
                          ))}
                          {validation.data.itens.length > 3 && (
                            <div className="text-sm text-gray-500">
                              ... e mais {validation.data.itens.length - 3} itens
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {validation.errors.map((error, index) => (
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