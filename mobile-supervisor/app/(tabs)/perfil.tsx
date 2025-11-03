import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { List, Divider, Text, Avatar, Button, ActivityIndicator, Dialog, Portal, TextInput, Switch } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'

export default function PerfilScreen() {
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('Supervisor Teste')
  const [userEmail, setUserEmail] = useState('supervisor@teste.com')
  const [userPhone, setUserPhone] = useState('(11) 98765-4321')
  const [userRole, setUserRole] = useState('supervisor')
  
  // Diálogos
  const [editDialogVisible, setEditDialogVisible] = useState(false)
  const [senhaDialogVisible, setSenhaDialogVisible] = useState(false)
  const [notifDialogVisible, setNotifDialogVisible] = useState(false)
  
  // Campos de edição
  const [novoNome, setNovoNome] = useState(userName)
  const [novoEmail, setNovoEmail] = useState(userEmail)
  const [novoTelefone, setNovoTelefone] = useState(userPhone)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  
  // Notificações
  const [notifPedidos, setNotifPedidos] = useState(true)
  const [notifAprovacao, setNotifAprovacao] = useState(true)
  const [notifEntrega, setNotifEntrega] = useState(false)

  const handleEditarPerfil = () => {
    setNovoNome(userName)
    setNovoEmail(userEmail)
    setNovoTelefone(userPhone)
    setEditDialogVisible(true)
  }

  const handleSalvarPerfil = () => {
    if (!novoNome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório')
      return
    }
    if (!novoEmail.trim() || !novoEmail.includes('@')) {
      Alert.alert('Erro', 'Email inválido')
      return
    }
    if (!novoTelefone.trim()) {
      Alert.alert('Erro', 'Telefone é obrigatório')
      return
    }
    
    setUserName(novoNome)
    setUserEmail(novoEmail)
    setUserPhone(novoTelefone)
    setEditDialogVisible(false)
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!')
  }

  const handleAlterarSenha = () => {
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmaSenha('')
    setSenhaDialogVisible(true)
  }

  const handleSalvarSenha = () => {
    if (!senhaAtual || !novaSenha || !confirmaSenha) {
      Alert.alert('Erro', 'Preencha todos os campos')
      return
    }
    if (novaSenha !== confirmaSenha) {
      Alert.alert('Erro', 'As senhas não coincidem')
      return
    }
    if (novaSenha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    setSenhaDialogVisible(false)
    Alert.alert('Sucesso', 'Senha alterada com sucesso!')
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmaSenha('')
  }

  const handleNotificacoes = () => {
    setNotifDialogVisible(true)
  }

  const handleSalvarNotificacoes = () => {
    setNotifDialogVisible(false)
    Alert.alert('Sucesso', 'Configurações de notificações salvas!')
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
          onPress: () => {
            router.replace('/(auth)/login')
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
        <ActivityIndicator size="large" color={colors.secondary} />
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
        <Text style={styles.phone}>{userPhone}</Text>
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
            onPress={handleEditarPerfil}
          />

          <Divider />

          <List.Item
            title="Alterar Senha"
            description="Modificar senha de acesso"
            left={props => <List.Icon {...props} icon="lock-reset" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleAlterarSenha}
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
            onPress={handleNotificacoes}
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
          textColor={colors.error}
          style={styles.logoutButton}
        >
          Sair do Aplicativo
        </Button>
      </View>

      {/* Informações do Sistema */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>App Mobile de Pedidos</Text>
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      {/* Diálogos */}
      <Portal>
        {/* Dialog Editar Perfil */}
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Editar Perfil</Dialog.Title>
          <Dialog.Content style={{ gap: 12 }}>
            <TextInput
              label="Nome Completo"
              value={novoNome}
              onChangeText={setNovoNome}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
            />
            <TextInput
              label="Email"
              value={novoEmail}
              onChangeText={setNovoEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
            />
            <TextInput
              label="Telefone Celular"
              value={novoTelefone}
              onChangeText={setNovoTelefone}
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)} textColor={colors.textSecondary}>Cancelar</Button>
            <Button 
              onPress={handleSalvarPerfil}
              mode="contained"
              buttonColor={colors.secondary}
            >
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog Alterar Senha */}
        <Dialog visible={senhaDialogVisible} onDismiss={() => setSenhaDialogVisible(false)}>
          <Dialog.Title>Alterar Senha</Dialog.Title>
          <Dialog.Content style={{ gap: spacing.sm }}>
            <TextInput
              label="Senha Atual"
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              mode="outlined"
              secureTextEntry
            />
            <TextInput
              label="Nova Senha"
              value={novaSenha}
              onChangeText={setNovaSenha}
              mode="outlined"
              secureTextEntry
            />
            <TextInput
              label="Confirmar Nova Senha"
              value={confirmaSenha}
              onChangeText={setConfirmaSenha}
              mode="outlined"
              secureTextEntry
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSenhaDialogVisible(false)} textColor={colors.textSecondary}>Cancelar</Button>
            <Button 
              onPress={handleSalvarSenha}
              mode="contained"
              buttonColor={colors.secondary}
            >
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog Notificações */}
        <Dialog visible={notifDialogVisible} onDismiss={() => setNotifDialogVisible(false)}>
          <Dialog.Title>Notificações</Dialog.Title>
          <Dialog.Content style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.textPrimary }}>Novos Pedidos</Text>
              <Switch value={notifPedidos} onValueChange={setNotifPedidos} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.textPrimary }}>Status de Aprovação</Text>
              <Switch value={notifAprovacao} onValueChange={setNotifAprovacao} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.textPrimary }}>Entrega Concluída</Text>
              <Switch value={notifEntrega} onValueChange={setNotifEntrega} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNotifDialogVisible(false)} textColor={colors.textSecondary}>Cancelar</Button>
            <Button 
              onPress={handleSalvarNotificacoes}
              mode="contained"
              buttonColor={colors.secondary}
            >
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  avatar: {
    backgroundColor: colors.secondary,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  phone: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  role: {
    fontSize: typography.xs,
    color: colors.secondary,
    backgroundColor: colors.secondaryLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    fontWeight: typography.semibold,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
  },
  logoutContainer: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  logoutButton: {
    borderColor: colors.error,
    borderRadius: borderRadius.md,
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

