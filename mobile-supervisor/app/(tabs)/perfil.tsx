import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { List, Divider, Text, Avatar, Button, ActivityIndicator, Dialog, Portal, TextInput, Switch } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function PerfilScreen() {
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('Supervisor Teste')
  const [userEmail, setUserEmail] = useState('supervisor@teste.com')
  const [userRole, setUserRole] = useState('supervisor')
  
  // Diálogos
  const [editDialogVisible, setEditDialogVisible] = useState(false)
  const [senhaDialogVisible, setSenhaDialogVisible] = useState(false)
  const [notifDialogVisible, setNotifDialogVisible] = useState(false)
  
  // Campos de edição
  const [novoNome, setNovoNome] = useState(userName)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  
  // Notificações
  const [notifPedidos, setNotifPedidos] = useState(true)
  const [notifAprovacao, setNotifAprovacao] = useState(true)
  const [notifEntrega, setNotifEntrega] = useState(false)

  const handleEditarPerfil = () => {
    setNovoNome(userName)
    setEditDialogVisible(true)
  }

  const handleSalvarPerfil = () => {
    if (novoNome.trim()) {
      setUserName(novoNome)
      setEditDialogVisible(false)
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!')
    }
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
          textColor="#ef4444"
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
          <Dialog.Content>
            <TextInput
              label="Nome"
              value={novoNome}
              onChangeText={setNovoNome}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleSalvarPerfil}>Salvar</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog Alterar Senha */}
        <Dialog visible={senhaDialogVisible} onDismiss={() => setSenhaDialogVisible(false)}>
          <Dialog.Title>Alterar Senha</Dialog.Title>
          <Dialog.Content style={{ gap: 8 }}>
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
            <Button onPress={() => setSenhaDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleSalvarSenha}>Salvar</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog Notificações */}
        <Dialog visible={notifDialogVisible} onDismiss={() => setNotifDialogVisible(false)}>
          <Dialog.Title>Notificações</Dialog.Title>
          <Dialog.Content style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Novos Pedidos</Text>
              <Switch value={notifPedidos} onValueChange={setNotifPedidos} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Status de Aprovação</Text>
              <Switch value={notifAprovacao} onValueChange={setNotifAprovacao} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Entrega Concluída</Text>
              <Switch value={notifEntrega} onValueChange={setNotifEntrega} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNotifDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleSalvarNotificacoes}>Salvar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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

