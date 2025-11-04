import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

// Pegar variáveis de ambiente do .env ou usar valores padrão para builds
const supabaseUrl = 
  Constants.expoConfig?.extra?.supabaseUrl || 
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://moswhtqcgjcpsideykzw.supabase.co' // Fallback para builds

const supabaseAnonKey = 
  Constants.expoConfig?.extra?.supabaseAnonKey || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vc3dodHFjZ2pjcHNpZGV5a3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MzczMjIsImV4cCI6MjA2NjAxMzMyMn0.qqljvTvAzrheLJMOKpTtVHOWvmTQzm-UA5pp319nh28' // Fallback para builds

// Logs para debug
console.log('🔍 Verificando configuração do Supabase...')
console.log('📍 Supabase URL:', supabaseUrl ? '✅ Configurada' : '❌ NÃO CONFIGURADA')
console.log('🔑 Supabase Key:', supabaseAnonKey ? '✅ Configurada' : '❌ NÃO CONFIGURADA')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Helper para verificar se está autenticado
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// Helper para pegar o usuário atual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper para fazer logout
export const signOut = async () => {
  await supabase.auth.signOut()
}

