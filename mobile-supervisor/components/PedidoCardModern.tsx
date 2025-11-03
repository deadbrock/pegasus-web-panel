import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PedidoMobile } from '../services/pedidos-mobile-service'
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme'

interface PedidoCardModernProps {
  pedido: PedidoMobile
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => string
  getUrgenciaColor: (urgencia: string) => string
  getUrgenciaIcon: (urgencia: string) => string
  onDetalhesPress?: () => void
  onCancelarPress?: () => void
}

export function PedidoCardModern({
  pedido,
  getStatusColor,
  getStatusIcon,
  getUrgenciaColor,
  getUrgenciaIcon,
  onDetalhesPress,
  onCancelarPress,
}: PedidoCardModernProps) {
  const totalItens = pedido.itens?.length || 0
  const primeiroItem = pedido.itens && pedido.itens.length > 0 ? pedido.itens[0] : null
  const statusColor = getStatusColor(pedido.status)
  const urgenciaColor = getUrgenciaColor(pedido.urgencia)

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: statusColor + '20' }]}>
            <MaterialCommunityIcons 
              name={getStatusIcon(pedido.status) as any} 
              size={20} 
              color={statusColor} 
            />
          </View>
          <View>
            <Text style={styles.numeroPedido}>{pedido.numero_pedido}</Text>
            <Text style={styles.dataPedido}>
              {format(new Date(pedido.data_solicitacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{pedido.status}</Text>
        </View>
      </View>

      {/* Info Principal */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="package-variant" size={18} color={colors.textSecondary} />
          <Text style={styles.infoLabel}>
            {totalItens} {totalItens === 1 ? 'item' : 'itens'} solicitado{totalItens === 1 ? '' : 's'}
          </Text>
        </View>
        
        {primeiroItem && (
          <View style={styles.produtoDestaque}>
            <Text style={styles.produtoNome} numberOfLines={1}>
              {primeiroItem.produto_nome}
            </Text>
            <Text style={styles.produtoCodigo}>
              Cód: {primeiroItem.produto_codigo} • {primeiroItem.quantidade} {primeiroItem.unidade}
            </Text>
          </View>
        )}

        {totalItens > 1 && (
          <Text style={styles.maisItens}>
            +{totalItens - 1} {totalItens - 1 === 1 ? 'produto' : 'produtos'}
          </Text>
        )}
      </View>

      {/* Urgência e Contrato */}
      <View style={styles.tagsSection}>
        <View style={[styles.urgenciaBadge, { borderColor: urgenciaColor, backgroundColor: urgenciaColor + '15' }]}>
          <MaterialCommunityIcons 
            name={getUrgenciaIcon(pedido.urgencia) as any} 
            size={14} 
            color={urgenciaColor} 
          />
          <Text style={[styles.urgenciaText, { color: urgenciaColor }]}>
            {pedido.urgencia}
          </Text>
        </View>

        {pedido.contrato_nome && (
          <View style={styles.contratoInfo}>
            <MaterialCommunityIcons name="file-document" size={14} color={colors.secondary} />
            <Text style={styles.contratoText} numberOfLines={1}>
              {pedido.contrato_nome}
            </Text>
          </View>
        )}
      </View>

      {/* Status de Autorização */}
      {pedido.requer_autorizacao && (
        <View style={[
          styles.autorizacaoBox,
          { 
            backgroundColor: pedido.autorizacao_status === 'Aprovada' ? colors.successLight : colors.warningLight,
            borderColor: pedido.autorizacao_status === 'Aprovada' ? colors.success : colors.warning
          }
        ]}>
          <MaterialCommunityIcons 
            name={pedido.autorizacao_status === 'Aprovada' ? 'check-decagram' : 'clock-alert-outline'}
            size={16} 
            color={pedido.autorizacao_status === 'Aprovada' ? colors.success : colors.warning} 
          />
          <Text style={[
            styles.autorizacaoText,
            { color: pedido.autorizacao_status === 'Aprovada' ? colors.success : colors.warning }
          ]}>
            {pedido.autorizacao_status === 'Aprovada' ? 'Autorizado' : 'Aguardando Autorização'}
          </Text>
        </View>
      )}

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.buttonDetalhes} 
          onPress={onDetalhesPress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="eye" size={18} color={colors.secondary} />
          <Text style={styles.buttonDetalhesText}>Ver Detalhes</Text>
        </TouchableOpacity>
        
        {pedido.status === 'Pendente' && (
          <TouchableOpacity 
            style={styles.buttonCancelar} 
            onPress={onCancelarPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close-circle-outline" size={18} color={colors.error} />
            <Text style={styles.buttonCancelarText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numeroPedido: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  dataPedido: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  infoSection: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  produtoDestaque: {
    marginTop: spacing.xs,
    paddingLeft: spacing.lg + spacing.xs,
  },
  produtoNome: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  produtoCodigo: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  maisItens: {
    fontSize: typography.sm,
    color: colors.secondary,
    fontWeight: typography.medium,
    paddingLeft: spacing.lg + spacing.xs,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  urgenciaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  urgenciaText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  contratoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.secondaryLight + '15',
    borderRadius: borderRadius.full,
    maxWidth: '60%',
  },
  contratoText: {
    fontSize: typography.xs,
    color: colors.secondary,
    fontWeight: typography.medium,
  },
  autorizacaoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  autorizacaoText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonDetalhes: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.secondaryLight + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  buttonDetalhesText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.secondary,
  },
  buttonCancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  buttonCancelarText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.error,
  },
})
