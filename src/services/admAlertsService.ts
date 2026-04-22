/**
 * Fase 3 — Engine de Alertas, Saúde e Insights
 *
 * Todos os cálculos são determinísticos e client-side.
 * Nenhuma chamada ao banco é feita aqui — os dados são recebidos via parâmetro.
 * Isso permite reutilização em qualquer contexto (listagem, detalhe, exportação).
 */

import type {
  AdmContrato,
  AdmContratoFinanceiro,
  AdmReajuste,
  AdmManutencaoContrato,
  AdmAlerta,
  AdmAlertaTipo,
  AdmAlertaSeveridade,
  AdmSaudeContrato,
  AdmSaudeStatus,
  AdmInsight,
  AdmContratoAnalise,
} from '@/types/adm-contratos'

// ─── Constantes de negócio ────────────────────────────────────────────────────

const DIAS_VENCIMENTO_CRITICO = 7
const DIAS_VENCIMENTO_PROXIMO = 30
const DIAS_VENCIMENTO_MEDIO   = 90
const MARGEM_MINIMA_IDEAL     = 10   // %
const MARGEM_BAIXA            = 5    // %
const MESES_SEM_REAJUSTE      = 12
const MAX_OCORRENCIAS_ABERTAS  = 3
const VARIACAO_CUSTO_ALERTA   = 20   // % de crescimento no custo
const DIAS_SEM_MOVIMENTACAO   = 60

// ─── Helpers ──────────────────────────────────────────────────────────────────

