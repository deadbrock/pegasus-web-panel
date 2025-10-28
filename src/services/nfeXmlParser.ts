/**
 * Parser de XML para Notas Fiscais Eletrônicas (NFe)
 * Extrai todas as informações relevantes do XML da NFe
 */

export type NFeData = {
  // Identificação
  numero: string
  serie: string
  chave_acesso: string
  modelo: string
  data_emissao: string
  data_entrada?: string
  
  // Emitente
  emit_cnpj: string
  emit_razao_social: string
  emit_nome_fantasia?: string
  emit_ie?: string
  emit_endereco?: string
  emit_municipio?: string
  emit_uf?: string
  
  // Destinatário
  dest_cnpj?: string
  dest_razao_social?: string
  dest_ie?: string
  dest_endereco?: string
  
  // Valores totais
  valor_total: number
  valor_produtos: number
  base_icms?: number
  valor_icms?: number
  valor_ipi?: number
  valor_pis?: number
  valor_cofins?: number
  valor_frete?: number
  valor_seguro?: number
  valor_desconto?: number
  valor_outras_despesas?: number
  
  // Operação
  tipo_operacao: 'entrada' | 'saida'
  natureza_operacao?: string
  cfop?: string
  
  // Itens
  itens: Array<{
    numero_item: number
    codigo_produto: string
    descricao: string
    ncm?: string
    cfop?: string
    unidade: string
    quantidade: number
    valor_unitario: number
    valor_total: number
    valor_icms?: number
    valor_ipi?: number
    valor_pis?: number
    valor_cofins?: number
    cst_icms?: string
    cst_ipi?: string
    cst_pis?: string
    cst_cofins?: string
  }>
  
  // Informações adicionais
  info_complementar?: string
  info_fisco?: string
}

/**
 * Parse XML de NFe e extrai todos os dados relevantes
 */
