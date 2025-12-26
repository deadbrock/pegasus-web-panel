import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Text as RNText, Platform } from 'react-native'
import { Text, ActivityIndicator } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { fetchMeusPedidos } from '../../services/pedidos-mobile-service'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'

type Stats = {
  pedidos_ativos: number
  pedidos_pendentes: number
  pedidos_concluidos: number
  total_pedidos: number
}

export default function DashboardScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
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
      const storedName = await AsyncStorage.getItem('userName')
      const storedUserId = await AsyncStorage.getItem('userId')
      
      if (storedName) setUserName(storedName)
      if (storedUserId) setSupervisorId(storedUserId)
      
      if (!storedUserId) {
        console.log('⚠️ Nenhum ID de supervisor encontrado')
        setLoading(false)
        setRefreshing(false)
        return
      }
      
      const pedidos = await fetchMeusPedidos(storedUserId)
      
      const ativos = pedidos.filter(p => 
        ['Aprovado', 'Em Separação', 'Saiu para Entrega'].includes(p.status)
      ).length
      
      const pendentes = pedidos.filter(p => 
        p.status === 'Pendente' || p.status === 'Aguardando Autorização'
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <RNText style={styles.loadingText}>Carregando...</RNText>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header Moderno com Glassmorphism */}
      <LinearGradient
        colors={['#1e40af', '#1e3a8a']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <RNText style={styles.greeting}>Olá,</RNText>
            <RNText style={styles.userName}>{userName} 👋</RNText>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <MaterialCommunityIcons name="account-circle" size={48} color={colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Cards de Estatísticas Modernos */}
        <View style={styles.statsSection}>
          <RNText style={styles.sectionTitle}>Visão Geral</RNText>
          
          <View style={styles.statsGrid}>
            {/* Card Em Andamento */}
            <TouchableOpacity style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="package-variant" size={28} color={colors.white} />
              </View>
              <RNText style={styles.statNumber}>{stats.pedidos_ativos}</RNText>
              <RNText style={styles.statLabel}>Em Andamento</RNText>
            </TouchableOpacity>

            {/* Card Pendentes */}
            <TouchableOpacity style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="clock-outline" size={28} color={colors.white} />
              </View>
              <RNText style={styles.statNumber}>{stats.pedidos_pendentes}</RNText>
              <RNText style={styles.statLabel}>Pendentes</RNText>
            </TouchableOpacity>

            {/* Card Concluídos */}
            <TouchableOpacity style={[styles.statCard, { backgroundColor: '#22c55e' }]}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="check-circle" size={28} color={colors.white} />
              </View>
              <RNText style={styles.statNumber}>{stats.pedidos_concluidos}</RNText>
              <RNText style={styles.statLabel}>Concluídos</RNText>
            </TouchableOpacity>

            {/* Card Total */}
            <TouchableOpacity style={[styles.statCard, { backgroundColor: '#8b5cf6' }]}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="format-list-bulleted" size={28} color={colors.white} />
              </View>
              <RNText style={styles.statNumber}>{stats.total_pedidos}</RNText>
              <RNText style={styles.statLabel}>Total</RNText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ações Rápidas Modernas */}
        <View style={styles.actionsSection}>
          <RNText style={styles.sectionTitle}>Ações Rápidas</RNText>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/pedidos')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
              <MaterialCommunityIcons name="plus-circle" size={28} color="#3b82f6" />
            </View>
            <View style={styles.actionContent}>
              <RNText style={styles.actionTitle}>Novo Pedido de Material</RNText>
              <RNText style={styles.actionDescription}>Solicitar materiais do almoxarifado</RNText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/contratos')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
              <MaterialCommunityIcons name="file-document" size={28} color="#22c55e" />
            </View>
            <View style={styles.actionContent}>
              <RNText style={styles.actionTitle}>Ver Contratos</RNText>
              <RNText style={styles.actionDescription}>Gerenciar contratos ativos</RNText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Espaçamento inferior */}
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.base,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.base,
    color: colors.white,
    opacity: 0.9,
    fontWeight: typography.normal,
    marginBottom: 4,
  },
  userName: {
    fontSize: typography['3xl'],
    color: colors.white,
    fontWeight: typography.bold,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  statIcon: {
    marginBottom: spacing.md,
  },
  statNumber: {
    fontSize: typography['4xl'],
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.white,
    opacity: 0.9,
    fontWeight: typography.medium,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
})