function diasAte(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const today  = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function mesesDesde(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const d     = new Date(dateStr)
  const today = new Date()
  return (today.getFullYear() - d.getFullYear()) * 12 + (today.getMonth() - d.getMonth())
}

function alerta(
  tipo: AdmAlertaTipo,
  severidade: AdmAlertaSeveridade,
  titulo: string,
  descricao: string,
  acao?: string
): AdmAlerta {
  return { tipo, severidade, titulo, descricao, acao }
}

// ─── Saúde simplificada (apenas dados do contrato, para listagem) ─────────────

export function computeSaudeSimplificada(contrato: AdmContrato): AdmSaudeContrato {
  const alertas = gerarAlertasSimplificados(contrato)
  return computeSaudeFromAlertas(alertas)
}

export function gerarAlertasSimplificados(contrato: AdmContrato): AdmAlerta[] {
  if (contrato.status !== 'ativo') return []

  const list: AdmAlerta[] = []
  const dias = diasAte(contrato.data_fim)

  if (dias !== null) {
    if (dias < 0) {
      list.push(alerta('contrato_vencido', 'alta',
        'Contrato vencido',
        `O contrato expirou há ${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? 's' : ''}.`,
        'Verifique a necessidade de renovação ou encerramento.'
      ))
    } else if (dias <= DIAS_VENCIMENTO_CRITICO) {
      list.push(alerta('vencimento_critico', 'critica',
        `Vence em ${dias} dia${dias !== 1 ? 's' : ''}`,
        `Ação urgente necessária — o contrato vence em ${dias} dia${dias !== 1 ? 's' : ''}.`,
        'Inicie o processo de renovação imediatamente.'
      ))
    } else if (dias <= DIAS_VENCIMENTO_PROXIMO) {
      list.push(alerta('vencimento_proximo', 'alta',
        `Vence em ${dias} dias`,
        `O contrato vence em ${dias} dias. Avalie a renovação.`,
        'Iniciar processo de renovação.'
      ))
    } else if (dias <= DIAS_VENCIMENTO_MEDIO) {
      list.push(alerta('vencimento_proximo', 'media',
        `Vence em ${dias} dias`,
        `O contrato vence nos próximos ${dias} dias.`,
        'Programar revisão contratual.'
      ))
    }
  }

  return list
}

// ─── Análise completa (todos os dados, para detalhe) ─────────────────────────

export interface AdmContratoCompleto {
  contrato: AdmContrato
  financeiro: AdmContratoFinanceiro[]
  reajustes: AdmReajuste[]
  manutencoes: AdmManutencaoContrato[]
}

export function computeAnaliseCompleta(data: AdmContratoCompleto): AdmContratoAnalise {
  const alertas = gerarAlertasCompletos(data)
  const saude   = computeSaudeFromAlertas(alertas)
  const insights = gerarInsights(data, alertas, saude)
  return { saude, alertas, insights }
}

function gerarAlertasCompletos(data: AdmContratoCompleto): AdmAlerta[] {
  const { contrato, financeiro, reajustes, manutencoes } = data
  const list: AdmAlerta[] = []

  // Apenas contratos ativos geram todos os alertas
  const isAtivo = contrato.status === 'ativo'

  // ── Vencimento ──
  const dias = diasAte(contrato.data_fim)
  if (dias !== null) {
    if (dias < 0) {
      list.push(alerta('contrato_vencido', 'alta',
        'Contrato vencido',
        `O contrato expirou há ${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? 's' : ''}.`,
        'Verifique renovação ou encerramento formal.'
      ))
    } else if (dias <= DIAS_VENCIMENTO_CRITICO) {
      list.push(alerta('vencimento_critico', 'critica',
        `Vence em ${dias} dia${dias !== 1 ? 's' : ''}`,
        'Ação urgente necessária.',
        'Iniciar renovação imediatamente.'
      ))
    } else if (dias <= DIAS_VENCIMENTO_PROXIMO) {
      list.push(alerta('vencimento_proximo', 'alta',
        `Vence em ${dias} dias`,
        `O contrato encerra em ${dias} dias.`,
        'Avaliar renovação.'
      ))
    } else if (dias <= DIAS_VENCIMENTO_MEDIO) {
      list.push(alerta('vencimento_proximo', 'media',
        `Vence em ${dias} dias`,
        `Programar revisão contratual nos próximos meses.`
      ))
    }
  }

  if (!isAtivo) return list  // contratos inativos só alertam sobre vencimento

  // ── Dados financeiros ──
  if (financeiro.length === 0) {
    list.push(alerta('sem_dados_financeiros', 'media',
      'Sem dados financeiros',
      'Nenhum período financeiro registrado para este contrato.',
      'Registre receita e custo para ativar o monitoramento.'
    ))
    return list  // sem financeiro, os demais alertas financeiros não se aplicam
  }

  // Financeiro ordenado por período (mais recente primeiro)
  const finOrdenado = [...financeiro].sort((a, b) =>
    b.periodo_referencia.localeCompare(a.periodo_referencia)
  )
  const ultimo   = finOrdenado[0]
  const penultimo = finOrdenado[1]

  // ── Prejuízo ──
  const totalLucro = financeiro.reduce((s, f) => s + f.lucro, 0)
  if (totalLucro < 0) {
    list.push(alerta('prejuizo', 'critica',
      'Contrato em prejuízo',
      `Resultado acumulado negativo: ${totalLucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
      'Revisar estrutura de custos urgentemente.'
    ))
  }

  // ── Margem baixa ──
  const totalReceita = financeiro.reduce((s, f) => s + f.receita, 0)
  const margemGlobal = totalReceita > 0 ? (totalLucro / totalReceita) * 100 : 0

  if (totalLucro >= 0) {
    if (margemGlobal < MARGEM_BAIXA) {
      list.push(alerta('margem_baixa', 'alta',
        `Margem crítica: ${margemGlobal.toFixed(1)}%`,
        `Margem média abaixo de ${MARGEM_BAIXA}%. Risco de operação deficitária.`,
        'Revisar composição de custos ou renegociar valores.'
      ))
    } else if (margemGlobal < MARGEM_MINIMA_IDEAL) {
      list.push(alerta('margem_baixa', 'media',
        `Margem abaixo do ideal: ${margemGlobal.toFixed(1)}%`,
        `Margem média abaixo de ${MARGEM_MINIMA_IDEAL}%. Monitorar evolução.`
      ))
    }
  }

  // ── Custo crescente ──
  if (penultimo && ultimo.custo > 0 && penultimo.custo > 0) {
    const variacaoCusto = ((ultimo.custo - penultimo.custo) / penultimo.custo) * 100
    if (variacaoCusto >= VARIACAO_CUSTO_ALERTA) {
      list.push(alerta('custo_crescente', 'media',
        `Custo cresceu ${variacaoCusto.toFixed(1)}% no último período`,
        `O custo aumentou de ${penultimo.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para ${ultimo.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
        'Investigar origem do aumento.'
      ))
    }
  }

  // ── Sem movimentação recente ──
  const ultimoPeriodo = finOrdenado[0]?.periodo_referencia
  if (ultimoPeriodo) {
    const [y, m] = ultimoPeriodo.split('-').map(Number)
    const dataUltimoPeriodo = new Date(y, m - 1, 1)
    const hoje = new Date()
    const diasSemMovimentacao = Math.floor(
      (hoje.getTime() - dataUltimoPeriodo.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diasSemMovimentacao > DIAS_SEM_MOVIMENTACAO) {
      list.push(alerta('sem_movimentacao', 'media',
        'Sem movimentação financeira recente',
        `Último registro financeiro há mais de ${Math.round(diasSemMovimentacao / 30)} mese${Math.round(diasSemMovimentacao / 30) !== 1 ? 's' : ''}.`,
        'Registrar dados do período atual.'
      ))
    }
  }

  // ── Reajuste pendente ──
  const ultimoReajuste = reajustes.length > 0
    ? reajustes.reduce((latest, r) =>
        r.data_aplicacao > latest.data_aplicacao ? r : latest
      )
    : null
  const referenciaReajuste = ultimoReajuste?.data_aplicacao ?? contrato.data_inicio
  const mesesSemReajuste = mesesDesde(referenciaReajuste) ?? 0
  if (mesesSemReajuste >= MESES_SEM_REAJUSTE) {
    list.push(alerta('reajuste_pendente', 'media',
      `Sem reajuste há ${mesesSemReajuste} meses`,
      `O contrato não recebeu reajuste em ${mesesSemReajuste} meses. Avalie reajuste por inflação acumulada.`,
      'Aplicar reajuste contratual.'
    ))
  }

  // ── Alta incidência de ocorrências ──
  const ocorrenciasAbertas = manutencoes.filter(
    (m) => m.status === 'aberta' || m.status === 'em_andamento'
  ).length
  if (ocorrenciasAbertas > MAX_OCORRENCIAS_ABERTAS) {
    list.push(alerta('alta_incidencia_ocorrencias', 'alta',
      `${ocorrenciasAbertas} ocorrências em aberto`,
      `Alta concentração de ocorrências não resolvidas pode indicar problema estrutural.`,
      'Revisar e priorizar resolução das ocorrências.'
    ))
  }

  return list
}

// ─── Score e classificação de saúde ──────────────────────────────────────────

const PENALIDADE: Record<AdmAlertaSeveridade, number> = {
  info:    0,
  media:   10,
  alta:    20,
  critica: 35,
}

function computeSaudeFromAlertas(alertas: AdmAlerta[]): AdmSaudeContrato {
  let score = 100

  for (const a of alertas) {
    score -= PENALIDADE[a.severidade]
  }
  score = Math.max(0, score)

  const status: AdmSaudeStatus = score >= 70 ? 'saudavel' : score >= 40 ? 'atencao' : 'critico'

  return {
    status,
    score,
    totalAlertas: alertas.length,
    alertasCriticos: alertas.filter((a) => a.severidade === 'critica').length,
    alertasAltos:    alertas.filter((a) => a.severidade === 'alta').length,
  }
}

// ─── Insights executivos ──────────────────────────────────────────────────────

function gerarInsights(
  data: AdmContratoCompleto,
  alertas: AdmAlerta[],
  saude: AdmSaudeContrato
): AdmInsight[] {
  const { contrato, financeiro, reajustes, manutencoes } = data
  const insights: AdmInsight[] = []

  if (!financeiro.length) return insights

  const finOrdenado = [...financeiro].sort((a, b) =>
    b.periodo_referencia.localeCompare(a.periodo_referencia)
  )
  const totalReceita = financeiro.reduce((s, f) => s + f.receita, 0)
  const totalLucro   = financeiro.reduce((s, f) => s + f.lucro, 0)
  const margem       = totalReceita > 0 ? (totalLucro / totalReceita) * 100 : 0
  const ultimo       = finOrdenado[0]
  const penultimo    = finOrdenado[1]

  // ── Insights positivos ──
  if (margem >= 20) {
    insights.push({
      tipo: 'positivo',
      titulo: 'Margem acima da média',
      descricao: `Este contrato opera com margem de ${margem.toFixed(1)}%, acima dos ${MARGEM_MINIMA_IDEAL}% recomendados. Excelente rentabilidade.`,
    })
  }

  if (reajustes.length > 0) {
    const totalReaj = reajustes.reduce((s, r) => s + r.percentual, 0)
    if (totalReaj > 0) {
      insights.push({
        tipo: 'positivo',
        titulo: `${reajustes.length} reajuste${reajustes.length > 1 ? 's' : ''} aplicado${reajustes.length > 1 ? 's' : ''}`,
        descricao: `O contrato acumulou ${totalReaj.toFixed(2)}% em reajustes, preservando seu valor real ao longo do tempo.`,
      })
    }
  }

  const concluidas = manutencoes.filter((m) => m.status === 'concluida').length
  if (concluidas > 0 && concluidas === manutencoes.length && manutencoes.length > 0) {
    insights.push({
      tipo: 'positivo',
      titulo: 'Todas as ocorrências resolvidas',
      descricao: `${concluidas} ocorrência${concluidas > 1 ? 's' : ''} registrada${concluidas > 1 ? 's' : ''} e ${concluidas > 1 ? 'todas resolvidas' : 'resolvida'}.`,
    })
  }

  // ── Insights de oportunidade ──
  if (margem >= MARGEM_MINIMA_IDEAL && margem < 20) {
    insights.push({
      tipo: 'oportunidade',
      titulo: 'Potencial de melhoria de margem',
      descricao: `Margem atual de ${margem.toFixed(1)}%. Uma revisão de custos operacionais pode elevar a rentabilidade deste contrato.`,
    })
  }

  if (penultimo && ultimo) {
    const crescReceita = ((ultimo.receita - penultimo.receita) / (penultimo.receita || 1)) * 100
    if (crescReceita > 5) {
      insights.push({
        tipo: 'oportunidade',
        titulo: `Receita cresceu ${crescReceita.toFixed(1)}% no último período`,
        descricao: 'O contrato apresenta tendência positiva de receita. Considere consolidar ou ampliar o escopo.',
      })
    }
  }

  // ── Insights de atenção ──
  if (alertas.some((a) => a.tipo === 'margem_baixa')) {
    insights.push({
      tipo: 'atencao',
      titulo: 'Margem abaixo do ideal — revisão recomendada',
      descricao: 'A operação deste contrato está com rentabilidade reduzida. Uma análise de custos ou renegociação de valores pode ser necessária.',
    })
  }

  if (alertas.some((a) => a.tipo === 'custo_crescente')) {
    insights.push({
      tipo: 'atencao',
      titulo: 'Tendência de alta nos custos',
      descricao: 'Os custos deste contrato apresentaram crescimento significativo no último período. Monitorar evolução é essencial.',
    })
  }

  if (alertas.some((a) => a.tipo === 'reajuste_pendente')) {
    insights.push({
      tipo: 'atencao',
      titulo: 'Reajuste pendente — valor defasado',
      descricao: 'O contrato pode estar com valor defasado em relação à inflação acumulada. Avaliar aplicação de reajuste.',
    })
  }

  // ── Insights negativos ──
  if (alertas.some((a) => a.tipo === 'prejuizo')) {
    insights.push({
      tipo: 'negativo',
      titulo: 'Contrato operando em prejuízo',
      descricao: 'O resultado acumulado é negativo. É necessário uma revisão completa da estrutura de custos e precificação.',
    })
  }

  if (alertas.some((a) => a.tipo === 'alta_incidencia_ocorrencias')) {
    insights.push({
      tipo: 'negativo',
      titulo: 'Alta incidência de ocorrências em aberto',
      descricao: 'Volume elevado de ocorrências não resolvidas indica risco operacional. A resolução deve ser priorizada.',
    })
  }

  if (saude.status === 'critico' && !insights.some((i) => i.tipo === 'negativo')) {
    insights.push({
      tipo: 'negativo',
      titulo: 'Contrato requer atenção imediata',
      descricao: 'A análise identificou múltiplos indicadores de risco. Recomenda-se revisão gerencial deste contrato.',
    })
  }

  return insights
}

// ─── Análise para uso na listagem (batch, sem dados completos) ───────────────

export function computeAnaliseListagem(contratos: AdmContrato[]): Map<string, AdmSaudeContrato> {
  const map = new Map<string, AdmSaudeContrato>()
  for (const c of contratos) {
    map.set(c.id, computeSaudeSimplificada(c))
  }
  return map
}

// ─── Resumo executivo global (para banner na listagem) ────────────────────────

export interface AdmResumoGlobal {
  criticos: number
  atencao: number
  saudaveis: number
  vencendoEm30: number
  comPrejuizo: number
}

export function computeResumoGlobal(
  contratos: AdmContrato[],
  saudeMap: Map<string, AdmSaudeContrato>
): AdmResumoGlobal {
  let criticos = 0, atencao = 0, saudaveis = 0, vencendoEm30 = 0

  for (const c of contratos) {
    if (c.status !== 'ativo') continue
    const s = saudeMap.get(c.id)
    if (!s) continue
    if (s.status === 'critico')  criticos++
    if (s.status === 'atencao')  atencao++
    if (s.status === 'saudavel') saudaveis++

    const dias = diasAte(c.data_fim)
    if (dias !== null && dias >= 0 && dias <= 30) vencendoEm30++
  }

  return { criticos, atencao, saudaveis, vencendoEm30, comPrejuizo: 0 }
}
