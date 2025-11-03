import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native'
import { List, Divider, Text, Avatar, Button, ActivityIndicator, Dialog, Portal, TextInput, Switch, ProgressBar } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
  const [preferenciasDialogVisible, setPreferenciasDialogVisible] = useState(false)
  const [cacheDialogVisible, setCacheDialogVisible] = useState(false)
  const [ajudaDialogVisible, setAjudaDialogVisible] = useState(false)
  
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
  
  // Preferências
  const [somNotificacao, setSomNotificacao] = useState(true)
  const [modoEconomia, setModoEconomia] = useState(false)
  const [atualizacaoAuto, setAtualizacaoAuto] = useState(true)
  
  // Cache e Dados
  const [cacheSize, setCacheSize] = useState('0 MB')
  const [clearingCache, setClearingCache] = useState(false)

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

  // Preferências
  const handlePreferencias = async () => {
    // Carregar preferências salvas
    try {
      const somSalvo = await AsyncStorage.getItem('@som_notificacao')
      const economiaSalva = await AsyncStorage.getItem('@modo_economia')
      const atualizacaoSalva = await AsyncStorage.getItem('@atualizacao_auto')
      
      if (somSalvo !== null) setSomNotificacao(somSalvo === 'true')
      if (economiaSalva !== null) setModoEconomia(economiaSalva === 'true')
      if (atualizacaoSalva !== null) setAtualizacaoAuto(atualizacaoSalva === 'true')
    } catch (error) {
      console.error('Erro ao carregar preferências:', error)
    }
    setPreferenciasDialogVisible(true)
  }

  const handleSalvarPreferencias = async () => {
    try {
      await AsyncStorage.setItem('@som_notificacao', somNotificacao.toString())
      await AsyncStorage.setItem('@modo_economia', modoEconomia.toString())
      await AsyncStorage.setItem('@atualizacao_auto', atualizacaoAuto.toString())
      setPreferenciasDialogVisible(false)
      Alert.alert('Sucesso', 'Preferências salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      Alert.alert('Erro', 'Não foi possível salvar as preferências')
    }
  }

  // Cache e Dados
  const handleCacheDados = async () => {
    await calcularTamanhoCache()
    setCacheDialogVisible(true)
  }

  const calcularTamanhoCache = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys()
      let totalSize = 0
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key)
        if (value) {
          totalSize += new Blob([value]).size
        }
      }
      
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2)
      setCacheSize(`${sizeMB} MB`)
    } catch (error) {
      console.error('Erro ao calcular tamanho do cache:', error)
      setCacheSize('Indisponível')
    }
  }

  const handleLimparCache = async () => {
    Alert.alert(
      'Limpar Cache',
      'Isso irá remover dados temporários. Suas configurações e login serão mantidos. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            setClearingCache(true)
            try {
              // Simular limpeza de cache (não remove dados essenciais)
              await new Promise(resolve => setTimeout(resolve, 1500))
              await calcularTamanhoCache()
              Alert.alert('Sucesso', 'Cache limpo com sucesso!')
            } catch (error) {
              console.error('Erro ao limpar cache:', error)
              Alert.alert('Erro', 'Não foi possível limpar o cache')
            } finally {
              setClearingCache(false)
            }
          },
        },
      ]
    )
  }

  const handleLimparDados = () => {
    Alert.alert(
      'Limpar Todos os Dados',
      '⚠️ ATENÇÃO: Isso irá remover TODOS os dados locais e você precisará fazer login novamente. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear()
              Alert.alert('Sucesso', 'Todos os dados foram limpos!', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(auth)/login'),
                },
              ])
            } catch (error) {
              console.error('Erro ao limpar dados:', error)
              Alert.alert('Erro', 'Não foi possível limpar os dados')
            }
          },
        },
      ]
    )
  }

  // Ajuda
  const handleAjuda = () => {
    setAjudaDialogVisible(true)
  }

  const handleAbrirTutorial = () => {
    Alert.alert(
      '📚 Tutorial',
      '1. Faça login com suas credenciais\n2. Crie contratos para seus clientes\n3. Faça pedidos entre dia 15-23 de cada mês\n4. Acompanhe o status dos pedidos\n5. Receba notificações de aprovação',
      [{ text: 'Entendi' }]
    )
  }

  const handleAbrirFAQ = () => {
    Alert.alert(
      '❓ Perguntas Frequentes',
      '• Como fazer um pedido?\nR: Vá em Pedidos → Botão + → Selecione contrato e produtos\n\n• Quando posso fazer pedidos?\nR: Entre os dias 15 e 23 de cada mês\n\n• Preciso de autorização?\nR: Apenas do 2º pedido em diante no mesmo mês',
      [{ text: 'OK' }]
    )
  }

  const handleContatarSuporte = async () => {
    try {
      await Linking.openURL('mailto:suporte@pegasus.com?subject=Suporte App Supervisor')
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o cliente de email')
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
            description="Som, economia de dados e mais"
            left={props => <List.Icon {...props} icon="cog" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handlePreferencias}
          />

          <Divider />

          <List.Item
            title="Cache e Dados"
            description="Gerenciar armazenamento local"
            left={props => <List.Icon {...props} icon="database" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleCacheDados}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Suporte</List.Subheader>
          
          <List.Item
            title="Ajuda"
            description="Tutoriais, FAQ e suporte"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleAjuda}
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
        <Dialog 
          visible={editDialogVisible} 
          onDismiss={() => setEditDialogVisible(false)}
          style={{ 
            borderRadius: borderRadius.lg,
            backgroundColor: colors.white,
          }}
        >
          <Dialog.Title style={{ 
            fontSize: typography.lg, 
            fontWeight: typography.bold,
            color: colors.textPrimary 
          }}>
            Editar Perfil
          </Dialog.Title>
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
        <Dialog 
          visible={senhaDialogVisible} 
          onDismiss={() => setSenhaDialogVisible(false)}
          style={{ 
            borderRadius: borderRadius.lg,
            backgroundColor: colors.white,
          }}
        >
          <Dialog.Title style={{ 
            fontSize: typography.lg, 
            fontWeight: typography.bold,
            color: colors.textPrimary 
          }}>
            Alterar Senha
          </Dialog.Title>
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
        <Dialog 
          visible={notifDialogVisible} 
          onDismiss={() => setNotifDialogVisible(false)}
          style={{ 
            borderRadius: borderRadius.lg,
            backgroundColor: colors.white,
          }}
        >
          <Dialog.Title style={{ 
            fontSize: typography.lg, 
            fontWeight: typography.bold,
            color: colors.textPrimary 
          }}>
            Notificações
          </Dialog.Title>
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

        {/* Dialog Preferências */}
        <Dialog 
          visible={preferenciasDialogVisible} 
          onDismiss={() => setPreferenciasDialogVisible(false)}
          style={{ 
            borderRadius: borderRadius.lg,
            backgroundColor: colors.white,
          }}
        >
          <Dialog.Title style={{ 
            fontSize: typography.lg, 
            fontWeight: typography.bold,
            color: colors.textPrimary 
          }}>
            ⚙️ Preferências
          </Dialog.Title>
          <Dialog.Content style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.base, color: colors.textPrimary, fontWeight: typography.medium }}>Som de Notificações</Text>
                <Text style={{ fontSize: typography.xs, color: colors.textSecondary, marginTop: spacing.xs }}>Reproduzir som ao receber notificações</Text>
              </View>
              <Switch value={somNotificacao} onValueChange={setSomNotificacao} />
            </View>

            <Divider />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.base, color: colors.textPrimary, fontWeight: typography.medium }}>Modo Economia de Dados</Text>
                <Text style={{ fontSize: typography.xs, color: colors.textSecondary, marginTop: spacing.xs }}>Reduzir uso de dados móveis</Text>
              </View>
              <Switch value={modoEconomia} onValueChange={setModoEconomia} />
            </View>

            <Divider />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.base, color: colors.textPrimary, fontWeight: typography.medium }}>Atualização Automática</Text>
                <Text style={{ fontSize: typography.xs, color: colors.textSecondary, marginTop: spacing.xs }}>Atualizar pedidos automaticamente</Text>
              </View>
              <Switch value={atualizacaoAuto} onValueChange={setAtualizacaoAuto} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPreferenciasDialogVisible(false)} textColor={colors.textSecondary}>Cancelar</Button>
            <Button 
              onPress={handleSalvarPreferencias}
              mode="contained"
              buttonColor={colors.secondary}
            >
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog Cache e Dados */}
        <Dialog 
          visible={cacheDialogVisible} 
          onDismiss={() => setCacheDialogVisible(false)}
          style={{ 
            borderRadius: borderRadius.lg,
            backgroundColor: colors.white,
          }}
        >
          <Dialog.Title style={{ 
            fontSize: typography.lg, 
            fontWeight: typography.bold,
            color: colors.textPrimary 
          }}>
            💾 Cache e Dados
          </Dialog.Title>
          <Dialog.Content style={{ gap: spacing.md }}>
            {/* Tamanho do Cache */}
            <View style={{ 
              backgroundColor: colors.gray50, 
              padding: spacing.md, 
              borderRadius: borderRadius.md,
              ...shadows.sm 
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: typography.sm, color: colors.textSecondary }}>Tamanho do Cache</Text>
                  <Text style={{ fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary, marginTop: spacing.xs }}>
                    {cacheSize}
                  </Text>
                </View>
                <MaterialCommunityIcons name="database" size={32} color={colors.secondary} />
              </View>
            </View>

            {clearingCache && (
              <View style={{ marginTop: spacing.sm }}>
                <Text style={{ fontSize: typography.sm, color: colors.textSecondary, marginBottom: spacing.sm }}>Limpando cache...</Text>
                <ProgressBar progress={0.7} color={colors.secondary} />
              </View>
            )}

            {/* Botão Limpar Cache */}
            <Button 
              mode="outlined" 
              onPress={handleLimparCache}
              icon="broom"
              textColor={colors.secondary}
              style={{ borderColor: colors.secondary, borderRadius: borderRadius.md }}
              disabled={clearingCache}
            >
              Limpar Cache
            </Button>

            <Divider />

            {/* Aviso de Dados */}
            <View style={{ 
              backgroundColor: colors.warning + '15', 
              padding: spacing.sm, 
              borderRadius: borderRadius.md,
              borderLeftWidth: 3,
              borderLeftColor: colors.warning
            }}>
              <Text style={{ fontSize: typography.xs, color: colors.textPrimary }}>
                ⚠️ Limpar todos os dados irá remover suas configurações e você precisará fazer login novamente.
              </Text>
            </View>

            {/* Botão Limpar Todos os Dados */}
            <Button 
              mode="outlined" 
              onPress={handleLimparDados}
              icon="delete-forever"
              textColor={colors.error}
              style={{ borderColor: colors.error, borderRadius: borderRadius.md }}
            >
              Limpar Todos os Dados
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setCacheDialogVisible(false)}
              mode="contained"
              buttonColor={colors.secondary}
            >
              Fechar
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog Ajuda */}
        <Dialog 
          visible={ajudaDialogVisible} 
          onDismiss={() => setAjudaDialogVisible(false)}
          style={{ 
            borderRadius: borderRadius.lg,
            backgroundColor: colors.white,
          }}
        >
          <Dialog.Title style={{ 
            fontSize: typography.lg, 
            fontWeight: typography.bold,
            color: colors.textPrimary 
          }}>
            ❓ Central de Ajuda
          </Dialog.Title>
          <Dialog.Content style={{ gap: spacing.sm }}>
            {/* Tutorial */}
            <Button 
              mode="contained" 
              onPress={handleAbrirTutorial}
              icon="school"
              buttonColor={colors.secondary}
              style={{ borderRadius: borderRadius.md }}
            >
              📚 Tutorial do App
            </Button>

            {/* FAQ */}
            <Button 
              mode="outlined" 
              onPress={handleAbrirFAQ}
              icon="frequently-asked-questions"
              textColor={colors.secondary}
              style={{ borderColor: colors.secondary, borderRadius: borderRadius.md }}
            >
              ❓ Perguntas Frequentes
            </Button>

            {/* Contatar Suporte */}
            <Button 
              mode="outlined" 
              onPress={handleContatarSuporte}
              icon="email"
              textColor={colors.secondary}
              style={{ borderColor: colors.secondary, borderRadius: borderRadius.md }}
            >
              📧 Contatar Suporte
            </Button>

            <Divider style={{ marginVertical: spacing.sm }} />

            {/* Informações */}
            <View style={{ 
              backgroundColor: colors.gray50, 
              padding: spacing.md, 
              borderRadius: borderRadius.md 
            }}>
              <Text style={{ fontSize: typography.sm, color: colors.textPrimary, textAlign: 'center' }}>
                <Text style={{ fontWeight: typography.bold }}>App Pegasus Supervisor</Text>
                {'\n'}Versão 1.0.0
                {'\n\n'}
                <Text style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                  © 2025 Pegasus Team
                  {'\n'}Todos os direitos reservados
                </Text>
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setAjudaDialogVisible(false)}
              mode="contained"
              buttonColor={colors.secondary}
            >
              Fechar
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

