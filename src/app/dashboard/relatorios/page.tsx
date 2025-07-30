'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Users,
  Truck,
  Package,
  Shield,
  Settings,
  Send,
  Clock,
  Eye,
  Share2
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { ReportsLibrary } from '@/components/relatorios/reports-library'
import { ReportBuilder } from '@/components/relatorios/report-builder'
import { ScheduledReports } from '@/components/relatorios/scheduled-reports'
import { ReportTemplates } from '@/components/relatorios/report-templates'
import { ReportsHistory } from '@/components/relatorios/reports-history'
import { ExecutiveDashboard } from '@/components/relatorios/executive-dashboard'

export default function RelatoriosPage() {
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQuickReport = async (type: string) => {
    setIsGenerating(true)
    // Simular geração de relatório
    setTimeout(() => {
      setIsGenerating(false)
      console.log(`Gerando relatório: ${type}`)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Central de Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Geração automática de relatórios executivos e operacionais
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Relatório
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Button 
            onClick={() => generateQuickReport('executivo')}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Relatório Executivo
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Relatórios Gerados"
          value="156"
          change="+12"
          changeType="positive"
          icon={FileText}
          description="Este mês"
        />
        <MetricCard
          title="Downloads"
          value="1.2k"
          change="+18%"
          changeType="positive"
          icon={Download}
          description="Total"
        />
        <MetricCard
          title="Agendamentos Ativos"
          value="23"
          change="+3"
          changeType="positive"
          icon={Calendar}
          description="Automáticos"
        />
        <MetricCard
          title="Tempo Médio"
          value="2.3s"
          change="-0.8s"
          changeType="positive"
          icon={Clock}
          description="De geração"
        />
      </div>

      {/* Reports Dashboard Tabs */}
      <Tabs defaultValue="biblioteca" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="biblioteca">Biblioteca</TabsTrigger>
          <TabsTrigger value="construtor">Construtor</TabsTrigger>
          <TabsTrigger value="agendados">Agendados</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="executivo">Executivo</TabsTrigger>
        </TabsList>

        {/* Biblioteca Tab - Catálogo completo de relatórios */}
        <TabsContent value="biblioteca" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtros por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Categorias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { id: 'todos', nome: 'Todos', icon: FileText, count: 47 },
                  { id: 'operacional', nome: 'Operacional', icon: Truck, count: 12 },
                  { id: 'financeiro', nome: 'Financeiro', icon: DollarSign, count: 8 },
                  { id: 'rh', nome: 'Recursos Humanos', icon: Users, count: 7 },
                  { id: 'frota', nome: 'Frota', icon: Truck, count: 9 },
                  { id: 'estoque', nome: 'Estoque', icon: Package, count: 6 },
                  { id: 'compliance', nome: 'Compliance', icon: Shield, count: 5 }
                ].map((categoria) => (
                  <Button
                    key={categoria.id}
                    variant={selectedCategory === categoria.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => setSelectedCategory(categoria.id)}
                  >
                    <categoria.icon className="w-4 h-4 mr-2" />
                    <span className="flex-1 text-left">{categoria.nome}</span>
                    <span className="text-xs text-gray-500">{categoria.count}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Lista de Relatórios */}
            <div className="lg:col-span-3">
              <ReportsLibrary category={selectedCategory} />
            </div>
          </div>
        </TabsContent>

        {/* Construtor Tab - Criação personalizada */}
        <TabsContent value="construtor" className="space-y-6">
          <ReportBuilder />
        </TabsContent>

        {/* Agendados Tab - Relatórios automáticos */}
        <TabsContent value="agendados" className="space-y-6">
          <ScheduledReports />
        </TabsContent>

        {/* Templates Tab - Modelos pré-definidos */}
        <TabsContent value="templates" className="space-y-6">
          <ReportTemplates />
        </TabsContent>

        {/* Histórico Tab - Relatórios gerados */}
        <TabsContent value="historico" className="space-y-6">
          <ReportsHistory />
        </TabsContent>

        {/* Executivo Tab - Dashboard executivo */}
        <TabsContent value="executivo" className="space-y-6">
          <ExecutiveDashboard />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { nome: 'Performance Diária', icon: BarChart3, categoria: 'operacional' },
              { nome: 'Custos Mensais', icon: DollarSign, categoria: 'financeiro' },
              { nome: 'Ranking Motoristas', icon: Users, categoria: 'rh' },
              { nome: 'Status da Frota', icon: Truck, categoria: 'frota' },
              { nome: 'Alertas de Estoque', icon: Package, categoria: 'estoque' },
              { nome: 'Compliance Score', icon: Shield, categoria: 'compliance' }
            ].map((relatorio, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center text-center"
                onClick={() => generateQuickReport(relatorio.categoria)}
                disabled={isGenerating}
              >
                <relatorio.icon className="w-6 h-6 mb-2" />
                <span className="text-xs">{relatorio.nome}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relatórios Mais Populares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Mais Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { nome: 'Relatório de Performance Mensal', downloads: 89, categoria: 'Operacional' },
                { nome: 'Análise de Custos por Rota', downloads: 76, categoria: 'Financeiro' },
                { nome: 'Dashboard Executivo Semanal', downloads: 65, categoria: 'Executivo' },
                { nome: 'Ranking de Motoristas', downloads: 54, categoria: 'RH' },
                { nome: 'Status de Manutenções', downloads: 43, categoria: 'Frota' }
              ].map((relatorio, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{relatorio.nome}</p>
                      <p className="text-xs text-gray-600">{relatorio.categoria}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{relatorio.downloads} downloads</span>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Relatórios Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Gerados Recentemente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { nome: 'Dashboard Executivo - Janeiro 2024', tempo: '2 min atrás', usuario: 'Admin', tamanho: '2.3 MB' },
                { nome: 'Análise de Combustível - Semana 3', tempo: '1 hora atrás', usuario: 'Gestor', tamanho: '1.8 MB' },
                { nome: 'Compliance Documental', tempo: '3 horas atrás', usuario: 'Auditoria', tamanho: '4.1 MB' },
                { nome: 'Performance por Motorista', tempo: '1 dia atrás', usuario: 'RH', tamanho: '1.2 MB' },
                { nome: 'Movimentação de Estoque', tempo: '2 dias atrás', usuario: 'Estoque', tamanho: '3.7 MB' }
              ].map((relatorio, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">{relatorio.nome}</p>
                      <p className="text-xs text-gray-600">{relatorio.usuario} • {relatorio.tamanho}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{relatorio.tempo}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 