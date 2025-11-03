import { useState } from 'react'
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../services/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos')
      return
    }

    setLoading(true)
    
    try {
      // Autenticação real com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Salvar dados do usuário no AsyncStorage
        await AsyncStorage.setItem('userId', data.user.id)
        await AsyncStorage.setItem('userEmail', data.user.email || '')
        await AsyncStorage.setItem('userName', data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Supervisor')
        
        console.log('✅ Login bem-sucedido:', data.user.email)
        
        // Ir para dashboard
        router.replace('/(tabs)/dashboard')
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error)
      
      let mensagemErro = 'Não foi possível fazer login. Verifique suas credenciais.'
      
      if (error.message?.includes('Invalid login credentials')) {
        mensagemErro = 'Email ou senha inválidos'
      } else if (error.message?.includes('Email not confirmed')) {
        mensagemErro = 'Email não confirmado. Verifique sua caixa de entrada.'
      } else if (error.message) {
        mensagemErro = error.message
      }
      
      Alert.alert('Erro no Login', mensagemErro)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header com Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {/* Ícone Pegasus (Cavalo com Asas) */}
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons name="horse-variant" size={48} color="#ffffff" />
                <View style={styles.wingsLeft}>
                  <MaterialCommunityIcons name="bird" size={24} color="#ffffff" style={{ opacity: 0.9 }} />
                </View>
                <View style={styles.wingsRight}>
                  <MaterialCommunityIcons name="bird" size={24} color="#ffffff" style={{ opacity: 0.9, transform: [{ scaleX: -1 }] }} />
                </View>
              </View>
              
              <Text style={styles.brandName}>PEGASUS</Text>
              <View style={styles.divider} />
              <Text style={styles.subtitle}>Sistema de Gestão Logística</Text>
              <Text style={styles.loginText}>Acesso Supervisor</Text>
            </View>
          </View>

          {/* Card de Login */}
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="shield-account" size={28} color="#1e40af" />
              <Text style={styles.cardTitle}>Autenticação</Text>
            </View>

            {/* Formulário */}
            <View style={styles.form}>
              <TextInput
                label="Email Corporativo"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                mode="outlined"
                style={styles.input}
                outlineColor="#cbd5e1"
                activeOutlineColor="#3b82f6"
                left={<TextInput.Icon icon="email-outline" color="#64748b" />}
                disabled={loading}
                theme={{
                  colors: {
                    background: '#ffffff',
                  },
                }}
              />

              <TextInput
                label="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                mode="outlined"
                style={styles.input}
                outlineColor="#cbd5e1"
                activeOutlineColor="#3b82f6"
                left={<TextInput.Icon icon="lock-outline" color="#64748b" />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    onPress={() => setShowPassword(!showPassword)}
                    color="#64748b"
                  />
                }
                disabled={loading}
                theme={{
                  colors: {
                    background: '#ffffff',
                  },
                }}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                icon={loading ? undefined : "login"}
              >
                {loading ? 'Autenticando...' : 'Entrar no Sistema'}
              </Button>
            </View>

            {/* Info de Segurança */}
            <View style={styles.securityInfo}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#10b981" />
              <Text style={styles.securityText}>Conexão Segura SSL</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pegasus Logistics © 2025</Text>
            <Text style={styles.version}>v1.0.0</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  wingsLeft: {
    position: 'absolute',
    left: -10,
    top: 20,
    transform: [{ rotate: '-30deg' }],
  },
  wingsRight: {
    position: 'absolute',
    right: -10,
    top: 20,
    transform: [{ rotate: '30deg' }],
  },
  brandName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginVertical: 12,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    opacity: 0.95,
    marginBottom: 4,
    textAlign: 'center',
  },
  loginText: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    fontSize: 15,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  securityText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    opacity: 0.9,
  },
  version: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.7,
  },
})
