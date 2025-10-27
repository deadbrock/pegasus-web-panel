import { supabase } from '../supabase'
import { fetchVeiculosStats } from './veiculos-service'
import { fetchMotoristasStats } from './motoristas-service'
import { fetchPedidosStats } from './pedidos-service'
import { fetchCustosStats } from './custos-service'
import { fetchManutencoesStats } from './manutencoes-service'
import { fetchContratosStats } from './contratos-service'

/**
 * Gera relatório consolidado do dashboard
 */
export async function gerarRelatorioDashboard(periodo?: { ano?: number; mes?: number }) {
  try {
    const [
      veiculos,
      motoristas,
      pedidos,
      custos,
      manutencoes,
      contratos
    ] = await Promise.all([
      fetchVeiculosStats(),
      fetchMotoristasStats(),
      fetchPedidosStats(),
      fetchCustosStats(periodo?.ano, periodo?.mes),
      fetchManutencoesStats(),
      fetchContratosStats()
    ])

    return {
      periodo: periodo || { ano: new Date().getFullYear(), mes: new Date().getMonth() + 1 },
      data_geracao: new Date().toISOString(),
      resumo: {
        veiculos: {
          total: veiculos.total,
          ativos: veiculos.ativos,
          em_manutencao: veiculos.em_manutencao
        },
        motoristas: {
          total: motoristas.total,
          ativos: motoristas.ativos,
          cnh_vencendo: motoristas.cnh_vencendo
        },
        pedidos: {
          total: pedidos.total,
          entregues: pedidos.entregues,
          em_transito: pedidos.em_transito,
          taxa_entrega: pedidos.taxa_entrega
        },
        custos: {
          total_mes: custos.total_mes,
          total_ano: custos.total_ano,
          pendentes: custos.pendentes
        },
        manutencoes: {
          total: manutencoes.total,
          proximas_30_dias: manutencoes.proximas_30_dias,
          custo_total: manutencoes.custo_total
        },
        contratos: {
          total: contratos.total,
          ativos: contratos.ativos,
          vencendo_30_dias: contratos.vencendo_30_dias
        }
      }
    }
  } catch (error) {
    console.error('Erro ao gerar relatório dashboard:', error)
    throw error
  }
}

/**
 * Gera relatório de custos detalhado
 */
export async function gerarRelatorioCustos(dataInicio: string, dataFim: string) {
  try {
    const { data: custos, error } = await supabase
      .from('custos')
      .select('*')
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: false })

    if (error) throw error

    const totalPorCategoria: Record<string, number> = {}
    const totalPorMes: Record<string, number> = {}
    let totalGeral = 0

    custos?.forEach(custo => {
      // Por categoria
      totalPorCategoria[custo.categoria] = (totalPorCategoria[custo.categoria] || 0) + custo.valor

      // Por mês
      const mesAno = custo.data.substring(0, 7)
      totalPorMes[mesAno] = (totalPorMes[mesAno] || 0) + custo.valor

      totalGeral += custo.valor
    })

    return {
      periodo: { inicio: dataInicio, fim: dataFim },
      data_geracao: new Date().toISOString(),
      total_geral: totalGeral,
      total_por_categoria: totalPorCategoria,
      total_por_mes: totalPorMes,
      custos: custos || []
    }
  } catch (error) {
    console.error('Erro ao gerar relatório de custos:', error)
    throw error
  }
}

/**
 * Gera relatório de manutenções
 */
export async function gerarRelatorioManutencoes(dataInicio: string, dataFim: string) {
  try {
    const { data: manutencoes, error } = await supabase
      .from('manutencoes')
      .select('*, veiculos(placa, modelo)')
      .gte('data_programada', dataInicio)
      .lte('data_programada', dataFim)
      .order('data_programada', { ascending: false })

    if (error) throw error

    const totalPorTipo: Record<string, number> = {}
    const totalPorStatus: Record<string, number> = {}
    let custoTotal = 0

    manutencoes?.forEach(manutencao => {
      // Por tipo
      totalPorTipo[manutencao.tipo] = (totalPorTipo[manutencao.tipo] || 0) + 1

      // Por status
      totalPorStatus[manutencao.status] = (totalPorStatus[manutencao.status] || 0) + 1

      custoTotal += manutencao.custo || 0
    })

    return {
      periodo: { inicio: dataInicio, fim: dataFim },
      data_geracao: new Date().toISOString(),
      total: manutencoes?.length || 0,
      custo_total: custoTotal,
      total_por_tipo: totalPorTipo,
      total_por_status: totalPorStatus,
      manutencoes: manutencoes || []
    }
  } catch (error) {
    console.error('Erro ao gerar relatório de manutenções:', error)
    throw error
  }
}

/**
 * Gera relatório de pedidos/entregas
 */
export async function gerarRelatorioPedidos(dataInicio: string, dataFim: string) {
  try {
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .gte('created_at', dataInicio)
      .lte('created_at', dataFim)
      .order('created_at', { ascending: false })

    if (error) throw error

    const totalPorStatus: Record<string, number> = {}
    let valorTotal = 0
    let pesoTotal = 0

    pedidos?.forEach(pedido => {
      totalPorStatus[pedido.status] = (totalPorStatus[pedido.status] || 0) + 1
      valorTotal += pedido.valor || 0
      pesoTotal += pedido.peso || 0
    })

    // Calcular taxa de entrega no prazo
    const entregues = pedidos?.filter(p => p.status === 'Entregue') || []
    const entreguesNoPrazo = entregues.filter(p => {
      if (!p.data_entrega || !p.data_entrega_prevista) return false
      return new Date(p.data_entrega) <= new Date(p.data_entrega_prevista)
    })
    const taxaEntrega = entregues.length > 0 
      ? (entreguesNoPrazo.length / entregues.length) * 100 
      : 0

    return {
      periodo: { inicio: dataInicio, fim: dataFim },
      data_geracao: new Date().toISOString(),
      total: pedidos?.length || 0,
      valor_total: valorTotal,
      peso_total: pesoTotal,
      taxa_entrega_no_prazo: taxaEntrega,
      total_por_status: totalPorStatus,
      pedidos: pedidos || []
    }
  } catch (error) {
    console.error('Erro ao gerar relatório de pedidos:', error)
    throw error
  }
}

