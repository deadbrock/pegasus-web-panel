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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header com Gradiente */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <RNText style={styles.greeting}>Olá,</RNText>
            <RNText style={styles.userName}>{userName}!</RNText>
            <RNText style={styles.headerSubtitle}>Bem-vindo ao sistema</RNText>
          </View>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={56} color={colors.white} />
          </View>
        </View>
      </LinearGradient>

      {/* Cards de Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          {/* Pedidos Ativos */}
          <View style={styles.statCard}>
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              style={styles.statGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="package-variant" size={32} color={colors.white} />
              <RNText style={styles.statNumber}>{stats.pedidos_ativos}</RNText>
              <RNText style={styles.statLabel}>Em Andamento</RNText>
            </LinearGradient>
          </View>

          {/* Pedidos Pendentes */}
          <View style={styles.statCard}>
            <LinearGradient
              colors={[colors.warning, '#d97706']}
              style={styles.statGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="clock-outline" size={32} color={colors.white} />
              <RNText style={styles.statNumber}>{stats.pedidos_pendentes}</RNText>
              <RNText style={styles.statLabel}>Pendentes</RNText>
            </LinearGradient>
          </View>

          {/* Pedidos Concluídos */}
          <View style={styles.statCard}>
            <LinearGradient
              colors={[colors.success, '#059669']}
              style={styles.statGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="check-circle" size={32} color={colors.white} />
              <RNText style={styles.statNumber}>{stats.pedidos_concluidos}</RNText>
              <RNText style={styles.statLabel}>Concluídos</RNText>
            </LinearGradient>
          </View>

          {/* Total de Pedidos */}
          <View style={styles.statCard}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.statGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="format-list-bulleted" size={32} color={colors.white} />
              <RNText style={styles.statNumber}>{stats.total_pedidos}</RNText>
              <RNText style={styles.statLabel}>Total</RNText>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.section}>
        <RNText style={styles.sectionTitle}>Ações Rápidas</RNText>
        
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/pedidos')}
          activeOpacity={0.7}
        >
          <View style={styles.actionCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.secondaryLight + '20' }]}>
              <MaterialCommunityIcons name="plus-circle" size={28} color={colors.secondary} />
            </View>
            <View style={styles.actionContent}>
              <RNText style={styles.actionTitle}>Novo Pedido de Material</RNText>
              <RNText style={styles.actionDescription}>Solicitar materiais do almoxarifado</RNText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray400} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/pedidos')}
          activeOpacity={0.7}
        >
          <View style={styles.actionCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
              <MaterialCommunityIcons name="history" size={28} color={colors.success} />
            </View>
            <View style={styles.actionContent}>
              <RNText style={styles.actionTitle}>Histórico de Pedidos</RNText>
              <RNText style={styles.actionDescription}>Ver todos os pedidos anteriores</RNText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray400} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/contratos')}
          activeOpacity={0.7}
        >
          <View style={styles.actionCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="file-document-multiple" size={28} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <RNText style={styles.actionTitle}>Gerenciar Contratos</RNText>
              <RNText style={styles.actionDescription}>Cadastrar e editar contratos</RNText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray400} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Status do Sistema */}
      <View style={styles.section}>
        <RNText style={styles.sectionTitle}>Status do Sistema</RNText>
        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
            <RNText style={styles.statusText}>Sistema Online</RNText>
          </View>
          <View style={styles.statusBadge}>
            <MaterialCommunityIcons name="sync" size={16} color={colors.secondary} />
            <RNText style={styles.statusText}>Sincronizado</RNText>
          </View>
        </View>
      </View>

      {/* Espaço extra para a tab bar */}
      <View style={{ height: Platform.OS === 'ios' ? 100 + insets.bottom : 140 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.base,
  },
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.base,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography['3xl'],
    fontWeight: typography.extrabold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sm,
    color: colors.white,
    opacity: 0.8,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '48.5%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  statGradient: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: typography['4xl'],
    fontWeight: typography.extrabold,
    color: colors.white,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.white,
    opacity: 0.9,
    fontWeight: typography.medium,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.xs,
    color: colors.success,
    fontWeight: typography.semibold,
  },
})

