import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Card, Title, Paragraph, Text, Chip, FAB, ActivityIndicator, Badge } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

type Pedido = {
  id: string
  numero_pedido: string
  produto: string
  quantidade: number
  unidade: string
  status: string
  data_solicitacao: string
  urgencia: 'Baixa' | 'Média' | 'Alta' | 'Urgente'
}

export default function PedidosScreen() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [filter, setFilter] = useState<'todos' | 'ativos' | 'entregues'>('ativos')

  useEffect(() => {
    loadPedidos()
  }, [filter])

  const loadPedidos = async () => {
    try {
      // Dados mockados de pedidos de material
      const pedidosMock: Pedido[] = [
        {
          id: '1',
          numero_pedido: 'PED-2025-001',
          produto: 'Parafuso M8 x 50mm',
          quantidade: 100,
          unidade: 'UN',
          status: 'Aprovado',
          data_solicitacao: '2025-10-25',
          urgencia: 'Média'
        },
        {
          id: '2',
          numero_pedido: 'PED-2025-002',
          produto: 'Tinta Branca 18L',
          quantidade: 5,
          unidade: 'UN',
          status: 'Pendente',
          data_solicitacao: '2025-10-26',
          urgencia: 'Alta'
        },
        {
          id: '3',
          numero_pedido: 'PED-2025-003',
          produto: 'Luva PVC 50mm',
          quantidade: 20,
          unidade: 'UN',
          status: 'Entregue',
          data_solicitacao: '2025-10-20',
          urgencia: 'Baixa'
        },
      ]

      // Aplicar filtro
      let pedidosFiltrados = pedidosMock
      if (filter === 'ativos') {
        pedidosFiltrados = pedidosMock.filter(p => 
          ['Pendente', 'Aprovado', 'Separando'].includes(p.status)
        )
      } else if (filter === 'entregues') {
        pedidosFiltrados = pedidosMock.filter(p => p.status === 'Entregue')
      }

      setPedidos(pedidosFiltrados)
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
      case 'Aprovado':
        return '#3b82f6'
      case 'Separando':
        return '#8b5cf6'
      case 'Entregue':
        return '#10b981'
      case 'Cancelado':
        return '#ef4444'
      case 'Rejeitado':
        return '#dc2626'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'clock-outline'
      case 'Aprovado':
        return 'check-circle-outline'
      case 'Separando':
        return 'package-variant'
      case 'Entregue':
        return 'check-circle'
      case 'Cancelado':
        return 'close-circle'
      case 'Rejeitado':
        return 'alert-circle'
      default:
        return 'help-circle'
    }
  }

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'Baixa':
        return '#10b981'
      case 'Média':
        return '#f59e0b'
      case 'Alta':
        return '#ef4444'
      case 'Urgente':
        return '#dc2626'
      default:
        return '#6b7280'
    }
  }

  const getUrgenciaIcon = (urgencia: string) => {
    switch (urgencia) {
      case 'Baixa':
        return 'arrow-down'
      case 'Média':
        return 'minus'
      case 'Alta':
        return 'arrow-up'
      case 'Urgente':
        return 'fire'
      default:
        return 'minus'
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

                {/* Produto */}
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="package-variant" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{pedido.produto}</Text>
                </View>

                {/* Quantidade e Urgência */}
                <View style={styles.routeContainer}>
                  <View style={styles.routePoint}>
                    <MaterialCommunityIcons name="package-variant-closed" size={16} color="#3b82f6" />
                    <Text style={styles.routeText}>{pedido.quantidade} {pedido.unidade}</Text>
                  </View>
                  <Chip
                    icon={getUrgenciaIcon(pedido.urgencia)}
                    style={{ backgroundColor: getUrgenciaColor(pedido.urgencia) + '20' }}
                    textStyle={{ color: getUrgenciaColor(pedido.urgencia), fontSize: 11 }}
                  >
                    {pedido.urgencia}
                  </Chip>
                </View>

                {/* Data */}
                <View style={styles.bottomRow}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="calendar" size={14} color="#6b7280" />
                    <Text style={styles.smallText}>
                      {new Date(pedido.data_solicitacao).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
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

