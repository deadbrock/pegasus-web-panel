"use client"
import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { supabase } from '@/lib/supabaseClient'

type Documento = { id: number; titulo: string; tipo: string; arquivo_url: string; usuario_id: number }

export default function DocumentosPage() {
	const [docs, setDocs] = useState<Documento[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [tipo, setTipo] = useState<string>('')
	const [titulo, setTitulo] = useState('')
	const [tipoNovo, setTipoNovo] = useState('financeiro')
	const [file, setFile] = useState<File | null>(null)
	const [uploading, setUploading] = useState(false)

	const load = async () => {
		setLoading(true)
		setError(null)
		try {
			const url = tipo ? `documentos?tipo=${encodeURIComponent(tipo)}` : 'documentos'
			const res = await apiFetch(url)
			const data = await res.json()
			setDocs(data)
		} catch (e: any) {
			setError(e?.message || 'Erro ao carregar documentos')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [tipo])

	const onUpload = async () => {
		if (!file || !titulo) return
		setUploading(true)
		setError(null)
		try {
			const path = `${Date.now()}_${file.name}`
			const { error: upErr } = await supabase.storage.from('documentos').upload(path, file, { upsert: false })
			if (upErr) throw upErr
			const { data: pub } = supabase.storage.from('documentos').getPublicUrl(path)
			const arquivo_url = pub.publicUrl
			const res = await apiFetch('documentos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ titulo, tipo: tipoNovo, arquivo_url })
			})
			if (!res.ok) throw new Error('Falha ao registrar documento')
			setTitulo('')
			setTipoNovo('financeiro')
			setFile(null)
			await load()
		} catch (e: any) {
			setError(e?.message || 'Erro ao enviar documento')
		} finally {
			setUploading(false)
		}
	}

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Documentos</h1>
			{loading && <div>Carregando...</div>}
			{error && <div className="text-red-500">{error}</div>}

			<div className="bg-white p-4 rounded border space-y-4">
				<div className="flex items-center gap-2">
					<select className="border rounded px-2 py-1" value={tipo} onChange={e=>setTipo(e.target.value)}>
						<option value="">Todos os tipos</option>
						<option value="financeiro">Financeiro</option>
						<option value="fiscal">Fiscal</option>
						<option value="logistica">Logística</option>
					</select>
				</div>

				<table className="w-full text-sm">
					<thead>
						<tr className="text-left">
							<th>Título</th>
							<th>Tipo</th>
							<th>Arquivo</th>
						</tr>
					</thead>
					<tbody>
						{docs.map(d => (
							<tr key={d.id} className="border-t">
								<td className="py-2">{d.titulo}</td>
								<td>{d.tipo}</td>
								<td>
									<a className="text-blue-600 hover:underline" href={d.arquivo_url} target="_blank">Abrir</a>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="bg-white p-4 rounded border space-y-3">
				<h2 className="font-medium">Novo Documento</h2>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
					<input className="border rounded px-2 py-1" placeholder="Título" value={titulo} onChange={e=>setTitulo(e.target.value)} />
					<select className="border rounded px-2 py-1" value={tipoNovo} onChange={e=>setTipoNovo(e.target.value)}>
						<option value="financeiro">Financeiro</option>
						<option value="fiscal">Fiscal</option>
						<option value="logistica">Logística</option>
					</select>
					<input type="file" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
					<button className="px-3 py-1 border rounded" onClick={onUpload} disabled={uploading}>{uploading ? 'Enviando...' : 'Enviar'}</button>
				</div>
			</div>
		</div>
	)
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  FileCheck, 
  Upload,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  Shield
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { DocumentsTable } from '@/components/documentos/documents-table'
import { DocumentDialog } from '@/components/documentos/document-dialog'
import { DocumentAlertsPanel } from '@/components/documentos/document-alerts-panel'
import { DocumentsOverview } from '@/components/documentos/documents-overview'
import { DocumentTypesChart } from '@/components/documentos/document-types-chart'
import { ExpirationChart } from '@/components/documentos/expiration-chart'

export default function DocumentosPage() {
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)

  const handleNewDocument = () => {
    setSelectedDocument(null)
    setIsDocumentDialogOpen(true)
  }

  const handleEditDocument = (document: any) => {
    setSelectedDocument(document)
    setIsDocumentDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Documentos</h1>
          <p className="text-gray-600 mt-1">
            Controle de documentos, certificados e vencimentos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload em Lote
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </Button>
          <Button onClick={handleNewDocument}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Documento
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Documentos"
          value="89"
          change="+12"
          changeType="positive"
          icon={FileCheck}
          description="Registrados"
        />
        <MetricCard
          title="Documentos Válidos"
          value="76"
          change="+8"
          changeType="positive"
          icon={CheckCircle}
          description="85% do total"
        />
        <MetricCard
          title="Vencendo em 30 dias"
          value="8"
          change="+3"
          changeType="negative"
          icon={AlertTriangle}
          description="Requer atenção"
        />
        <MetricCard
          title="Documentos Vencidos"
          value="5"
          change="-2"
          changeType="positive"
          icon={Clock}
          description="Urgente"
        />
      </div>

      {/* Document Management Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertas Prioritários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Alertas Prioritários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">CNH de João Silva</p>
                        <p className="text-sm text-red-600">Vencida há 5 dias</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Renovar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-800">CRLV BRA-2023</p>
                        <p className="text-sm text-orange-600">Vence em 3 dias</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Visualizar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Seguro da Frota</p>
                        <p className="text-sm text-yellow-600">Vence em 15 dias</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Verificar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visão Geral dos Documentos */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentTypesChart />
              </CardContent>
            </Card>

            {/* Cronograma de Vencimentos */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Cronograma de Vencimentos - Próximos 90 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExpirationChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Documentos</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Por Vencimento
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DocumentsTable onEdit={handleEditDocument} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <DocumentAlertsPanel />
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Documentos por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">CNH (Carteira Nacional)</p>
                        <p className="text-sm text-gray-600">Habilitações dos motoristas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">18</p>
                      <p className="text-sm text-gray-600">3 vencendo</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">CRLV (Documento do Veículo)</p>
                        <p className="text-sm text-gray-600">Certificados de registro</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">20</p>
                      <p className="text-sm text-gray-600">2 vencendo</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Seguro</p>
                        <p className="text-sm text-gray-600">Apólices de seguro</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">25</p>
                      <p className="text-sm text-gray-600">1 vencendo</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium">ANTT</p>
                        <p className="text-sm text-gray-600">Registro na ANTT</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">12</p>
                      <p className="text-sm text-gray-600">1 vencendo</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Outros</p>
                        <p className="text-sm text-gray-600">Documentos diversos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">14</p>
                      <p className="text-sm text-gray-600">1 vencendo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentsOverview />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Documental</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Conformidade</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[85%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">76 de 89 documentos válidos</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Renovação em Dia</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[92%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: 95%</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Alertas Atendidos</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full w-[78%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Precisa melhorar</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Renovações */}
            <Card>
              <CardHeader>
                <CardTitle>Renovações dos Últimos 6 Meses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Janeiro</span>
                    <span className="font-medium">8 renovações</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fevereiro</span>
                    <span className="font-medium">12 renovações</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Março</span>
                    <span className="font-medium">6 renovações</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Abril</span>
                    <span className="font-medium">15 renovações</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Maio</span>
                    <span className="font-medium">9 renovações</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Junho</span>
                    <span className="font-medium">11 renovações</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Relatório de Vencimentos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Compliance Documental
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Documentos por Categoria
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Histórico de Renovações
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Auditoria de Documentos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">Urgente</span>
                    </div>
                    <p className="text-sm text-red-700">
                      5 documentos vencidos precisam ser renovados imediatamente
                    </p>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Esta Semana</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      8 documentos vencem nos próximos 30 dias
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Planejamento</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Configurar lembretes automáticos para próximas renovações
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Dialog */}
      <DocumentDialog
        open={isDocumentDialogOpen}
        onClose={() => setIsDocumentDialogOpen(false)}
        document={selectedDocument}
      />
    </div>
  )
} 