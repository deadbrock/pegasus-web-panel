import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Card, Title, Paragraph, Text, Chip, ActivityIndicator } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase, getCurrentUser } from '../../services/supabase'

type Stats = {
  pedidos_ativos: number
  pedidos_entregues_hoje: number
  veiculos_em_rota: number
  alertas_criticos: number
}

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userName, setUserName] = useState('')
  const [stats, setStats] = useState<Stats>({
    pedidos_ativos: 0,
    pedidos_entregues_hoje: 0,
    veiculos_em_rota: 0,
    alertas_criticos: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Buscar nome do usuário
      const user = await getCurrentUser()
      if (user) {
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Supervisor')
      }

      // Buscar estatísticas
      await loadStats()
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadStats = async () => {
    try {
      // Pedidos ativos (Pendente ou Em Trânsito)
      const { count: pedidosAtivos } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Pendente', 'Em Trânsito'])

      // Pedidos entregues hoje
      const hoje = new Date().toISOString().split('T')[0]
      const { count: pedidosEntregues } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Entregue')
        .gte('data_entrega', hoje)

      // Veículos em rota (status Ativo)
      const { count: veiculosRota } = await supabase
        .from('veiculos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Ativo')

      // Alertas críticos (estoque + documentos)
      const { count: estoquesCriticos } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .lte('estoque_atual', 0)

      const { count: documentosVencidos } = await supabase
        .from('documentos')
        .select('*', { count: 'exact', head: true })
        .lt('data_validade', new Date().toISOString())

      setStats({
        pedidos_ativos: pedidosAtivos || 0,
        pedidos_entregues_hoje: pedidosEntregues || 0,
        veiculos_em_rota: veiculosRota || 0,
        alertas_criticos: (estoquesCriticos || 0) + (documentosVencidos || 0),
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
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
            <MaterialCommunityIcons name="package-variant" size={32} color="#3b82f6" />
            <Title style={styles.statNumber}>{stats.pedidos_ativos}</Title>
            <Paragraph style={styles.statLabel}>Pedidos Ativos</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, styles.greenCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="check-circle" size={32} color="#10b981" />
            <Title style={styles.statNumber}>{stats.pedidos_entregues_hoje}</Title>
            <Paragraph style={styles.statLabel}>Entregues Hoje</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, styles.purpleCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="truck-fast" size={32} color="#8b5cf6" />
            <Title style={styles.statNumber}>{stats.veiculos_em_rota}</Title>
            <Paragraph style={styles.statLabel}>Veículos em Rota</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, styles.redCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="alert-circle" size={32} color="#ef4444" />
            <Title style={styles.statNumber}>{stats.alertas_criticos}</Title>
            <Paragraph style={styles.statLabel}>Alertas Críticos</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Ações Rápidas</Title>
        
        <Card style={styles.actionCard}>
          <Card.Content style={styles.actionContent}>
            <MaterialCommunityIcons name="plus-circle" size={24} color="#3b82f6" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Novo Pedido</Text>
              <Text style={styles.actionDescription}>Criar um novo pedido de entrega</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content style={styles.actionContent}>
            <MaterialCommunityIcons name="clipboard-check" size={24} color="#10b981" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Checklist Vistoria</Text>
              <Text style={styles.actionDescription}>Realizar vistoria de veículo</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content style={styles.actionContent}>
            <MaterialCommunityIcons name="map-search" size={24} color="#8b5cf6" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Rastrear Veículo</Text>
              <Text style={styles.actionDescription}>Ver localização em tempo real</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
          </Card.Content>
        </Card>
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
  greenCard: {
    backgroundColor: '#f0fdf4',
  },
  purpleCard: {
    backgroundColor: '#faf5ff',
  },
  redCard: {
    backgroundColor: '#fef2f2',
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

