import { useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    // Esperar 1.5 segundos e ir direto para o login
    const timer = setTimeout(() => {
      router.replace('/(auth)/login')
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.container}>
        {/* Logo Pegasus */}
        <View style={styles.logoContainer}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="horse-variant" size={64} color="#ffffff" />
            <View style={styles.wingsLeft}>
              <MaterialCommunityIcons name="bird" size={32} color="#ffffff" style={{ opacity: 0.9 }} />
            </View>
            <View style={styles.wingsRight}>
              <MaterialCommunityIcons name="bird" size={32} color="#ffffff" style={{ opacity: 0.9, transform: [{ scaleX: -1 }] }} />
            </View>
          </View>
          
          <Text style={styles.brandName}>PEGASUS</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Sistema de Gestão Logística</Text>
        </View>

        {/* Loading */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Pegasus Logistics © 2025</Text>
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
    paddingVertical: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  iconWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 70,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
  },
  wingsLeft: {
    position: 'absolute',
    left: -15,
    top: 30,
    transform: [{ rotate: '-30deg' }],
  },
  wingsRight: {
    position: 'absolute',
    right: -15,
    top: 30,
    transform: [{ rotate: '30deg' }],
  },
  brandName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    marginBottom: 12,
  },
  divider: {
    width: 80,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginVertical: 16,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    opacity: 0.95,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    opacity: 0.9,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    opacity: 0.8,
  },
})

