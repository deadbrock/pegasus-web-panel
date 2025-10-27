import { fetchVeiculosStats } from './veiculos-service'
import { fetchMotoristasStats } from './motoristas-service'
import { fetchPedidosStats } from './pedidos-service'
import { fetchProdutosStats } from './produtos-service'
import { fetchCustosStats } from './custos-service'
import { fetchManutencoesStats } from './manutencoes-service'
import { fetchContratosStats } from './contratos-service'
import { fetchDocumentosStats } from './documentos-service'
import { fetchAuditoriaStats } from './auditoria-service'

export type DashboardKPIs = {
  // Financeiro
  receita_total: number
  custo_total: number
  lucro_liquido: number
  margem_lucro: number
  
  // Pedidos
  pedidos_ativos: number
  pedidos_total: number
  entregas_no_prazo: number
  taxa_entrega: number
  
  // Frota
  total_veiculos: number
  veiculos_ativos: number
  veiculos_manutencao: number
  
  // Motoristas
  total_motoristas: number
  motoristas_ativos: number
  cnh_vencendo: number
  
  // Estoque
  total_produtos: number
  estoque_baixo: number
  estoque_critico: number
  valor_estoque: number
  
  // Manutenção
  manutencoes_agendadas: number
  manutencoes_proximas: number
  custo_manutencao: number
  
  // Contratos
  contratos_ativos: number
  contratos_vencendo: number
  valor_contratos: number
  
  // Documentos
  documentos_vencendo: number
  documentos_vencidos: number
  
  // Compliance/Auditoria
  achados_abertos: number
  achados_criticos: number
  taxa_resolucao: number
}

/**
 * Busca todos os KPIs do dashboard de forma consolidada
 */
export async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  try {
    const now = new Date()
    const anoAtual = now.getFullYear()
    const mesAtual = now.getMonth() + 1

    // Buscar estatísticas de todos os módulos em paralelo
    const [
      veiculos,
      motoristas,
      pedidos,
      produtos,
      custos,
      manutencoes,
      contratos,
      documentos,
      auditoria
    ] = await Promise.all([
      fetchVeiculosStats(),
      fetchMotoristasStats(),
      fetchPedidosStats(),
      fetchProdutosStats(),
      fetchCustosStats(anoAtual, mesAtual),
      fetchManutencoesStats(),
      fetchContratosStats(),
      fetchDocumentosStats(),
      fetchAuditoriaStats()
    ])

    // Calcular métricas financeiras
    const receita_total = pedidos.valor_total
    const custo_total = custos.total_mes
    const lucro_liquido = Math.max(0, receita_total - custo_total)
    const margem_lucro = receita_total > 0 ? (lucro_liquido / receita_total) * 100 : 0

    return {
      // Financeiro
      receita_total,
      custo_total,
      lucro_liquido,
      margem_lucro,
      
      // Pedidos
      pedidos_ativos: pedidos.em_transito + pedidos.pendentes,
      pedidos_total: pedidos.total,
      entregas_no_prazo: pedidos.entregues,
      taxa_entrega: pedidos.taxa_entrega,
      
      // Frota
      total_veiculos: veiculos.total,
      veiculos_ativos: veiculos.ativos,
      veiculos_manutencao: veiculos.em_manutencao,
      
      // Motoristas
      total_motoristas: motoristas.total,
      motoristas_ativos: motoristas.ativos,
      cnh_vencendo: motoristas.cnh_vencendo,
      
      // Estoque
      total_produtos: produtos.total,
      estoque_baixo: produtos.estoque_baixo,
      estoque_critico: produtos.estoque_critico,
      valor_estoque: produtos.valor_total_estoque,
      
      // Manutenção
      manutencoes_agendadas: manutencoes.agendadas,
      manutencoes_proximas: manutencoes.proximas_30_dias,
      custo_manutencao: manutencoes.custo_total,
      
      // Contratos
      contratos_ativos: contratos.ativos,
      contratos_vencendo: contratos.vencendo_30_dias,
      valor_contratos: contratos.valor_total_ativos,
      
      // Documentos
      documentos_vencendo: documentos.vencendo_30_dias,
      documentos_vencidos: documentos.vencidos,
      
      // Compliance/Auditoria
      achados_abertos: auditoria.abertos + auditoria.em_analise,
      achados_criticos: auditoria.por_severidade?.['Crítica'] || 0,
      taxa_resolucao: auditoria.taxa_resolucao
    }
  } catch (error) {
    console.error('Erro ao buscar KPIs do dashboard:', error)
    // Fallback seguro
    return {
      receita_total: 0,
      custo_total: 0,
      lucro_liquido: 0,
      margem_lucro: 0,
      pedidos_ativos: 0,
      pedidos_total: 0,
      entregas_no_prazo: 0,
      taxa_entrega: 0,
      total_veiculos: 0,
      veiculos_ativos: 0,
      veiculos_manutencao: 0,
      total_motoristas: 0,
      motoristas_ativos: 0,
      cnh_vencendo: 0,
      total_produtos: 0,
      estoque_baixo: 0,
      estoque_critico: 0,
      valor_estoque: 0,
      manutencoes_agendadas: 0,
      manutencoes_proximas: 0,
      custo_manutencao: 0,
      contratos_ativos: 0,
      contratos_vencendo: 0,
      valor_contratos: 0,
      documentos_vencendo: 0,
      documentos_vencidos: 0,
      achados_abertos: 0,
      achados_criticos: 0,
      taxa_resolucao: 0
    }
  }
}


