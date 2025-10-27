import { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'
import { router } from 'expo-router'

export default function Index() {
  const [status, setStatus] = useState('Iniciando...')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔍 Verificando autenticação...')
      setStatus('Verificando autenticação...')
      
      // Importar dinamicamente para capturar erros
      const { isAuthenticated } = await import('../services/supabase')
      
      setStatus('Conectando ao Supabase...')
      const authenticated = await isAuthenticated()
      
      console.log('✅ Autenticação verificada:', authenticated)
      
      if (authenticated) {
        setStatus('Redirecionando para dashboard...')
        setTimeout(() => router.replace('/(tabs)/dashboard'), 500)
      } else {
        setStatus('Redirecionando para login...')
        setTimeout(() => router.replace('/(auth)/login'), 500)
      }
    } catch (error: any) {
      console.error('❌ Erro na inicialização:', error)
      setStatus(`Erro: ${error.message}`)
      
      // Mesmo com erro, tentar ir para login após 3 segundos
      setTimeout(() => {
        console.log('Forçando redirecionamento para login...')
        router.replace('/(auth)/login')
      }, 3000)
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.statusText}>{status}</Text>
      <Text style={styles.helpText}>Se travar aqui, veja o console do terminal</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  statusText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  helpText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
})

