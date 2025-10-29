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
}

export function PedidoCardModern({
  pedido,
  getStatusColor,
  getStatusIcon,
  getUrgenciaColor,
  getUrgenciaIcon,
}: PedidoCardModernProps) {
  return (
    <View style={styles.pedidoCardModern}>
      {/* Header com Gradiente */}
      <View style={[styles.pedidoHeaderModern, { backgroundColor: getStatusColor(pedido.status) + '15' }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.numeroContainer}>
            <MaterialCommunityIcons 
              name="file-document-outline" 
              size={18} 
              color={getStatusColor(pedido.status)} 
            />
            <Text style={[styles.pedidoNumeroModern, { color: getStatusColor(pedido.status) }]}>
              {pedido.numero_pedido}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pedido.status) }]}>
            <MaterialCommunityIcons 
              name={getStatusIcon(pedido.status) as any} 
              size={12} 
              color="white" 
            />
            <Text style={styles.statusText}>{pedido.status}</Text>
          </View>
        </View>
        
        <Text style={styles.dataTexto}>
          {format(new Date(pedido.data_solicitacao), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
        </Text>
      </View>

      {/* Corpo do Card */}
      <View style={styles.pedidoBodyModern}>
        {/* Resumo Rápido */}
        <View style={styles.resumoRow}>
          <View style={styles.resumoItem}>
            <MaterialCommunityIcons name="package-variant" size={20} color="#3b82f6" />
            <Text style={styles.resumoLabel}>Itens</Text>
            <Text style={styles.resumoValue}>{pedido.itens?.length || 0}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.resumoItem}>
            <MaterialCommunityIcons 
              name={getUrgenciaIcon(pedido.urgencia) as any} 
              size={20} 
              color={getUrgenciaColor(pedido.urgencia)} 
            />
            <Text style={styles.resumoLabel}>Urgência</Text>
            <Text style={[styles.resumoValue, { color: getUrgenciaColor(pedido.urgencia) }]}>
              {pedido.urgencia}
            </Text>
          </View>
        </View>

        {/* Lista de Produtos */}
        {pedido.itens && pedido.itens.length > 0 && (
          <View style={styles.produtosSection}>
            <Text style={styles.produtosSectionTitle}>Produtos Solicitados</Text>
            {pedido.itens.slice(0, 3).map((item, index) => (
              <View key={item.id || index} style={styles.produtoItem}>
                <View style={styles.produtoIconContainer}>
                  <MaterialCommunityIcons name="cube-outline" size={16} color="#3b82f6" />
                </View>
                <View style={styles.produtoInfo}>
                  <Text style={styles.produtoNome} numberOfLines={1}>
                    {item.produto_nome}
                  </Text>
                  <Text style={styles.produtoCodigo}>
                    {item.produto_codigo} • {item.quantidade} {item.unidade}
                  </Text>
                </View>
                <View style={styles.produtoQuantidadeBadge}>
                  <Text style={styles.produtoQuantidadeText}>{item.quantidade}</Text>
                </View>
              </View>
            ))}
            {pedido.itens.length > 3 && (
              <Text style={styles.maisItensTexto}>
                +{pedido.itens.length - 3} {pedido.itens.length - 3 === 1 ? 'item' : 'itens'} adicional(is)
              </Text>
            )}
          </View>
        )}

        {/* Badges e Alertas */}
        <View style={styles.badgesRow}>
          {pedido.requer_autorizacao && (
            <View style={[
              styles.alertBadge, 
              { backgroundColor: pedido.autorizacao_status === 'Aprovada' ? '#dcfce7' : '#fef3c7' }
            ]}>
              <MaterialCommunityIcons 
                name={pedido.autorizacao_status === 'Aprovada' ? 'check-circle' : 'alert-circle'}
                size={14} 
                color={pedido.autorizacao_status === 'Aprovada' ? '#16a34a' : '#f59e0b'} 
              />
              <Text style={[
                styles.alertBadgeText,
                { color: pedido.autorizacao_status === 'Aprovada' ? '#16a34a' : '#f59e0b' }
              ]}>
                {pedido.autorizacao_status === 'Aprovada' ? 'Autorizado' : 'Aguardando Autorização'}
              </Text>
            </View>
          )}
          
          {pedido.observacoes && (
            <View style={styles.alertBadge2}>
              <MaterialCommunityIcons name="note-text-outline" size={14} color="#6366f1" />
              <Text style={styles.alertBadgeText2}>Com observações</Text>
            </View>
          )}
        </View>

        {/* Observações Preview */}
        {pedido.observacoes && (
          <View style={styles.observacoesPreview}>
            <MaterialCommunityIcons name="comment-quote-outline" size={14} color="#64748b" />
            <Text style={styles.observacoesPreviewText} numberOfLines={2}>
              {pedido.observacoes}
            </Text>
          </View>
        )}
      </View>

      {/* Footer com Ações */}
      <View style={styles.pedidoFooterModern}>
        <TouchableOpacity style={styles.footerButton}>
          <MaterialCommunityIcons name="eye-outline" size={18} color="#3b82f6" />
          <Text style={styles.footerButtonText}>Detalhes</Text>
        </TouchableOpacity>
        
        {pedido.status === 'Pendente' && (
          <>
            <View style={styles.footerDivider} />
            <TouchableOpacity style={styles.footerButton}>
              <MaterialCommunityIcons name="close-circle-outline" size={18} color="#ef4444" />
              <Text style={[styles.footerButtonText, { color: '#ef4444' }]}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

