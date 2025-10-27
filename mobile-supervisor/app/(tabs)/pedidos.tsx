import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Card, Title, Paragraph, Text, Chip, FAB, ActivityIndicator, Badge } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../services/supabase'

type Pedido = {
  id: string
  numero_pedido: string
  cliente: string
  origem: string
  destino: string
  status: string
  data_entrega_prevista?: string
  valor?: number
}

export default function PedidosScreen() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [filter, setFilter] = useState<'todos' | 'ativos' | 'entregues'>('ativos')

  useEffect(() => {
    loadPedidos()
    
    // Configurar realtime
    const subscription = supabase
      .channel('pedidos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        loadPedidos()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [filter])

  const loadPedidos = async () => {
    try {
      let query = supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })

      // Aplicar filtro
      if (filter === 'ativos') {
        query = query.in('status', ['Pendente', 'Em Trânsito'])
      } else if (filter === 'entregues') {
        query = query.eq('status', 'Entregue')
      }

      const { data, error } = await query

      if (error) throw error

      setPedidos(data || [])
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadPedidos()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return '#fbbf24'
      case 'Em Trânsito':
        return '#3b82f6'
      case 'Entregue':
        return '#10b981'
      case 'Cancelado':
        return '#ef4444'
      case 'Atrasado':
        return '#dc2626'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'clock-outline'
      case 'Em Trânsito':
        return 'truck-fast'
      case 'Entregue':
        return 'check-circle'
      case 'Cancelado':
        return 'close-circle'
      case 'Atrasado':
        return 'alert-circle'
      default:
        return 'help-circle'
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'todos'}
          onPress={() => setFilter('todos')}
          style={styles.filterChip}
        >
          Todos
        </Chip>
        <Chip
          selected={filter === 'ativos'}
          onPress={() => setFilter('ativos')}
          style={styles.filterChip}
        >
          Ativos
        </Chip>
        <Chip
          selected={filter === 'entregues'}
          onPress={() => setFilter('entregues')}
          style={styles.filterChip}
        >
          Entregues
        </Chip>
      </View>

      {/* Lista de Pedidos */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {pedidos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant-closed" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
          </View>
        ) : (
          pedidos.map((pedido) => (
            <Card key={pedido.id} style={styles.pedidoCard}>
              <Card.Content>
                {/* Header do Pedido */}
                <View style={styles.pedidoHeader}>
                  <View style={styles.pedidoTitleRow}>
                    <MaterialCommunityIcons 
                      name="package-variant" 
                      size={20} 
                      color="#3b82f6" 
                    />
                    <Text style={styles.pedidoNumero}>{pedido.numero_pedido}</Text>
                  </View>
                  <Chip
                    icon={getStatusIcon(pedido.status)}
                    style={{ backgroundColor: getStatusColor(pedido.status) + '20' }}
                    textStyle={{ color: getStatusColor(pedido.status) }}
                  >
                    {pedido.status}
                  </Chip>
                </View>

                {/* Cliente */}
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="account" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{pedido.cliente}</Text>
                </View>

                {/* Origem e Destino */}
                <View style={styles.routeContainer}>
                  <View style={styles.routePoint}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#10b981" />
                    <Text style={styles.routeText}>{pedido.origem}</Text>
                  </View>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#9ca3af" />
                  <View style={styles.routePoint}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#ef4444" />
                    <Text style={styles.routeText}>{pedido.destino}</Text>
                  </View>
                </View>

                {/* Data e Valor */}
                <View style={styles.bottomRow}>
                  {pedido.data_entrega_prevista && (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="calendar" size={14} color="#6b7280" />
                      <Text style={styles.smallText}>
                        {new Date(pedido.data_entrega_prevista).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  )}
                  {pedido.valor && (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="currency-usd" size={14} color="#6b7280" />
                      <Text style={styles.smallText}>
                        {pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* FAB para novo pedido */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // TODO: Navegar para tela de novo pedido
          console.log('Novo pedido')
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterChip: {
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  pedidoCard: {
    margin: 12,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pedidoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pedidoNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    gap: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  routeText: {
    fontSize: 12,
    color: '#4b5563',
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  smallText: {
    fontSize: 12,
    color: '#6b7280',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3b82f6',
  },
})

