import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

