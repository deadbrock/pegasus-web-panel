import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { isAuthenticated } from '../services/supabase'

export default function Index() {
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const authenticated = await isAuthenticated()
    
    if (authenticated) {
      router.replace('/(tabs)/dashboard')
    } else {
      router.replace('/(auth)/login')
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
})

