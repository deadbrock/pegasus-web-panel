'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  Activity,
  Target,
  FileText,
  TrendingUp,
  Clock,
  RefreshCw,
  Download,
  Settings,
  BarChart3
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { AuditFindingsTable } from '@/components/auditoria/audit-findings-table'
import { ComplianceScoreCard } from '@/components/auditoria/compliance-score-card'
import { KPIChartsPanel } from '@/components/auditoria/kpi-charts-panel'
import { CriticalAlertsPanel } from '@/components/auditoria/critical-alerts-panel'
import { AuditHistoryChart } from '@/components/auditoria/audit-history-chart'
import { AuditAreasChart } from '@/components/auditoria/audit-areas-chart'

export default function AuditoriaPage() {
  const [isAuditRunning, setIsAuditRunning] = useState(false)
  const [lastAuditTime, setLastAuditTime] = useState(new Date())
  const [complianceScore, setComplianceScore] = useState(87.3)

  const runCompleteAudit = async () => {
    setIsAuditRunning(true)
    
    // Simular execução da auditoria
    setTimeout(() => {
      setIsAuditRunning(false)
      setLastAuditTime(new Date())
      
      // Simular mudança no score
      setComplianceScore(prev => Math.round((prev + (Math.random() * 4 - 2)) * 10) / 10)
    }, 3000)
  }

  const runQuickAudit = () => {
    // Implementar auditoria rápida
    console.log('Executando auditoria rápida...')
  }

  const exportReport = () => {
    // Implementar exportação de relatório
    console.log('Exportando relatório de auditoria...')
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel de Controle de Auditoria</h1>
          <p className="text-gray-600 mt-1">
            Monitoramento de conformidade e análise de compliance operacional
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runQuickAudit}
            disabled={isAuditRunning}
          >
            <Activity className="w-4 h-4 mr-2" />
            Auditoria Rápida
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button 
            onClick={runCompleteAudit}
            disabled={isAuditRunning}
            className={isAuditRunning ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            {isAuditRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Executar Auditoria Completa
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status da Última Auditoria */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isAuditRunning ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-sm font-medium">
            {isAuditRunning ? 'Auditoria em Execução' : 'Sistema Monitorado'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Última auditoria: {lastAuditTime.toLocaleString('pt-BR')}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Score de Conformidade"
          value={`${complianceScore}%`}
          change={complianceScore > 85 ? "+2.1%" : "-1.3%"}
          changeType={complianceScore > 85 ? "positive" : "negative"}
          icon={Shield}
          description="Meta: 90%"
        />
        <MetricCard
          title="Apontamentos Ativos"
          value="23"
          change="-4"
          changeType="positive"
          icon={AlertTriangle}
          description="7 críticos"
        />
        <MetricCard
          title="Itens Resolvidos"
          value="156"
          change="+12"
          changeType="positive"
          icon={CheckCircle}
          description="Este mês"
        />
        <MetricCard
          title="Taxa de Resolução"
          value="89.4%"
          change="+5.2%"
          changeType="positive"
          icon={Target}
          description="Meta: 85%"
        />
      </div>

      {/* Audit Dashboard Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="findings">Apontamentos</TabsTrigger>
          <TabsTrigger value="kpis">KPIs & Metas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score de Conformidade */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Score de Conformidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComplianceScoreCard score={complianceScore} />
              </CardContent>
            </Card>

            {/* Alertas Críticos */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Alertas Críticos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CriticalAlertsPanel />
              </CardContent>
            </Card>
          </div>

          {/* KPIs vs Metas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                KPIs vs. Metas - Performance Operacional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KPIChartsPanel />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Findings Tab */}
        <TabsContent value="findings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Apontamentos de Auditoria (Não Conformidades)</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Lista
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AuditFindingsTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metas Operacionais */}
            <Card>
              <CardHeader>
                <CardTitle>Metas Operacionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Custo por KM</span>
                      <span>R$ 4.35 / R$ 4.50 (Meta)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[97%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">3% abaixo da meta</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Entregas no Prazo (OTIF)</span>
                      <span>94.2% / 95% (Meta)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full w-[94%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">0.8% abaixo da meta</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Ocupação da Frota</span>
                      <span>88.7% / 85% (Meta)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[89%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">3.7% acima da meta</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Conformidade Documental</span>
                      <span>85.4% / 90% (Meta)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full w-[85%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">4.6% abaixo da meta</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indicadores de Qualidade */}
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Qualidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Manutenções em Dia</span>
                    <span className="font-semibold text-green-600">96.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Documentos Válidos</span>
                    <span className="font-semibold text-yellow-600">85.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estoque Sem Problemas</span>
                    <span className="font-semibold text-green-600">92.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pedidos no Prazo</span>
                    <span className="font-semibold text-orange-600">87.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Custos Documentados</span>
                    <span className="font-semibold text-blue-600">98.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rotas Otimizadas</span>
                    <span className="font-semibold text-green-600">91.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Área */}
            <Card>
              <CardHeader>
                <CardTitle>Apontamentos por Área</CardTitle>
              </CardHeader>
              <CardContent>
                <AuditAreasChart />
              </CardContent>
            </Card>

            {/* Evolução Temporal */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Score de Conformidade</CardTitle>
              </CardHeader>
              <CardContent>
                <AuditHistoryChart />
              </CardContent>
            </Card>
          </div>

          {/* Métricas Detalhadas */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">↗ 12%</p>
                  <p className="text-sm text-gray-600">Melhoria no Score</p>
                  <p className="text-xs text-gray-500">Últimos 3 meses</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">↘ 8%</p>
                  <p className="text-sm text-gray-600">Redução de Apontamentos</p>
                  <p className="text-xs text-gray-500">Últimos 30 dias</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">↗ 15%</p>
                  <p className="text-sm text-gray-600">Taxa de Resolução</p>
                  <p className="text-xs text-gray-500">Mês atual</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Auditorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { data: '22/01/2024 14:30', score: 87.3, apontamentos: 23, status: 'Concluída' },
                  { data: '21/01/2024 09:15', score: 85.1, apontamentos: 27, status: 'Concluída' },
                  { data: '20/01/2024 16:45', score: 89.2, apontamentos: 19, status: 'Concluída' },
                  { data: '19/01/2024 11:20', score: 86.8, apontamentos: 25, status: 'Concluída' },
                  { data: '18/01/2024 08:00', score: 84.5, apontamentos: 31, status: 'Concluída' }
                ].map((audit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">{audit.data}</p>
                        <p className="text-sm text-gray-600">Status: {audit.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Score: {audit.score}%</p>
                      <p className="text-sm text-gray-600">{audit.apontamentos} apontamentos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                  Relatório Completo de Auditoria
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Score de Conformidade - Histórico
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Apontamentos por Área
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  KPIs vs. Metas
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Plano de Ação Corretiva
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Ações Recomendadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">Urgente</span>
                    </div>
                    <p className="text-sm text-red-700">
                      7 apontamentos críticos requerem ação imediata
                    </p>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Melhoria</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Implementar melhorias na conformidade documental
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Meta</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Ajustar processo de entregas para atingir 95% OTIF
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Monitoramento</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Manter performance atual da frota (acima da meta)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 