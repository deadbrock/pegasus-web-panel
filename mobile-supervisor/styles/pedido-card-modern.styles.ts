import { StyleSheet } from 'react-native'

export const modernCardStyles = StyleSheet.create({
  // ============================================
  // CARD PRINCIPAL - Mais compacto e organizado
  // ============================================
  pedidoCardModern: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  // ============================================
  // HEADER COMPACTO
  // ============================================
  headerCompacto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fafbfc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  numeroCompacto: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  statusBadgeCompacto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },

  statusTextCompacto: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // ============================================
  // INFO DESTAQUE - Informação principal em destaque
  // ============================================
  infoDestaque: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
  },

  infoDestaqueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  iconeBadge: {
    width: 40,
    height: 40,
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoDestaqueTextos: {
    flex: 1,
  },

  labelDestaque: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },

  primeiroItemNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },

  urgenciaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: 'white',
  },

  urgenciaTexto: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // ============================================
  // LISTA RESUMIDA DE PRODUTOS
  // ============================================
  listaProdutosResumida: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },

  produtoLinha: {
    marginBottom: 8,
  },

  produtoLinhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  produtoLinhaCodigo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    fontFamily: 'monospace',
  },

  produtoLinhaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#cbd5e1',
  },

  produtoLinhaQuantidade: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },

  maisItensCompacto: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // ============================================
  // AUTORIZAÇÃO DESTAQUE
  // ============================================
  autorizacaoDestaque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 4,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
  },

  autorizacaoTexto: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },

  // ============================================
  // FOOTER COMPACTO
  // ============================================
  footerCompacto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fafbfc',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  dataCompacta: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },

  footerAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  botaoDetalhes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
  },

  botaoDetalhesTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },

  botaoCancelar: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
})

