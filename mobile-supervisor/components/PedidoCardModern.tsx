import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { modernCardStyles as styles } from '../styles/pedido-card-modern.styles'
import { PedidoMobile } from '../services/pedidos-mobile-service'

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

  return (
    <View style={styles.pedidoCardModern}>
      {/* Header Compacto */}
      <View style={styles.headerCompacto}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons 
            name="file-document" 
            size={20} 
            color={getStatusColor(pedido.status)} 
          />
          <Text style={[styles.numeroCompacto, { color: getStatusColor(pedido.status) }]}>
            {pedido.numero_pedido}
          </Text>
        </View>
        
        <View style={[styles.statusBadgeCompacto, { backgroundColor: getStatusColor(pedido.status) }]}>
          <MaterialCommunityIcons 
            name={getStatusIcon(pedido.status) as any} 
            size={14} 
            color="white" 
          />
          <Text style={styles.statusTextCompacto}>{pedido.status}</Text>
        </View>
      </View>

      {/* Info Principal - Destaque */}
      <View style={styles.infoDestaque}>
        <View style={styles.infoDestaqueLeft}>
          <View style={styles.iconeBadge}>
            <MaterialCommunityIcons name="cube-outline" size={18} color="#3b82f6" />
          </View>
          <View style={styles.infoDestaqueTextos}>
            <Text style={styles.labelDestaque}>
              {totalItens} {totalItens === 1 ? 'ITEM' : 'ITENS'}
            </Text>
            {primeiroItem && (
              <Text style={styles.primeiroItemNome} numberOfLines={1}>
                {primeiroItem.produto_nome}
              </Text>
            )}
          </View>
        </View>
        
        <View style={[styles.urgenciaBadge, { borderColor: getUrgenciaColor(pedido.urgencia) }]}>
          <MaterialCommunityIcons 
            name={getUrgenciaIcon(pedido.urgencia) as any} 
            size={14} 
            color={getUrgenciaColor(pedido.urgencia)} 
          />
          <Text style={[styles.urgenciaTexto, { color: getUrgenciaColor(pedido.urgencia) }]}>
            {pedido.urgencia}
          </Text>
        </View>
      </View>

      {/* Lista Resumida de Produtos */}
      {totalItens > 0 && (
        <View style={styles.listaProdutosResumida}>
          {pedido.itens!.slice(0, 2).map((item, index) => (
            <View key={item.id || index} style={styles.produtoLinha}>
              <View style={styles.produtoLinhaInfo}>
                <Text style={styles.produtoLinhaCodigo}>{item.produto_codigo}</Text>
                <View style={styles.produtoLinhaDot} />
                <Text style={styles.produtoLinhaQuantidade}>
                  {item.quantidade} {item.unidade}
                </Text>
              </View>
            </View>
          ))}
          {totalItens > 2 && (
            <Text style={styles.maisItensCompacto}>
              +{totalItens - 2} {totalItens - 2 === 1 ? 'produto' : 'produtos'}
            </Text>
          )}
        </View>
      )}

      {/* Status de Autorização - Destaque */}
      {pedido.requer_autorizacao && (
        <View style={[
          styles.autorizacaoDestaque,
          { 
            backgroundColor: pedido.autorizacao_status === 'Aprovada' ? '#dcfce7' : '#fef3c7',
            borderLeftColor: pedido.autorizacao_status === 'Aprovada' ? '#16a34a' : '#f59e0b'
          }
        ]}>
          <MaterialCommunityIcons 
            name={pedido.autorizacao_status === 'Aprovada' ? 'check-decagram' : 'clock-alert-outline'}
            size={18} 
            color={pedido.autorizacao_status === 'Aprovada' ? '#16a34a' : '#f59e0b'} 
          />
          <Text style={[
            styles.autorizacaoTexto,
            { color: pedido.autorizacao_status === 'Aprovada' ? '#16a34a' : '#f59e0b' }
          ]}>
            {pedido.autorizacao_status === 'Aprovada' ? '✓ Autorizado' : '⏱ Aguardando Autorização'}
          </Text>
        </View>
      )}

      {/* Footer Compacto */}
      <View style={styles.footerCompacto}>
        <Text style={styles.dataCompacta}>
          {format(new Date(pedido.data_solicitacao), "dd/MM 'às' HH:mm", { locale: ptBR })}
        </Text>
        
        <View style={styles.footerAcoes}>
          <TouchableOpacity style={styles.botaoDetalhes} onPress={onDetalhesPress}>
            <MaterialCommunityIcons name="eye" size={16} color="#3b82f6" />
            <Text style={styles.botaoDetalhesTexto}>Ver Detalhes</Text>
          </TouchableOpacity>
          
          {pedido.status === 'Pendente' && (
            <TouchableOpacity style={styles.botaoCancelar} onPress={onCancelarPress}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

