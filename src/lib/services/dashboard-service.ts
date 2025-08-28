import { supabase } from '@/lib/supabaseClient'

export type DashboardKPIs = {
  receita_total: number
  custo_total: number
  lucro_liquido: number
  pedidos_ativos: number
  entregas_no_prazo: number
  total_veiculos: number
  veiculos_ativos: number
}

export async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  try {
    // Pedidos últimos 30 dias
    const end = new Date()
    const start = new Date(end.getTime() - 29 * 86400000)

    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('status, valor_total, data_pedido')
      .gte('data_pedido', start.toISOString())
      .lte('data_pedido', end.toISOString())
    if (ordersErr) throw ordersErr

    let receita_total = 0
    let pedidos_ativos = 0
    let entregas_no_prazo = 0
    for (const r of orders || []) {
      receita_total += Number((r as any).valor_total || 0)
      const s = (r as any).status || 'Pendente'
      if (s !== 'Cancelado' && s !== 'Rejeitado') pedidos_ativos++
      if (s === 'Entregue') entregas_no_prazo++
    }

    // Custos mês atual
    const now = new Date()
    const ymStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const ymEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
    const { data: custos, error: custosErr } = await supabase
      .from('custos')
      .select('valor, data')
      .gte('data', ymStart)
      .lte('data', ymEnd)
    if (custosErr) throw custosErr
    const custo_total = (custos || []).reduce((acc, c: any) => acc + Number(c.valor || 0), 0)

    // Veículos
    const { data: veiculos, error: veiculosErr } = await supabase
      .from('veiculos')
      .select('status')
    if (veiculosErr) throw veiculosErr
    const total_veiculos = veiculos?.length || 0
    const veiculos_ativos = (veiculos || []).filter((v: any) => (v.status || '').toLowerCase() !== 'inativo').length

    const lucro_liquido = Math.max(0, receita_total - custo_total)

    return { receita_total, custo_total, lucro_liquido, pedidos_ativos, entregas_no_prazo, total_veiculos, veiculos_ativos }
  } catch {
    // fallback seguro
    return {
      receita_total: 0,
      custo_total: 0,
      lucro_liquido: 0,
      pedidos_ativos: 0,
      entregas_no_prazo: 0,
      total_veiculos: 0,
      veiculos_ativos: 0,
    }
  }
}