/**
 * Gera relatório de frota (veículos)
 */
export async function gerarRelatorioFrota() {
  try {
    const { data: veiculos, error } = await supabase
      .from('veiculos')
      .select('*')
      .order('placa', { ascending: true })

    if (error) throw error

    const totalPorStatus: Record<string, number> = {}
    const totalPorTipo: Record<string, number> = {}

    veiculos?.forEach(veiculo => {
      totalPorStatus[veiculo.status] = (totalPorStatus[veiculo.status] || 0) + 1
      if (veiculo.tipo) {
        totalPorTipo[veiculo.tipo] = (totalPorTipo[veiculo.tipo] || 0) + 1
      }
    })

    return {
      data_geracao: new Date().toISOString(),
      total: veiculos?.length || 0,
      total_por_status: totalPorStatus,
      total_por_tipo: totalPorTipo,
      veiculos: veiculos || []
    }
  } catch (error) {
    console.error('Erro ao gerar relatório de frota:', error)
    throw error
  }
}

/**
 * Gera relatório de motoristas
 */
export async function gerarRelatorioMotoristas() {
  try {
    const { data: motoristas, error } = await supabase
      .from('motoristas')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error

    const totalPorStatus: Record<string, number> = {}
    const cnhVencendo: any[] = []

    const hoje = new Date()
    const daquiA30Dias = new Date()
    daquiA30Dias.setDate(hoje.getDate() + 30)

    motoristas?.forEach(motorista => {
      totalPorStatus[motorista.status] = (totalPorStatus[motorista.status] || 0) + 1

      if (motorista.validade_cnh) {
        const validade = new Date(motorista.validade_cnh)
        if (validade >= hoje && validade <= daquiA30Dias) {
          cnhVencendo.push(motorista)
        }
      }
    })

    return {
      data_geracao: new Date().toISOString(),
      total: motoristas?.length || 0,
      total_por_status: totalPorStatus,
      cnh_vencendo_30_dias: cnhVencendo.length,
      motoristas_cnh_vencendo: cnhVencendo,
      motoristas: motoristas || []
    }
  } catch (error) {
    console.error('Erro ao gerar relatório de motoristas:', error)
    throw error
  }
}

/**
 * Gera relatório de contratos
 */
export async function gerarRelatorioContratos() {
  try {
    const { data: contratos, error } = await supabase
      .from('contratos')
      .select('*')
      .order('data_inicio', { ascending: false })

    if (error) throw error

    const totalPorStatus: Record<string, number> = {}
    const totalPorTipo: Record<string, number> = {}
    let valorTotalAtivos = 0
    let valorMensalTotal = 0

    contratos?.forEach(contrato => {
      totalPorStatus[contrato.status] = (totalPorStatus[contrato.status] || 0) + 1
      totalPorTipo[contrato.tipo] = (totalPorTipo[contrato.tipo] || 0) + 1

      if (contrato.status === 'Ativo') {
        valorTotalAtivos += contrato.valor_total
        valorMensalTotal += contrato.valor_mensal || 0
      }
    })

    return {
      data_geracao: new Date().toISOString(),
      total: contratos?.length || 0,
      valor_total_ativos: valorTotalAtivos,
      valor_mensal_total: valorMensalTotal,
      total_por_status: totalPorStatus,
      total_por_tipo: totalPorTipo,
      contratos: contratos || []
    }
  } catch (error) {
    console.error('Erro ao gerar relatório de contratos:', error)
    throw error
  }
}

/**
 * Gera relatório financeiro consolidado
 */
export async function gerarRelatorioFinanceiro(ano: number, mes?: number) {
  try {
    let dataInicio: string
    let dataFim: string

    if (mes) {
      dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
      const ultimoDia = new Date(ano, mes, 0).getDate()
      dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`
    } else {
      dataInicio = `${ano}-01-01`
      dataFim = `${ano}-12-31`
    }

    const [custos, pedidos, contratos] = await Promise.all([
      gerarRelatorioCustos(dataInicio, dataFim),
      gerarRelatorioPedidos(dataInicio, dataFim),
      gerarRelatorioContratos()
    ])

    const receita = pedidos.valor_total
    const despesas = custos.total_geral
    const lucro = receita - despesas
    const margemLucro = receita > 0 ? (lucro / receita) * 100 : 0

    return {
      periodo: mes 
        ? { ano, mes }
        : { ano },
      data_geracao: new Date().toISOString(),
      resumo: {
        receita_total: receita,
        despesas_totais: despesas,
        lucro_liquido: lucro,
        margem_lucro: margemLucro
      },
      detalhes: {
        custos: custos.total_por_categoria,
        pedidos: pedidos.total_por_status,
        contratos_ativos: contratos.valor_total_ativos
      }
    }
  } catch (error) {
    console.error('Erro ao gerar relatório financeiro:', error)
    throw error
  }
}