export function parseNFeXML(xmlString: string): NFeData {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  
  // Verificar se há erros de parsing
  const parserError = xmlDoc.getElementsByTagName('parsererror')
  if (parserError.length > 0) {
    throw new Error('Erro ao fazer parse do XML: XML inválido')
  }
  
  // Função auxiliar para buscar valor de tag
  const getTagValue = (tagName: string, parent: Element | Document = xmlDoc): string => {
    const elements = parent.getElementsByTagName(tagName)
    return elements.length > 0 ? elements[0].textContent?.trim() || '' : ''
  }
  
  // Função auxiliar para buscar valor numérico
  const getNumericValue = (tagName: string, parent: Element | Document = xmlDoc): number => {
    const value = getTagValue(tagName, parent)
    return value ? parseFloat(value.replace(',', '.')) : 0
  }
  
  // Extrair identificação da nota
  const ide = xmlDoc.getElementsByTagName('ide')[0]
  if (!ide) {
    throw new Error('Tag <ide> não encontrada no XML')
  }
  
  const numero = getTagValue('nNF', ide)
  const serie = getTagValue('serie', ide)
  const modelo = getTagValue('mod', ide)
  const dhEmi = getTagValue('dhEmi', ide) || getTagValue('dEmi', ide)
  
  // Extrair chave de acesso
  const infNFe = xmlDoc.getElementsByTagName('infNFe')[0]
  const chave_acesso = infNFe?.getAttribute('Id')?.replace('NFe', '') || ''
  
  // Extrair emitente
  const emit = xmlDoc.getElementsByTagName('emit')[0]
  if (!emit) {
    throw new Error('Tag <emit> não encontrada no XML')
  }
  
  const emit_cnpj = getTagValue('CNPJ', emit)
  const emit_razao_social = getTagValue('xNome', emit)
  const emit_nome_fantasia = getTagValue('xFant', emit)
  const emit_ie = getTagValue('IE', emit)
  
  const enderEmit = emit.getElementsByTagName('enderEmit')[0]
  let emit_endereco = ''
  let emit_municipio = ''
  let emit_uf = ''
  
  if (enderEmit) {
    const logradouro = getTagValue('xLgr', enderEmit)
    const numero = getTagValue('nro', enderEmit)
    const bairro = getTagValue('xBairro', enderEmit)
    const cep = getTagValue('CEP', enderEmit)
    emit_endereco = `${logradouro}, ${numero} - ${bairro} - CEP ${cep}`
    emit_municipio = getTagValue('xMun', enderEmit)
    emit_uf = getTagValue('UF', enderEmit)
  }
  
  // Extrair destinatário
  const dest = xmlDoc.getElementsByTagName('dest')[0]
  let dest_cnpj = ''
  let dest_razao_social = ''
  let dest_ie = ''
  let dest_endereco = ''
  
  if (dest) {
    dest_cnpj = getTagValue('CNPJ', dest) || getTagValue('CPF', dest)
    dest_razao_social = getTagValue('xNome', dest)
    dest_ie = getTagValue('IE', dest)
    
    const enderDest = dest.getElementsByTagName('enderDest')[0]
    if (enderDest) {
      const logradouro = getTagValue('xLgr', enderDest)
      const numero = getTagValue('nro', enderDest)
      const bairro = getTagValue('xBairro', enderDest)
      const cep = getTagValue('CEP', enderDest)
      dest_endereco = `${logradouro}, ${numero} - ${bairro} - CEP ${cep}`
    }
  }
  
  // Extrair valores totais
  const ICMSTot = xmlDoc.getElementsByTagName('ICMSTot')[0]
  if (!ICMSTot) {
    throw new Error('Tag <ICMSTot> não encontrada no XML')
  }
  
  const valor_produtos = getNumericValue('vProd', ICMSTot)
  const valor_total = getNumericValue('vNF', ICMSTot)
  const base_icms = getNumericValue('vBC', ICMSTot)
  const valor_icms = getNumericValue('vICMS', ICMSTot)
  const valor_ipi = getNumericValue('vIPI', ICMSTot)
  const valor_pis = getNumericValue('vPIS', ICMSTot)
  const valor_cofins = getNumericValue('vCOFINS', ICMSTot)
  const valor_frete = getNumericValue('vFrete', ICMSTot)
  const valor_seguro = getNumericValue('vSeg', ICMSTot)
  const valor_desconto = getNumericValue('vDesc', ICMSTot)
  const valor_outras_despesas = getNumericValue('vOutro', ICMSTot)
  
  // Determinar tipo de operação (entrada/saída)
  const tpNF = getTagValue('tpNF', ide)
  const tipo_operacao = tpNF === '0' ? 'entrada' : 'saida'
  
  // Outras informações
  const natureza_operacao = getTagValue('natOp', ide)
  const cfop = getTagValue('CFOP', ide)
  
  // Extrair itens
  const detElements = xmlDoc.getElementsByTagName('det')
  const itens: NFeData['itens'] = []
  
  for (let i = 0; i < detElements.length; i++) {
    const det = detElements[i]
    const prod = det.getElementsByTagName('prod')[0]
    
    if (prod) {
      const numero_item = parseInt(det.getAttribute('nItem') || String(i + 1))
      const codigo_produto = getTagValue('cProd', prod)
      const descricao = getTagValue('xProd', prod)
      const ncm = getTagValue('NCM', prod)
      const cfop_item = getTagValue('CFOP', prod)
      const unidade = getTagValue('uCom', prod)
      const quantidade = getNumericValue('qCom', prod)
      const valor_unitario = getNumericValue('vUnCom', prod)
      const valor_total_item = getNumericValue('vProd', prod)
      
      // Impostos do item
      const imposto = det.getElementsByTagName('imposto')[0]
      let valor_icms_item = 0
      let valor_ipi_item = 0
      let valor_pis_item = 0
      let valor_cofins_item = 0
      let cst_icms = ''
      let cst_ipi = ''
      let cst_pis = ''
      let cst_cofins = ''
      
      if (imposto) {
        // ICMS
        const icms = imposto.getElementsByTagName('ICMS')[0]
        if (icms) {
          valor_icms_item = getNumericValue('vICMS', icms)
          cst_icms = getTagValue('CST', icms) || getTagValue('CSOSN', icms)
        }
        
        // IPI
        const ipi = imposto.getElementsByTagName('IPI')[0]
        if (ipi) {
          valor_ipi_item = getNumericValue('vIPI', ipi)
          cst_ipi = getTagValue('CST', ipi)
        }
        
        // PIS
        const pis = imposto.getElementsByTagName('PIS')[0]
        if (pis) {
          valor_pis_item = getNumericValue('vPIS', pis)
          cst_pis = getTagValue('CST', pis)
        }
        
        // COFINS
        const cofins = imposto.getElementsByTagName('COFINS')[0]
        if (cofins) {
          valor_cofins_item = getNumericValue('vCOFINS', cofins)
          cst_cofins = getTagValue('CST', cofins)
        }
      }
      
      itens.push({
        numero_item,
        codigo_produto,
        descricao,
        ncm,
        cfop: cfop_item,
        unidade,
        quantidade,
        valor_unitario,
        valor_total: valor_total_item,
        valor_icms: valor_icms_item,
        valor_ipi: valor_ipi_item,
        valor_pis: valor_pis_item,
        valor_cofins: valor_cofins_item,
        cst_icms,
        cst_ipi,
        cst_pis,
        cst_cofins
      })
    }
  }
  
  // Informações adicionais
  const infAdic = xmlDoc.getElementsByTagName('infAdic')[0]
  const info_complementar = infAdic ? getTagValue('infCpl', infAdic) : ''
  const info_fisco = infAdic ? getTagValue('infAdFisco', infAdic) : ''
  
  return {
    numero,
    serie,
    chave_acesso,
    modelo,
    data_emissao: dhEmi,
    emit_cnpj,
    emit_razao_social,
    emit_nome_fantasia,
    emit_ie,
    emit_endereco,
    emit_municipio,
    emit_uf,
    dest_cnpj,
    dest_razao_social,
    dest_ie,
    dest_endereco,
    valor_total,
    valor_produtos,
    base_icms,
    valor_icms,
    valor_ipi,
    valor_pis,
    valor_cofins,
    valor_frete,
    valor_seguro,
    valor_desconto,
    valor_outras_despesas,
    tipo_operacao,
    natureza_operacao,
    cfop,
    itens,
    info_complementar,
    info_fisco
  }
}

/**
 * Valida se o XML é uma NFe válida
 */
export function isValidNFeXML(xmlString: string): boolean {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
    
    // Verificar se há erros de parsing
    const parserError = xmlDoc.getElementsByTagName('parsererror')
    if (parserError.length > 0) {
      return false
    }
    
    // Verificar se tem as tags essenciais
    const hasNFe = xmlDoc.getElementsByTagName('NFe').length > 0 || 
                   xmlDoc.getElementsByTagName('nfeProc').length > 0
    const hasInfNFe = xmlDoc.getElementsByTagName('infNFe').length > 0
    const hasIde = xmlDoc.getElementsByTagName('ide').length > 0
    const hasEmit = xmlDoc.getElementsByTagName('emit').length > 0
    
    return hasNFe && hasInfNFe && hasIde && hasEmit
  } catch (error) {
    console.error('Erro ao validar XML:', error)
    return false
  }
}

