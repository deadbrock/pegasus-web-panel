import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native'
import { Text, FAB, Card, Chip, Dialog, Portal, TextInput, Button, ActivityIndicator } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  fetchContratosAtivos,
  fetchContratosAtribuidosLogistica,
  fetchTodosContratosUnificados,
  sincronizarConfiguracoes,
  criarContrato,
  atualizarContrato,
  desativarContrato,
  reativarContrato,
  formatarEnderecoCompleto,
  formatarTelefone,
  formatarCEP,
  formatarContratoAtribuidoCompleto,
  type Contrato,
  type ContratoAtribuido,
  type ContratoFormData
} from '../../services/contratos-service'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'

export default function ContratosScreen() {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [contratosAtribuidos, setContratosAtribuidos] = useState<ContratoAtribuido[]>([])
  const [supervisorId, setSupervisorId] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<'atribuidos' | 'proprios'>('atribuidos')
  
  // Dialog de Cadastro/Edição
  const [dialogVisible, setDialogVisible] = useState(false)
  const [contratoEditando, setContratoEditando] = useState<Contrato | null>(null)
  const [salvando, setSalvando] = useState(false)
  
  // Form Data
  const [nomeContrato, setNomeContrato] = useState('')
  const [enderecoCompleto, setEnderecoCompleto] = useState('')
  const [enderecoNumero, setEnderecoNumero] = useState('')
  const [enderecoComplemento, setEnderecoComplemento] = useState('')
  const [enderecoBairro, setEnderecoBairro] = useState('')
  const [enderecoCidade, setEnderecoCidade] = useState('')
  const [enderecoEstado, setEnderecoEstado] = useState('')
  const [enderecoCep, setEnderecoCep] = useState('')
  const [encarregadoNome, setEncarregadoNome] = useState('')
  const [encarregadoTelefone, setEncarregadoTelefone] = useState('')
  const [encarregadoEmail, setEncarregadoEmail] = useState('')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    const init = async () => {
      const storedUserId = await AsyncStorage.getItem('userId')
      
      if (storedUserId) {
        setSupervisorId(storedUserId)
        await loadContratos(storedUserId)
      } else {
        setLoading(false)
        Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.')
      }
    }
    
    init()
  }, [])

  const loadContratos = async (id?: string) => {
    try {
      const idToUse = id || supervisorId
      if (!idToUse) return
      
      // Buscar contratos atribuídos pela logística E contratos próprios
      const [atribuidos, proprios] = await Promise.all([
        fetchContratosAtribuidosLogistica(idToUse),
        fetchContratosAtivos(idToUse)
      ])
      
      setContratosAtribuidos(atribuidos)
      setContratos(proprios)
      
      // Se tem contratos atribuídos, mostrar essa aba por padrão
      if (atribuidos.length > 0) {
        setAbaAtiva('atribuidos')
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error)
      Alert.alert('Erro', 'Não foi possível carregar os contratos')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    
    // Também sincronizar configurações
    try {
      const resultado = await sincronizarConfiguracoes(supervisorId)
      if (resultado.success && resultado.contratos) {
        setContratosAtribuidos(resultado.contratos)
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
    }
    
    await loadContratos()
  }

  const handleNovoContrato = () => {
    limparFormulario()
    setContratoEditando(null)
    setDialogVisible(true)
  }

  const handleEditarContrato = (contrato: Contrato) => {
    setContratoEditando(contrato)
    setNomeContrato(contrato.nome_contrato)
    setEnderecoCompleto(contrato.endereco_completo)
    setEnderecoNumero(contrato.endereco_numero || '')
    setEnderecoComplemento(contrato.endereco_complemento || '')
    setEnderecoBairro(contrato.endereco_bairro || '')
    setEnderecoCidade(contrato.endereco_cidade || '')
    setEnderecoEstado(contrato.endereco_estado || '')
    setEnderecoCep(contrato.endereco_cep || '')
    setEncarregadoNome(contrato.encarregado_nome || '')
    setEncarregadoTelefone(contrato.encarregado_telefone || '')
    setEncarregadoEmail(contrato.encarregado_email || '')
    setObservacoes(contrato.observacoes || '')
    setDialogVisible(true)
  }

  const handleDesativarContrato = (contrato: Contrato) => {
    Alert.alert(
      'Desativar Contrato',
      `Deseja desativar o contrato "${contrato.nome_contrato}"?\n\nO contrato não aparecerá mais na seleção de pedidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: async () => {
            const resultado = await desativarContrato(contrato.id, supervisorId)
            
            if (resultado.success) {
              Alert.alert('Sucesso', resultado.message)
              await loadContratos()
            } else {
              Alert.alert('Erro', resultado.message)
            }
          }
        }
      ]
    )
  }

  const handleSalvar = async () => {
    // Validações
    if (!nomeContrato.trim()) {
      Alert.alert('Atenção', 'Informe o nome do contrato')
      return
    }

    if (!enderecoCompleto.trim()) {
      Alert.alert('Atenção', 'Informe o endereço')
      return
    }

    setSalvando(true)

    try {
      const formData: ContratoFormData = {
        nome_contrato: nomeContrato.trim(),
        endereco_completo: enderecoCompleto.trim(),
        endereco_numero: enderecoNumero.trim() || undefined,
        endereco_complemento: enderecoComplemento.trim() || undefined,
        endereco_bairro: enderecoBairro.trim() || undefined,
        endereco_cidade: enderecoCidade.trim() || undefined,
        endereco_estado: enderecoEstado.trim() || undefined,
        endereco_cep: enderecoCep.trim() || undefined,
        encarregado_nome: encarregadoNome.trim() || undefined,
        encarregado_telefone: encarregadoTelefone.trim() || undefined,
        encarregado_email: encarregadoEmail.trim() || undefined,
        observacoes: observacoes.trim() || undefined
      }

      let resultado

      if (contratoEditando) {
        // Editar contrato existente
        resultado = await atualizarContrato(contratoEditando.id, supervisorId, formData)
      } else {
        // Criar novo contrato
        resultado = await criarContrato(supervisorId, formData)
      }

      if (resultado.success) {
        Alert.alert('✅ Sucesso!', resultado.message)
        setDialogVisible(false)
        limparFormulario()
        await loadContratos()
      } else {
        Alert.alert('❌ Erro', resultado.message)
      }
    } catch (error) {
      console.error('Erro ao salvar contrato:', error)
      Alert.alert('Erro', 'Não foi possível salvar o contrato')
    } finally {
      setSalvando(false)
    }
  }

  const limparFormulario = () => {
    setNomeContrato('')
    setEnderecoCompleto('')
    setEnderecoNumero('')
    setEnderecoComplemento('')
    setEnderecoBairro('')
    setEnderecoCidade('')
    setEnderecoEstado('')
    setEnderecoCep('')
    setEncarregadoNome('')
    setEncarregadoTelefone('')
    setEncarregadoEmail('')
    setObservacoes('')
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Carregando contratos...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
          <Text style={styles.headerTitle}>Meus Contratos</Text>
          <Text style={styles.headerSubtitle}>
            {contratosAtribuidos.length} atribuído(s) • {contratos.length} próprio(s)
          </Text>
        </View>
        <MaterialCommunityIcons name="file-document-multiple" size={40} color={colors.secondary} />
      </View>

      {/* Abas: Contratos Atribuídos vs Contratos Próprios */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, abaAtiva === 'atribuidos' && styles.tabAtiva]}
          onPress={() => setAbaAtiva('atribuidos')}
        >
          <Text style={[styles.tabText, abaAtiva === 'atribuidos' && styles.tabTextAtiva]}>
            📋 Atribuídos ({contratosAtribuidos.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, abaAtiva === 'proprios' && styles.tabAtiva]}
          onPress={() => setAbaAtiva('proprios')}
        >
          <Text style={[styles.tabText, abaAtiva === 'proprios' && styles.tabTextAtiva]}>
            📝 Meus Cadastros ({contratos.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Contratos */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* ABA: CONTRATOS ATRIBUÍDOS */}
        {abaAtiva === 'atribuidos' && (
          <>
            {contratosAtribuidos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="file-document-alert-outline" size={80} color="#9ca3af" />
                <Text style={styles.emptyTitle}>Nenhum contrato atribuído</Text>
                <Text style={styles.emptyText}>
                  O setor de logística ainda não atribuiu nenhum contrato para você.
                  {'\n\n'}
                  Quando um contrato for atribuído, ele aparecerá aqui automaticamente.
                </Text>
                <Button 
                  mode="outlined" 
                  onPress={handleRefresh}
                  style={{ marginTop: spacing.md }}
                  icon="refresh"
                  buttonColor={colors.gray50}
                >
                  Atualizar
                </Button>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {/* Banner informativo */}
                <Card style={[styles.infoBanner, { backgroundColor: '#dbeafe' }]}>
                  <Card.Content>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <MaterialCommunityIcons name="information" size={20} color="#2563eb" />
                      <Text style={{ flex: 1, color: '#1e40af', fontSize: 13 }}>
                        Contratos gerenciados pela logística. Use-os para fazer pedidos no app.
                      </Text>
                    </View>
                  </Card.Content>
                </Card>

                {/* Lista de contratos atribuídos */}
                {contratosAtribuidos.map((contrato) => (
                  <Card key={contrato.id} style={styles.contratoCard}>
                    <Card.Content>
                      {/* Nome do Cliente */}
                      <View style={styles.contratoHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.contratoNome}>{contrato.cliente}</Text>
                          <Text style={styles.contratoSubtitle}>{contrato.numero_contrato}</Text>
                          <Chip 
                            icon="check-circle" 
                            style={{ backgroundColor: '#dcfce7', alignSelf: 'flex-start', marginTop: 4 }}
                            textStyle={{ color: '#16a34a', fontSize: 11 }}
                          >
                            {contrato.status}
                          </Chip>
                        </View>
                      </View>

                      {/* Tipo */}
                      {contrato.tipo && (
                        <View style={styles.infoRow}>
                          <MaterialCommunityIcons name="tag" size={18} color="#6b7280" />
                          <Text style={styles.infoText}>{contrato.tipo}</Text>
                        </View>
                      )}

                      {/* Teto de Gastos Mensal */}
                      {contrato.valor_mensal_material && (
                        <View style={[styles.infoRow, { backgroundColor: '#fef3c7', padding: 8, borderRadius: 8, marginTop: 8 }]}>
                          <MaterialCommunityIcons name="cash" size={20} color="#d97706" />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, color: '#92400e', fontWeight: '600' }}>
                              Teto Mensal de Material
                            </Text>
                            <Text style={{ fontSize: 18, color: '#92400e', fontWeight: 'bold' }}>
                              R$ {contrato.valor_mensal_material.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Responsável */}
                      {contrato.responsavel && (
                        <View style={styles.infoRow}>
                          <MaterialCommunityIcons name="account" size={18} color="#6b7280" />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.infoText}>{contrato.responsavel}</Text>
                            {contrato.telefone_contato && (
                              <Text style={styles.infoSubtext}>
                                {contrato.telefone_contato}
                              </Text>
                            )}
                          </View>
                        </View>
                      )}

                      {/* Vigência */}
                      <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="calendar-range" size={18} color="#6b7280" />
                        <Text style={styles.infoText}>
                          {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                          {new Date(contrato.data_fim).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>

                      {/* Observações */}
                      {contrato.observacoes && (
                        <View style={styles.observacoesBox}>
                          <Text style={styles.observacoesText} numberOfLines={2}>
                            💬 {contrato.observacoes}
                          </Text>
                        </View>
                      )}

                      {/* Badge de Atribuição */}
                      <View style={{ marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.gray100 }}>
                        <Text style={{ fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' }}>
                          📌 Gerenciado pela logística
                          {contrato.data_atribuicao && ` • Atribuído em ${new Date(contrato.data_atribuicao).toLocaleDateString('pt-BR')}`}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </>
        )}

        {/* ABA: CONTRATOS PRÓPRIOS */}
        {abaAtiva === 'proprios' && (
          <>
            {contratos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="file-document-multiple-outline" size={80} color="#9ca3af" />
                <Text style={styles.emptyTitle}>Nenhum contrato próprio</Text>
                <Text style={styles.emptyText}>
                  Você pode cadastrar seus próprios clientes/obras aqui.
                  {'\n\n'}
                  Use a aba "Atribuídos" para ver contratos gerenciados pela logística.
                </Text>
                <Button 
                  mode="contained" 
                  onPress={handleNovoContrato}
                  style={{ marginTop: spacing.md }}
                  icon="plus"
                  buttonColor={colors.secondary}
                >
                  Cadastrar Primeiro Contrato
                </Button>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {contratos.map((contrato) => (
              <Card key={contrato.id} style={styles.contratoCard}>
                <Card.Content>
                  {/* Nome do Contrato */}
                  <View style={styles.contratoHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contratoNome}>{contrato.nome_contrato}</Text>
                      {contrato.ativo && (
                        <Chip 
                          icon="check-circle" 
                          style={{ backgroundColor: '#dcfce7', alignSelf: 'flex-start', marginTop: 4 }}
                          textStyle={{ color: '#16a34a', fontSize: 11 }}
                        >
                          Ativo
                        </Chip>
                      )}
                    </View>
                  </View>

                  {/* Endereço */}
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker" size={18} color="#6b7280" />
                    <Text style={styles.infoText}>{formatarEnderecoCompleto(contrato)}</Text>
                  </View>

                  {/* Encarregado */}
                  {contrato.encarregado_nome && (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="account" size={18} color="#6b7280" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoText}>{contrato.encarregado_nome}</Text>
                        {contrato.encarregado_telefone && (
                          <Text style={styles.infoSubtext}>
                            {formatarTelefone(contrato.encarregado_telefone)}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Observações */}
                  {contrato.observacoes && (
                    <View style={styles.observacoesBox}>
                      <Text style={styles.observacoesText} numberOfLines={2}>
                        💬 {contrato.observacoes}
                      </Text>
                    </View>
                  )}

                  {/* Ações */}
                  <View style={styles.acoesRow}>
                    <TouchableOpacity 
                      style={styles.acaoButton}
                      onPress={() => handleEditarContrato(contrato)}
                    >
                      <MaterialCommunityIcons name="pencil" size={20} color={colors.secondary} />
                      <Text style={[styles.acaoText, { color: colors.secondary }]}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.acaoButton}
                      onPress={() => handleDesativarContrato(contrato)}
                    >
                      <MaterialCommunityIcons name="close-circle" size={20} color={colors.error} />
                      <Text style={[styles.acaoText, { color: colors.error }]}>Desativar</Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB - Mostrar apenas na aba de contratos próprios */}
      {abaAtiva === 'proprios' && (
        <FAB
          icon="plus"
          label="Novo Contrato"
          style={styles.fab}
          onPress={handleNovoContrato}
        />
      )}

      {/* Dialog de Cadastro/Edição */}
      <Portal>
        <Dialog 
          visible={dialogVisible} 
          onDismiss={() => setDialogVisible(false)} 
          style={{ 
            maxHeight: '90%',
            borderRadius: borderRadius.lg,
            backgroundColor: colors.white,
          }}
        >
          <Dialog.Title style={{ 
            fontSize: typography.lg, 
            fontWeight: typography.bold,
            color: colors.textPrimary 
          }}>
            {contratoEditando ? 'Editar Contrato' : 'Novo Contrato'}
          </Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={{ paddingHorizontal: 24 }}>
              <View style={{ gap: 16, paddingVertical: 8 }}>
                {/* Nome do Contrato */}
                <TextInput
                  label="Nome do Contrato/Cliente *"
                  value={nomeContrato}
                  onChangeText={setNomeContrato}
                  mode="outlined"
                  placeholder="Ex: Obra Centro, Cliente XYZ"
                />

                {/* Endereço */}
                <Text style={styles.sectionTitle}>📍 Endereço</Text>
                
                <TextInput
                  label="Endereço (Rua/Avenida) *"
                  value={enderecoCompleto}
                  onChangeText={setEnderecoCompleto}
                  mode="outlined"
                  placeholder="Ex: Av. Paulista"
                />

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    label="Número"
                    value={enderecoNumero}
                    onChangeText={setEnderecoNumero}
                    mode="outlined"
                    style={{ flex: 1 }}
                    keyboardType="numeric"
                  />
                  <TextInput
                    label="Complemento"
                    value={enderecoComplemento}
                    onChangeText={setEnderecoComplemento}
                    mode="outlined"
                    style={{ flex: 2 }}
                    placeholder="Apto, Bloco..."
                  />
                </View>

                <TextInput
                  label="Bairro"
                  value={enderecoBairro}
                  onChangeText={setEnderecoBairro}
                  mode="outlined"
                />

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    label="Cidade"
                    value={enderecoCidade}
                    onChangeText={setEnderecoCidade}
                    mode="outlined"
                    style={{ flex: 2 }}
                  />
                  <TextInput
                    label="Estado"
                    value={enderecoEstado}
                    onChangeText={setEnderecoEstado}
                    mode="outlined"
                    style={{ flex: 1 }}
                    placeholder="SP"
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>

                <TextInput
                  label="CEP"
                  value={enderecoCep}
                  onChangeText={setEnderecoCep}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="00000-000"
                />

                {/* Encarregado */}
                <Text style={styles.sectionTitle}>👤 Encarregado (Opcional)</Text>

                <TextInput
                  label="Nome do Encarregado"
                  value={encarregadoNome}
                  onChangeText={setEncarregadoNome}
                  mode="outlined"
                />

                <TextInput
                  label="Telefone"
                  value={encarregadoTelefone}
                  onChangeText={setEncarregadoTelefone}
                  mode="outlined"
                  keyboardType="phone-pad"
                  placeholder="(00) 00000-0000"
                />

                <TextInput
                  label="E-mail"
                  value={encarregadoEmail}
                  onChangeText={setEncarregadoEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {/* Observações */}
                <TextInput
                  label="Observações"
                  value={observacoes}
                  onChangeText={setObservacoes}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  placeholder="Ex: Horário de entrega, instruções especiais..."
                />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button 
              onPress={() => {
                setDialogVisible(false)
                limparFormulario()
              }}
              disabled={salvando}
              textColor={colors.textSecondary}
            >
              Cancelar
            </Button>
            <Button 
              onPress={handleSalvar} 
              mode="contained"
              loading={salvando}
              disabled={salvando}
              buttonColor={colors.secondary}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  contratoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  contratoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contratoNome: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.base,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  infoSubtext: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  observacoesBox: {
    backgroundColor: colors.gray50,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    ...shadows.sm,
  },
  observacoesText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  acoesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  acaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  acaoText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.secondary,
  },
  sectionTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabAtiva: {
    borderBottomColor: colors.secondary,
  },
  tabText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  tabTextAtiva: {
    color: colors.secondary,
    fontWeight: typography.bold,
  },
  contratoSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoBanner: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
})
