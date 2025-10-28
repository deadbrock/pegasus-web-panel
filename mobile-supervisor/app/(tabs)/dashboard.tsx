import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native'
import { Card, Title, Paragraph, Text, Chip, ActivityIndicator } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchMeusPedidos, type PedidoMobile } from '../../services/pedidos-mobile-service'

type Stats = {
  pedidos_ativos: number
  pedidos_pendentes: number
  pedidos_concluidos: number
  total_pedidos: number
}

export default function DashboardScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userName, setUserName] = useState('Supervisor')
  const [supervisorId, setSupervisorId] = useState('')
  const [stats, setStats] = useState<Stats>({
    pedidos_ativos: 0,
    pedidos_pendentes: 0,
    pedidos_concluidos: 0,
    total_pedidos: 0,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Carregar nome do usuário do AsyncStorage
      const storedName = await AsyncStorage.getItem('userName')
      const storedUserId = await AsyncStorage.getItem('userId')
      
      if (storedName) setUserName(storedName)
      if (storedUserId) setSupervisorId(storedUserId)
      
      // Só carregar pedidos se tiver um ID válido
      if (!storedUserId) {
        console.log('⚠️ Nenhum ID de supervisor encontrado')
        setLoading(false)
        setRefreshing(false)
        return
      }
      
      // Carregar pedidos do supervisor
      const pedidos = await fetchMeusPedidos(storedUserId)
      
      // Calcular estatísticas
      const ativos = pedidos.filter(p => 
        ['Aprovado', 'Em Separação', 'Saiu para Entrega'].includes(p.status)
      ).length
      
      const pendentes = pedidos.filter(p => 
        p.status === 'Pendente'
      ).length
      
      const concluidos = pedidos.filter(p => 
        p.status === 'Entregue'
      ).length
      
      setStats({
        pedidos_ativos: ativos,
        pedidos_pendentes: pendentes,
        pedidos_concluidos: concluidos,
        total_pedidos: pedidos.length
      })
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadDashboardData()
  }

  const handleNovoPedido = () => {
    router.push('/(tabs)/pedidos')
  }

  const handleHistorico = () => {
    router.push('/(tabs)/pedidos')
  }

  const handlePendentes = () => {
    router.push('/(tabs)/pedidos')
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Title style={styles.userName}>{userName}!</Title>
        </View>
        <MaterialCommunityIcons name="account-circle" size={48} color="#3b82f6" />
      </View>

      {/* Cards de Estatísticas */}
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, styles.blueCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="clipboard-list" size={32} color="#3b82f6" />
            <Title style={styles.statNumber}>{stats.pedidos_ativos}</Title>
            <Paragraph style={styles.statLabel}>Em Andamento</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, styles.orangeCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="clock-outline" size={32} color="#f59e0b" />
            <Title style={styles.statNumber}>{stats.pedidos_pendentes}</Title>
            <Paragraph style={styles.statLabel}>Pendentes</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, styles.greenCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="check-circle" size={32} color="#10b981" />
            <Title style={styles.statNumber}>{stats.pedidos_concluidos}</Title>
            <Paragraph style={styles.statLabel}>Concluídos</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, styles.purpleCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="format-list-bulleted" size={32} color="#8b5cf6" />
            <Title style={styles.statNumber}>{stats.total_pedidos}</Title>
            <Paragraph style={styles.statLabel}>Total de Pedidos</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Ações Rápidas</Title>
        
        <TouchableOpacity onPress={handleNovoPedido}>
          <Card style={styles.actionCard}>
            <Card.Content style={styles.actionContent}>
              <MaterialCommunityIcons name="plus-circle" size={24} color="#3b82f6" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Novo Pedido de Material</Text>
                <Text style={styles.actionDescription}>Solicitar materiais do almoxarifado</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
            </Card.Content>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleHistorico}>
          <Card style={styles.actionCard}>
            <Card.Content style={styles.actionContent}>
              <MaterialCommunityIcons name="history" size={24} color="#10b981" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Histórico de Pedidos</Text>
                <Text style={styles.actionDescription}>Ver todos os pedidos anteriores</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
            </Card.Content>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePendentes}>
          <Card style={styles.actionCard}>
            <Card.Content style={styles.actionContent}>
              <MaterialCommunityIcons name="clipboard-text" size={24} color="#f59e0b" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Pedidos Pendentes</Text>
                <Text style={styles.actionDescription}>Verificar status dos pedidos</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Status do Sistema */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Status do Sistema</Title>
        <View style={styles.statusRow}>
          <Chip icon="check-circle" style={styles.statusChip} textStyle={styles.statusText}>
            Sistema Online
          </Chip>
          <Chip icon="sync" style={styles.statusChip} textStyle={styles.statusText}>
            Sincronizado
          </Chip>
        </View>
      </View>

    </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    marginBottom: 4,
  },
  blueCard: {
    backgroundColor: '#eff6ff',
  },
  orangeCard: {
    backgroundColor: '#fff7ed',
  },
  greenCard: {
    backgroundColor: '#f0fdf4',
  },
  purpleCard: {
    backgroundColor: '#faf5ff',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  actionCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    color: '#15803d',
  },
})

