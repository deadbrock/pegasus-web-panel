import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { Alert } from 'react-native'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || ''
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || ''

// Logs para debug
console.log('🔍 Verificando configuração do Supabase...')
console.log('📍 Supabase URL:', supabaseUrl || '❌ NÃO CONFIGURADA')
console.log('🔑 Supabase Key:', supabaseAnonKey ? '✅ Configurada' : '❌ NÃO CONFIGURADA')

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `
❌ ERRO DE CONFIGURAÇÃO

Falta configurar as credenciais do Supabase!

SOLUÇÃO:
1. Crie um arquivo ".env" na pasta mobile-supervisor
2. Adicione estas linhas:

EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

3. Pegue as credenciais em:
   https://supabase.com/dashboard → Settings → API

4. Reinicie o servidor: npx expo start -c

Consulte: mobile-supervisor/ENV_EXAMPLE.txt
`
  
  console.error(errorMsg)
  
  // Mostrar alert no app
  setTimeout(() => {
    Alert.alert(
      '❌ Configuração Necessária',
      'Credenciais do Supabase não configuradas.\n\nVeja o console do terminal para instruções.',
      [{ text: 'OK' }]
    )
  }, 100)
  
  throw new Error('Supabase URL e Anon Key são obrigatórias - Configure o arquivo .env')
}

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

