import { StyleSheet } from 'react-native'

export const modernCardStyles = StyleSheet.create({
  // Card Moderno
  pedidoCardModern: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  
  // Header com Gradiente
  pedidoHeaderModern: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  numeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  pedidoNumeroModern: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  dataTexto: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  
  // Corpo do Card
  pedidoBodyModern: {
    padding: 16,
  },
  
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 16,
  },
  
  resumoItem: {
    alignItems: 'center',
    gap: 6,
  },
  
  resumoLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  resumoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  
  // Seção de Produtos
  produtosSection: {
    marginBottom: 16,
  },
  
  produtosSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  produtoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  
  produtoIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  produtoInfo: {
    flex: 1,
  },
  
  produtoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  
  produtoCodigo: {
    fontSize: 12,
    color: '#64748b',
  },
  
  produtoQuantidadeBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  produtoQuantidadeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  
  maisItensTexto: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  
  // Badges e Alertas
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  
  alertBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  
  alertBadge2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  
  alertBadgeText2: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366f1',
  },
  
  // Observações Preview
  observacoesPreview: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#64748b',
  },
  
  observacoesPreviewText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  
  // Footer
  pedidoFooterModern: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  
  footerDivider: {
    width: 1,
    backgroundColor: '#f3f4f6',
  },
})

