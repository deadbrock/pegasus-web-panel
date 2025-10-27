import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { List, Divider, Text, Avatar, Button, ActivityIndicator } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase, getCurrentUser, signOut } from '../../services/supabase'

export default function PerfilScreen() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        setUserName(user.user_metadata?.name || 'Supervisor')
        setUserEmail(user.email || '')
        setUserRole(user.user_metadata?.role || 'supervisor')
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Deseja realmente sair do aplicativo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut()
              router.replace('/(auth)/login')
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível fazer logout')
            }
          },
        },
      ]
    )
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'supervisor':
        return 'Supervisor'
      case 'motorista':
        return 'Motorista'
      default:
        return 'Usuário'
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header do Perfil */}
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={userName.substring(0, 2).toUpperCase()} 
          style={styles.avatar}
        />
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
        <Text style={styles.role}>{getRoleLabel(userRole)}</Text>
      </View>

      {/* Opções do Perfil */}
      <View style={styles.section}>
        <List.Section>
          <List.Subheader>Minha Conta</List.Subheader>
          
          <List.Item
            title="Editar Perfil"
            description="Alterar nome e informações"
            left={props => <List.Icon {...props} icon="account-edit" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve')
            }}
          />

          <Divider />

          <List.Item
            title="Alterar Senha"
            description="Modificar senha de acesso"
            left={props => <List.Icon {...props} icon="lock-reset" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve')
            }}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Configurações</List.Subheader>
          
          <List.Item
            title="Notificações"
            description="Gerenciar alertas e notificações"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve')
            }}
          />

          <Divider />

          <List.Item
            title="Preferências"
            description="Idioma, tema e mais"
            left={props => <List.Icon {...props} icon="cog" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve')
            }}
          />

          <Divider />

          <List.Item
            title="Cache e Dados"
            description="Gerenciar armazenamento local"
            left={props => <List.Icon {...props} icon="database" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve')
            }}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Suporte</List.Subheader>
          
          <List.Item
            title="Ajuda"
            description="Central de ajuda e tutoriais"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve')
            }}
          />

          <Divider />

          <List.Item
            title="Sobre"
            description="Versão 1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert(
                'Pegasus Supervisor',
                'Versão 1.0.0\n\nAplicativo mobile para supervisores de campo.\n\n© 2025 Pegasus Team',
                [{ text: 'OK' }]
              )
            }}
          />
        </List.Section>
      </View>

      {/* Botão de Logout */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          icon="logout"
          textColor="#ef4444"
          style={styles.logoutButton}
        >
          Sair do Aplicativo
        </Button>
      </View>

      {/* Informações do Sistema */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Conectado ao Supabase</Text>
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    backgroundColor: '#3b82f6',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  role: {
    fontSize: 12,
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
  },
  logoutContainer: {
    padding: 16,
    marginTop: 16,
  },
  logoutButton: {
    borderColor: '#ef4444',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    color: '#10b981',
  },
})

