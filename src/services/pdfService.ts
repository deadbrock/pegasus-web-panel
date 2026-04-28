import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { PedidoMaterial } from './pedidosMateriaisService'

interface PedidoItem {
  produto: string
  quantidade: number
  valorUnitario?: number
  valorTotal?: number
}

interface PedidoPDF {
  numero?: string
  cliente?: string
  telefone?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  dataPedido?: Date | string
  dataEntrega?: Date | string
  status?: string
  motorista?: string
  veiculo?: string
  formaPagamento?: string
  observacoes?: string
  itens?: PedidoItem[]
  // Para pedidos mobile
  supervisor?: string
  produtos?: Array<{
    codigo?: string
    nome?: string
    quantidade?: number
  }>
  contrato?: {
    numero?: string
    descricao?: string
  }
}

export function gerarPedidoPDF(pedido: PedidoPDF) {
  const doc = new jsPDF()
  
  // Cores da empresa
  const corPrimaria = [162, 18, 42] // #a2122a (vermelho)
  const corSecundaria = [53, 74, 128] // #354a80 (azul)
  const corCinza = [100, 100, 100]
  const corCinzaClaro = [240, 240, 240]
  
  let yPosition = 20
  
  // ===== CABEÇALHO =====
  doc.setFillColor(...corPrimaria)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('PEGASUS', 15, 20)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Gestão Logística', 15, 27)
  
  // Número do pedido
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const numeroPedido = pedido.numero || 'S/N'
  doc.text(`Pedido #${numeroPedido}`, 210 - 15, 20, { align: 'right' })
  
  // Status
  if (pedido.status) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Status: ${pedido.status}`, 210 - 15, 27, { align: 'right' })
  }
  
  yPosition = 50
  
  // ===== INFORMAÇÕES DO CLIENTE =====
  doc.setTextColor(...corSecundaria)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMAÇÕES DO CLIENTE', 15, yPosition)
  
  yPosition += 8
  
  doc.setTextColor(...corCinza)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const cliente = pedido.cliente || pedido.supervisor || 'Não informado'
  doc.text(`Cliente: ${cliente}`, 15, yPosition)
  yPosition += 5
  
  if (pedido.telefone) {
    doc.text(`Telefone: ${pedido.telefone}`, 15, yPosition)
    yPosition += 5
  }
  
  if (pedido.endereco) {
    doc.text(`Endereço: ${pedido.endereco}`, 15, yPosition)
    yPosition += 5
  }
  
  if (pedido.cidade && pedido.estado) {
    doc.text(`Cidade: ${pedido.cidade} - ${pedido.estado}`, 15, yPosition)
    yPosition += 5
  }
  
  if (pedido.cep) {
    doc.text(`CEP: ${pedido.cep}`, 15, yPosition)
    yPosition += 5
  }
  
  yPosition += 5
  
  // ===== INFORMAÇÕES DO PEDIDO =====
  doc.setTextColor(...corSecundaria)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMAÇÕES DO PEDIDO', 15, yPosition)
  
  yPosition += 8
  
  doc.setTextColor(...corCinza)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  if (pedido.dataPedido) {
    const dataPedido = typeof pedido.dataPedido === 'string' 
      ? new Date(pedido.dataPedido)
      : pedido.dataPedido
    doc.text(`Data do Pedido: ${format(dataPedido, 'dd/MM/yyyy', { locale: ptBR })}`, 15, yPosition)
    yPosition += 5
  }
  
  if (pedido.dataEntrega) {
    const dataEntrega = typeof pedido.dataEntrega === 'string'
      ? new Date(pedido.dataEntrega)
      : pedido.dataEntrega
    doc.text(`Data de Entrega: ${format(dataEntrega, 'dd/MM/yyyy', { locale: ptBR })}`, 15, yPosition)
    yPosition += 5
  }
  
  if (pedido.motorista) {
    doc.text(`Motorista: ${pedido.motorista}`, 15, yPosition)
    yPosition += 5
  }
  
  if (pedido.veiculo) {
    doc.text(`Veículo: ${pedido.veiculo}`, 15, yPosition)
    yPosition += 5
  }
  
  if (pedido.formaPagamento) {
    doc.text(`Forma de Pagamento: ${pedido.formaPagamento}`, 15, yPosition)
    yPosition += 5
  }
  
  if (pedido.contrato) {
    doc.text(`Contrato: ${pedido.contrato.numero || 'N/A'}`, 15, yPosition)
    yPosition += 5
    if (pedido.contrato.descricao) {
      doc.text(`Descrição: ${pedido.contrato.descricao}`, 15, yPosition)
      yPosition += 5
    }
  }
  
  yPosition += 5
  
  // ===== PRODUTOS =====
  doc.setTextColor(...corSecundaria)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PRODUTOS', 15, yPosition)
  
  yPosition += 5
  
  // Determinar se é pedido web ou mobile
  const items = pedido.itens || pedido.produtos || []
  
  if (items.length > 0) {
    // Preparar dados da tabela
    const tableData: any[] = []
    let valorTotal = 0
    
    items.forEach((item: any, index: number) => {
      const produto = item.produto || item.nome || item.codigo || 'Produto'
      const quantidade = item.quantidade || 0
      const valorUnitario = item.valorUnitario || 0
      const valorItem = item.valorTotal || (quantidade * valorUnitario) || 0
      
      valorTotal += valorItem
      
      // Se tem valores monetários (pedido web)
      if (item.valorUnitario !== undefined) {
        tableData.push([
          index + 1,
          produto,
          quantidade,
          `R$ ${valorUnitario.toFixed(2)}`,
          `R$ ${valorItem.toFixed(2)}`
        ])
      } else {
        // Pedido mobile (sem valores)
        tableData.push([
          index + 1,
          produto,
          quantidade
        ])
      }
    })
    
    // Configurar colunas conforme o tipo de pedido
    const columns = items[0]?.valorUnitario !== undefined
      ? ['#', 'Produto', 'Qtd', 'Valor Unit.', 'Total']
      : ['#', 'Produto', 'Quantidade']
    
    autoTable(doc, {
      startY: yPosition,
      head: [columns],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: corSecundaria,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: corCinza
      },
      alternateRowStyles: {
        fillColor: corCinzaClaro
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: items[0]?.valorUnitario !== undefined ? 80 : 140 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 15, right: 15 }
    })
    
    // Posição após a tabela
    yPosition = (doc as any).lastAutoTable.finalY + 10
    
    // Valor total (apenas para pedidos web)
    if (items[0]?.valorUnitario !== undefined && valorTotal > 0) {
      doc.setTextColor(...corPrimaria)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`VALOR TOTAL: R$ ${valorTotal.toFixed(2)}`, 210 - 15, yPosition, { align: 'right' })
      yPosition += 10
    }
  } else {
    yPosition += 5
    doc.setTextColor(...corCinza)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.text('Nenhum produto no pedido', 15, yPosition)
    yPosition += 10
  }
  
  // ===== OBSERVAÇÕES =====
  if (pedido.observacoes) {
    doc.setTextColor(...corSecundaria)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('OBSERVAÇÕES', 15, yPosition)
    
    yPosition += 5
    
    doc.setTextColor(...corCinza)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const observacoesLines = doc.splitTextToSize(pedido.observacoes, 180)
    doc.text(observacoesLines, 15, yPosition)
    yPosition += (observacoesLines.length * 5) + 5
  }
  
  // ===== RODAPÉ =====
  const pageHeight = doc.internal.pageSize.height
  doc.setFillColor(...corCinzaClaro)
  doc.rect(0, pageHeight - 20, 210, 20, 'F')
  
  doc.setTextColor(...corCinza)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Pegasus - Gestão Logística', 15, pageHeight - 12)
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 210 - 15, pageHeight - 12, { align: 'right' })
  
  doc.setFontSize(7)
  doc.text('www.pegasus.com.br | contato@pegasus.com.br', 105, pageHeight - 8, { align: 'center' })
  
  // Salvar PDF
  const nomeArquivo = `Pedido_${numeroPedido}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`
  doc.save(nomeArquivo)
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF de Pedido de Material (Portal Operacional) — layout profissional azul
// ─────────────────────────────────────────────────────────────────────────────

type RGB = [number, number, number]

function gradienteH(doc: jsPDF, x: number, y: number, w: number, h: number, from: RGB, to: RGB, steps = 40) {
  for (let i = 0; i < steps; i++) {
    const t = i / steps
    const r = Math.round(from[0] + (to[0] - from[0]) * t)
    const g = Math.round(from[1] + (to[1] - from[1]) * t)
    const b = Math.round(from[2] + (to[2] - from[2]) * t)
    doc.setFillColor(r, g, b)
    doc.rect(x + i * (w / steps), y, w / steps + 0.5, h, 'F')
  }
}

function label(doc: jsPDF, text: string, x: number, y: number, cor: RGB = [71, 85, 105]) {
  doc.setTextColor(...cor)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text(text.toUpperCase(), x, y)
}

function valor(doc: jsPDF, text: string, x: number, y: number, cor: RGB = [15, 23, 42]) {
  doc.setTextColor(...cor)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'normal')
  doc.text(text, x, y)
}

export function gerarPedidoMaterialPDF(pedido: PedidoMaterial): void {
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W    = 210
  const MAR  = 14   // margem lateral

  // ── Paleta azul ────────────────────────────────────────────────────────────
  const AZUL_ESC: RGB  = [15,  55, 115]   // #0f3773
  const AZUL_MED: RGB  = [37,  99, 235]   // #2563eb
  const AZUL_SUAVE: RGB= [219,234,254]    // #dbeafe
  const BRANCO: RGB    = [255,255,255]
  const CINZA:  RGB    = [71,  85, 105]   // slate-600
  const PRETO:  RGB    = [15,  23,  42]   // slate-900
  const VERDE:  RGB    = [22, 163,  74]   // green-600
  const LARANJA: RGB   = [234, 88,  12]   // orange-600

  // ── Utilitários ────────────────────────────────────────────────────────────
  const HOJE = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  const NUM  = pedido.numero_pedido ?? 'S/N'

  // ══════════════════════════════════════════════════════════════════════════
  // CABEÇALHO com gradiente
  // ══════════════════════════════════════════════════════════════════════════
  gradienteH(doc, 0, 0, W, 42, AZUL_ESC, AZUL_MED)

  // Faixa decorativa inferior do header
  doc.setFillColor(...AZUL_SUAVE)
  doc.rect(0, 42, W, 1.5, 'F')

  // Logo / nome empresa
  doc.setTextColor(...BRANCO)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('PEGASUS', MAR, 18)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Gestão Logística e Operacional', MAR, 25)

  // Tipo de documento
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('SOLICITAÇÃO DE MATERIAIS', MAR, 34)

  // Número e data — lado direito
  doc.setFontSize(18)
  doc.text(`#${NUM}`, W - MAR, 18, { align: 'right' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Emitido: ${HOJE}`, W - MAR, 25, { align: 'right' })

  // Badge status
  const statusLabel  = pedido.status
  const statusColor  =
    pedido.status === 'Entregue'    ? VERDE :
    pedido.status === 'Cancelado'   ? LARANJA :
    pedido.status === 'Aprovado'    ? [22,163,74]  as RGB :
    pedido.status === 'Separado'    ? [99,102,241] as RGB :
    AZUL_MED
  doc.setFillColor(...statusColor)
  doc.roundedRect(W - MAR - 38, 28, 38, 8, 2, 2, 'F')
  doc.setTextColor(...BRANCO)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(statusLabel, W - MAR - 19, 33.5, { align: 'center' })

  let y = 52

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCO INFORMAÇÕES — 2 colunas
  // ══════════════════════════════════════════════════════════════════════════
  const colA = MAR
  const colB = W / 2 + 4
  const boxH = 36

  // Caixa esquerda
  doc.setFillColor(...AZUL_SUAVE)
  doc.roundedRect(colA, y, W / 2 - 6, boxH, 3, 3, 'F')

  // Caixa direita
  doc.setFillColor(241, 245, 249)   // slate-100
  doc.roundedRect(colB, y, W / 2 - 6, boxH, 3, 3, 'F')

  // Conteúdo col. esquerda
  label(doc, 'Solicitante', colA + 4, y + 7, AZUL_MED)
  valor(doc, pedido.solicitante_nome, colA + 4, y + 13)

  label(doc, 'Setor', colA + 4, y + 20, AZUL_MED)
  valor(doc, pedido.solicitante_setor ?? '—', colA + 4, y + 26)

  label(doc, 'Supervisor', colA + 4, y + 33, AZUL_MED)
  valor(doc, pedido.supervisor_nome ?? '—', colA + 4, y + 39 - 4)

  // Conteúdo col. direita
  const dataPedido = format(new Date(pedido.created_at), 'dd/MM/yyyy', { locale: ptBR })
  label(doc, 'Data da Solicitação', colB + 4, y + 7, CINZA)
  valor(doc, dataPedido, colB + 4, y + 13)

  label(doc, 'Urgência', colB + 4, y + 20, CINZA)
  const urgColor: RGB =
    pedido.urgencia === 'Urgente' ? [185,28,28] :
    pedido.urgencia === 'Alta'    ? [154,52,18] :
    CINZA
  valor(doc, pedido.urgencia, colB + 4, y + 26, urgColor)

  label(doc, 'Nº do Pedido', colB + 4, y + 33, CINZA)
  valor(doc, NUM, colB + 4, y + 39 - 4, AZUL_MED)

  y += boxH + 8

  // ══════════════════════════════════════════════════════════════════════════
  // TABELA DE ITENS
  // ══════════════════════════════════════════════════════════════════════════
  doc.setTextColor(...AZUL_ESC)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('ITENS SOLICITADOS', MAR, y)
  y += 2

  const itens = pedido.itens ?? []

  if (itens.length === 0) {
    doc.setTextColor(...CINZA)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text('Nenhum item registrado.', MAR, y + 7)
    y += 14
  } else {
    autoTable(doc, {
      startY: y,
      head: [['#', 'Código', 'Produto / Material', 'Quantidade', 'Un.', 'Obs.']],
      body: itens.map((item, idx) => [
        idx + 1,
        item.produto_codigo ?? '—',
        item.produto_nome ?? '—',
        item.quantidade,
        item.unidade ?? '—',
        item.observacoes ?? '',
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: AZUL_MED,
        textColor: BRANCO,
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'center',
      },
      bodyStyles: { fontSize: 8.5, textColor: PRETO },
      alternateRowStyles: { fillColor: [239, 246, 255] as RGB },
      columnStyles: {
        0: { cellWidth: 8,  halign: 'center' },
        1: { cellWidth: 22 },
        2: { cellWidth: 78 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 12, halign: 'center' },
        5: { cellWidth: 40 },
      },
      margin: { left: MAR, right: MAR },
    })
    y = (doc as any).lastAutoTable.finalY + 8
  }

  // ══════════════════════════════════════════════════════════════════════════
  // OBSERVAÇÕES
  // ══════════════════════════════════════════════════════════════════════════
  if (pedido.observacoes) {
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(MAR, y, W - MAR * 2, 18, 2, 2, 'F')
    label(doc, 'Observações', MAR + 3, y + 6, CINZA)
    doc.setTextColor(...PRETO)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(pedido.observacoes, W - MAR * 2 - 6)
    doc.text(lines, MAR + 3, y + 12)
    y += Math.max(18, lines.length * 5 + 10) + 6
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CAMPOS DE ASSINATURA — 2 × 2
  // Verifica espaço; se necessário, nova página
  // ══════════════════════════════════════════════════════════════════════════
  const SIG_H   = 38   // altura de cada campo de assinatura
  const SIG_GAP = 6    // espaçamento
  const pageH   = doc.internal.pageSize.height
  const rodapeH = 18

  if (y + SIG_H * 2 + SIG_GAP + 16 > pageH - rodapeH) {
    doc.addPage()
    y = 20
  } else {
    y += 4
  }

  // Título da seção
  gradienteH(doc, MAR, y, W - MAR * 2, 9, AZUL_ESC, AZUL_MED, 20)
  doc.setTextColor(...BRANCO)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ASSINATURAS E CONFIRMAÇÕES', MAR + 4, y + 6)
  y += 14

  const sigW = (W - MAR * 2 - SIG_GAP) / 2

  const assinaturas = [
    { titulo: 'Supervisor Logístico',          sub: 'Responsável pela liberação do pedido' },
    { titulo: 'Motorista / Entregador',         sub: 'Responsável pelo transporte dos materiais' },
    { titulo: 'Encarregado Solicitante',        sub: 'Confirma o recebimento dos materiais' },
    { titulo: 'Conferente / Almoxarife',        sub: 'Confirma a separação e saída do estoque' },
  ]

  assinaturas.forEach((sig, i) => {
    const col = i % 2 === 0 ? MAR : MAR + sigW + SIG_GAP
    const row = i < 2 ? y : y + SIG_H + SIG_GAP

    // Caixa com borda azul
    doc.setDrawColor(...AZUL_MED)
    doc.setLineWidth(0.4)
    doc.setFillColor(...BRANCO)
    doc.roundedRect(col, row, sigW, SIG_H, 2, 2, 'FD')

    // Faixa superior azul com título
    doc.setFillColor(...AZUL_SUAVE)
    doc.roundedRect(col, row, sigW, 8, 2, 2, 'F')
    doc.setFillColor(...AZUL_SUAVE)
    doc.rect(col, row + 4, sigW, 4, 'F')   // corrige cantos inferiores

    doc.setTextColor(...AZUL_ESC)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(sig.titulo.toUpperCase(), col + 4, row + 5.5)

    // Sub-descrição
    doc.setTextColor(...CINZA)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(sig.sub, col + 4, row + 13)

    // Linha de assinatura
    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.3)
    doc.line(col + 4, row + SIG_H - 12, col + sigW - 4, row + SIG_H - 12)

    // Labels Nome / Data
    doc.setTextColor(148, 163, 184)   // slate-400
    doc.setFontSize(6.5)
    doc.text('Assinatura', col + 4, row + SIG_H - 8)

    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.3)
    doc.line(col + 4, row + SIG_H - 4, col + sigW / 2 - 2, row + SIG_H - 4)
    doc.line(col + sigW / 2 + 2, row + SIG_H - 4, col + sigW - 4, row + SIG_H - 4)

    doc.setTextColor(148, 163, 184)
    doc.setFontSize(6.5)
    doc.text('Nome legível', col + 4, row + SIG_H - 0.5)
    doc.text('Data', col + sigW / 2 + 2, row + SIG_H - 0.5)
  })

  y += SIG_H * 2 + SIG_GAP + 8

  // ══════════════════════════════════════════════════════════════════════════
  // RODAPÉ
  // ══════════════════════════════════════════════════════════════════════════
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    const pH = doc.internal.pageSize.height
    gradienteH(doc, 0, pH - rodapeH, W, rodapeH, AZUL_ESC, AZUL_MED, 20)

    doc.setTextColor(...BRANCO)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text('PEGASUS — Gestão Logística e Operacional', MAR, pH - 10)
    doc.text(`Página ${p} / ${totalPages}`, W - MAR, pH - 10, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.text('www.pegasuslog.com.br  |  Este documento requer assinaturas originais para validade legal.', W / 2, pH - 5, { align: 'center' })
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SALVAR
  // ══════════════════════════════════════════════════════════════════════════
  doc.save(`Pedido_Material_${NUM}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)
}

