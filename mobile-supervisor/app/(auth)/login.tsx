import { useState } from 'react'
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Text as RNText } from 'react-native'
import { TextInput, Text } from 'react-native-paper'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../services/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (error) throw error

      if (data.user) {
        await AsyncStorage.setItem('userId', data.user.id)
        await AsyncStorage.setItem('userEmail', data.user.email || '')
        await AsyncStorage.setItem('userName', data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Supervisor')
        
        console.log('✅ Login bem-sucedido:', data.user.email)
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
      colors={[colors.primary, colors.primaryDark]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header com Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons name="truck-fast" size={48} color={colors.white} />
              </View>
              
              <RNText style={styles.brandName}>PEGASUS</RNText>
              <View style={styles.divider} />
              <RNText style={styles.subtitle}>Sistema de Gestão Logística</RNText>
              <RNText style={styles.roleText}>Acesso Supervisor</RNText>
            </View>
          </View>

          {/* Card de Login */}
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="shield-account" size={28} color={colors.secondary} />
              <RNText style={styles.cardTitle}>Autenticação</RNText>
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
                outlineColor={colors.gray300}
                activeOutlineColor={colors.secondary}
                left={<TextInput.Icon icon="email-outline" color={colors.gray500} />}
                disabled={loading}
                theme={{
                  colors: {
                    background: colors.white,
                    primary: colors.secondary,
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
                outlineColor={colors.gray300}
                activeOutlineColor={colors.secondary}
                left={<TextInput.Icon icon="lock-outline" color={colors.gray500} />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    onPress={() => setShowPassword(!showPassword)}
                    color={colors.gray500}
                  />
                }
                disabled={loading}
                theme={{
                  colors: {
                    background: colors.white,
                    primary: colors.secondary,
                  },
                }}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.secondary, colors.secondaryDark]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <RNText style={styles.buttonText}>Autenticando...</RNText>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="login" size={20} color={colors.white} />
                      <RNText style={styles.buttonText}>Entrar no Sistema</RNText>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Info de Segurança */}
            <View style={styles.securityInfo}>
              <MaterialCommunityIcons name="shield-check" size={16} color={colors.success} />
              <RNText style={styles.securityText}>Conexão Segura SSL</RNText>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <RNText style={styles.footerText}>Pegasus Logistics</RNText>
            <RNText style={styles.footerVersion}>v1.0.0 • 2025</RNText>
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
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl * 2 : spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  brandName: {
    fontSize: typography['4xl'],
    fontWeight: typography.extrabold,
    color: colors.white,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.white,
    fontWeight: typography.semibold,
    opacity: 0.95,
    marginBottom: spacing.xs,
  },
  roleText: {
    fontSize: typography.sm,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  loginCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray100,
  },
  cardTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
    fontSize: typography.base,
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.bold,
    letterSpacing: 0.5,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  securityText: {
    fontSize: typography.xs,
    color: colors.success,
    fontWeight: typography.semibold,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
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
