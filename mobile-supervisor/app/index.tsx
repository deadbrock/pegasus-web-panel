import { useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <LinearGradient
      colors={['#a2122a', '#7d0e1f']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={styles.container}>
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="truck-fast" size={72} color={colors.white} />
          </View>
          
          <Text style={styles.brandName}>PEGASUS</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Sistema de Gestão Logística</Text>
          <Text style={styles.subtitleSmall}>Supervisor</Text>
        </View>

        {/* Loading */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Carregando aplicação...</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Pegasus Logistics</Text>
          <Text style={styles.footerVersion}>v1.0.0 • 2025</Text>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl * 2,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: spacing.xl,
    ...shadows.xl,
  },
  brandName: {
    fontSize: typography['5xl'],
    fontWeight: typography.extrabold,
    color: colors.white,
    letterSpacing: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: spacing.md,
  },
  divider: {
    width: 80,
    height: 4,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.md,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: typography.lg,
    color: colors.white,
    fontWeight: typography.semibold,
    opacity: 0.95,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitleSmall: {
    fontSize: typography.base,
    color: colors.white,
    fontWeight: typography.medium,
    opacity: 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.base,
    color: colors.white,
    fontWeight: typography.medium,
    opacity: 0.9,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontSize: typography.sm,
    color: colors.white,
    fontWeight: typography.semibold,
    opacity: 0.9,
  },
  footerVersion: {
    fontSize: typography.xs,
    color: colors.white,
    opacity: 0.7,
  },
})
