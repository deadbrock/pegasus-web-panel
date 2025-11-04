import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl, Alert, FlatList, TouchableOpacity, Platform } from 'react-native'
import { Card, Title, Paragraph, Text, Chip, FAB, ActivityIndicator, Badge, Dialog, Portal, TextInput, Button, Searchbar } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PedidoCardModern } from '../../components/PedidoCardModern'
import { fetchProdutosDisponiveis, type Produto } from '../../services/produtos-service'
import { 
  verificarPodeFazerPedido, 
  criarPedido, 
  fetchMeusPedidos, 
  subscribePedidosRealtime,
  cancelarPedido,
  type PedidoMobile,
  type ItemPedido
} from '../../services/pedidos-mobile-service'
import { 
  fetchContratosAtivos, 
  formatarEnderecoCompleto,
  type Contrato 
} from '../../services/contratos-service'
import {
  verificarPeriodoPedidos,
  configurarNotificacoes,
  verificarEEnviarNotificacao,
  type StatusPeriodo
} from '../../services/periodo-pedidos-service'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'

export default function PedidosScreen() {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pedidos, setPedidos] = useState<PedidoMobile[]>([])
  const [filter, setFilter] = useState<'todos' | 'ativos' | 'entregues'>('ativos')
  const [supervisorId, setSupervisorId] = useState('')
  const [supervisorNome, setSupervisorNome] = useState('Supervisor')
  const [supervisorEmail, setSupervisorEmail] = useState('')
  
  // Dialog Novo Pedido
  const [novoPedidoVisible, setNovoPedidoVisible] = useState(false)
  const [contratoSelecionado, setContratoSelecionado] = useState<Contrato | null>(null)
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loadingContratos, setLoadingContratos] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('UN')
  const [urgencia, setUrgencia] = useState<'Baixa' | 'Média' | 'Alta' | 'Urgente'>('Média')
  const [observacoes, setObservacoes] = useState('')
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]) // ✨ NOVO: múltiplos produtos
  
  // Produtos do estoque
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtosFiltered, setProdutosFiltered] = useState<Produto[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  
  // Controle mensal e autorização
  const [podeFazerPedido, setPodeFazerPedido] = useState(true)
  const [requerAutorizacao, setRequerAutorizacao] = useState(false)
  const [autorizacaoDialogVisible, setAutorizacaoDialogVisible] = useState(false)
  const [justificativaAutorizacao, setJustificativaAutorizacao] = useState('')
  
  // Dialog de Detalhes
  const [detalhesDialogVisible, setDetalhesDialogVisible] = useState(false)
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoMobile | null>(null)

  // Status do Período de Pedidos (DIA 15-23)
  const [statusPeriodo, setStatusPeriodo] = useState<StatusPeriodo | null>(null)

  useEffect(() => {
    const init = async () => {
      // Configurar notificações
      await configurarNotificacoes()
      
      // Verificar período de pedidos
      const status = verificarPeriodoPedidos()
      setStatusPeriodo(status)
      
      // Verificar se deve enviar notificação
      await verificarEEnviarNotificacao()

      // Carregar dados do usuário do AsyncStorage
      const storedUserId = await AsyncStorage.getItem('userId')
      const storedUserName = await AsyncStorage.getItem('userName')
      const storedUserEmail = await AsyncStorage.getItem('userEmail')
      
      if (storedUserId) setSupervisorId(storedUserId)
      if (storedUserName) setSupervisorNome(storedUserName)
      if (storedUserEmail) setSupervisorEmail(storedUserEmail)
      
      if (!storedUserId) {
        console.log('⚠️ Nenhum ID de supervisor encontrado')
        setLoading(false)
        return
      }
      
      // Carregar pedidos
      loadPedidos(storedUserId)
      
      // Configurar realtime para atualizações de status
      const subscription = subscribePedidosRealtime(storedUserId, (pedidosAtualizados) => {
        console.log('📡 Pedidos atualizados via realtime:', pedidosAtualizados.length)
        setPedidos(pedidosAtualizados)
      })

      return () => {
        subscription.unsubscribe()
      }
    }
    
    init()
  }, [])

  useEffect(() => {
    // Aplicar filtro quando mudar
    if (supervisorId) {
      loadPedidos(supervisorId)
    }
  }, [filter, supervisorId])

  const loadPedidos = async (id?: string) => {
    try {
      const idToUse = id || supervisorId
      
      if (!idToUse) {
        console.log('⚠️ Nenhum ID de supervisor para carregar pedidos')
        setLoading(false)
        setRefreshing(false)
        return
      }
      
      const pedidosData = await fetchMeusPedidos(idToUse)
      
      // Aplicar filtro
      let pedidosFiltrados = pedidosData
      if (filter === 'ativos') {
        pedidosFiltrados = pedidosData.filter(p => 
          ['Pendente', 'Aprovado', 'Em Separação', 'Saiu para Entrega'].includes(p.status)
        )
      } else if (filter === 'entregues') {
        pedidosFiltrados = pedidosData.filter(p => p.status === 'Entregue')
      }

      setPedidos(pedidosFiltrados)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      // Se falhar, usar dados mock como fallback
      setPedidos([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadPedidos()
  }

  const handleNovoPedido = async () => {
    // Verificar se pode fazer pedido este mês
    setLoading(true)
    try {
      const verificacao = await verificarPodeFazerPedido(supervisorId)
      
      setPodeFazerPedido(verificacao.pode_fazer)
      setRequerAutorizacao(verificacao.requer_autorizacao)
      
      if (!verificacao.pode_fazer && verificacao.requer_autorizacao) {
        // Já fez pedido este mês - precisa de autorização
        Alert.alert(
          '⚠️ Limite de Pedidos Atingido',
          `Você já fez ${verificacao.total_pedidos_mes} pedido(s) este mês.\n\nVocê pode solicitar autorização para fazer um pedido urgente.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Solicitar Autorização', 
              onPress: () => setAutorizacaoDialogVisible(true)
            }
          ]
        )
        setLoading(false)
        return
      }
    } catch (error) {
      console.error('Erro ao verificar pedidos:', error)
      // Continuar mesmo com erro
    } finally {
      setLoading(false)
    }
    
    // Abrir dialog normalmente
    setContratoSelecionado(null)
    setProdutoSelecionado(null)
    setQuantidade('')
    setUnidade('UN')
    setUrgencia('Média')
    setObservacoes('')
    setSearchQuery('')
    setJustificativaAutorizacao('')
    setItensPedido([]) // Limpar itens ao abrir novo pedido
    setNovoPedidoVisible(true)
    
    // Carregar contratos ativos
    setLoadingContratos(true)
    try {
      const contratosData = await fetchContratosAtivos(supervisorId)
      setContratos(contratosData)
      
      if (contratosData.length === 0) {
        Alert.alert(
          '⚠️ Nenhum Contrato Cadastrado',
          'Você precisa cadastrar pelo menos um contrato/cliente antes de fazer um pedido.\n\nVá para a aba "Contratos" e cadastre um cliente.',
          [
            { text: 'OK', onPress: () => setNovoPedidoVisible(false) }
          ]
        )
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error)
      Alert.alert('Aviso', 'Não foi possível carregar a lista de contratos')
    } finally {
      setLoadingContratos(false)
    }
    
    // Carregar produtos do estoque
    setLoadingProdutos(true)
    try {
      const produtosData = await fetchProdutosDisponiveis()
      setProdutos(produtosData)
      setProdutosFiltered(produtosData)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      Alert.alert('Aviso', 'Não foi possível carregar a lista de produtos do estoque')
    } finally {
      setLoadingProdutos(false)
    }
  }

  const handleSearchProdutos = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setProdutosFiltered(produtos)
    } else {
      const filtered = produtos.filter(p => 
        p.nome.toLowerCase().includes(query.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(query.toLowerCase())
      )
      setProdutosFiltered(filtered)
    }
  }

  const handleSelecionarProduto = (produto: Produto) => {
    setProdutoSelecionado(produto)
    setUnidade(produto.unidade || 'UN')
    setQuantidade('') // Resetar quantidade para novo produto
  }

  const handleAdicionarItem = () => {
    if (!produtoSelecionado) {
      Alert.alert('Erro', 'Selecione um produto')
      return
    }
    if (!quantidade || Number(quantidade) <= 0) {
      Alert.alert('Erro', 'Quantidade inválida')
      return
    }

    const novoItem: ItemPedido = {
      produto_id: produtoSelecionado.id,
      produto_codigo: produtoSelecionado.codigo || produtoSelecionado.id,
      produto_nome: produtoSelecionado.nome,
      quantidade: Number(quantidade),
      unidade: unidade,
      observacoes: null
    }

    setItensPedido([...itensPedido, novoItem])
    
    // Resetar seleção para adicionar próximo produto
    setProdutoSelecionado(null)
    setQuantidade('')
    setUnidade('UN')
    setSearchQuery('')
    
    Alert.alert('✅ Produto Adicionado', `${novoItem.quantidade} ${novoItem.unidade} de ${novoItem.produto_nome} adicionado ao pedido`)
  }

  const handleRemoverItem = (index: number) => {
    const novoArray = itensPedido.filter((_, i) => i !== index)
    setItensPedido(novoArray)
  }

  const handleSalvarPedido = async () => {
    // Validar se selecionou contrato
    if (!contratoSelecionado) {
      Alert.alert('Erro', 'Selecione um contrato/cliente para este pedido')
      return
    }

    // Validar se tem itens no pedido
    if (itensPedido.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um produto ao pedido')
      return
    }

    setLoading(true)
    try {
      if (!supervisorId || !supervisorNome || !supervisorEmail) {
        Alert.alert('Erro', 'Dados do supervisor não encontrados. Faça login novamente.')
        setLoading(false)
        return
      }
      
      const novoPedido = await criarPedido({
        supervisor_id: supervisorId,
        supervisor_nome: supervisorNome,
        supervisor_email: supervisorEmail,
        contrato_id: contratoSelecionado.id,
        contrato_nome: contratoSelecionado.nome_contrato,
        contrato_endereco: formatarEnderecoCompleto(contratoSelecionado),
        itens: itensPedido,
        urgencia: urgencia,
        observacoes: observacoes || undefined,
        requer_autorizacao: requerAutorizacao,
        autorizacao_justificativa: requerAutorizacao ? justificativaAutorizacao : undefined
      })

      if (novoPedido) {
        setNovoPedidoVisible(false)
        
        const totalItens = itensPedido.length
        const resumoItens = itensPedido.map(item => `${item.quantidade} ${item.unidade} de ${item.produto_nome}`).join('\n')
        
        if (requerAutorizacao) {
          Alert.alert(
            '✅ Autorização Solicitada!',
            `Seu pedido com ${totalItens} produto(s) foi enviado para aprovação:\n\n${resumoItens}\n\nVocê será notificado quando for aprovado.`,
            [{ text: 'OK' }]
          )
        } else {
          Alert.alert(
            '✅ Pedido Criado!',
            `Pedido #${novoPedido.numero_pedido} criado com sucesso!\n\nProdutos:\n${resumoItens}\n\nStatus: ${novoPedido.status}`,
            [{ text: 'OK' }]
          )
        }
        
        // Recarregar pedidos
        loadPedidos()
      }
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error)
      Alert.alert(
        'Erro ao Criar Pedido',
        error.message || 'Não foi possível criar o pedido. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSolicitarAutorizacao = async () => {
    if (!justificativaAutorizacao.trim()) {
      Alert.alert('Erro', 'Justificativa é obrigatória para solicitar autorização')
      return
    }

    setAutorizacaoDialogVisible(false)
    setRequerAutorizacao(true)
    setNovoPedidoVisible(true)
    
    // Carregar produtos
    setLoadingProdutos(true)
    try {
      const produtosData = await fetchProdutosDisponiveis()
      setProdutos(produtosData)
      setProdutosFiltered(produtosData)
    } catch (error) {
      Alert.alert('Aviso', 'Não foi possível carregar produtos')
    } finally {
      setLoadingProdutos(false)
    }
  }

  const handleDetalhesPress = (pedido: PedidoMobile) => {
    setPedidoSelecionado(pedido)
    setDetalhesDialogVisible(true)
  }

  const handleCancelarPress = (pedido: PedidoMobile) => {
    Alert.alert(
      'Cancelar Pedido',
      `Tem certeza que deseja cancelar o pedido ${pedido.numero_pedido}?\n\nEsta ação não pode ser desfeita.`,
      [
        {
          text: 'Não',
          style: 'cancel'
        },
        {
          text: 'Sim, Cancelar',
          onPress: async () => {
            try {
              setRefreshing(true)
              
              const resultado = await cancelarPedido(pedido.id)
              
              if (resultado.success) {
                // Sucesso - recarregar lista de pedidos
                await loadPedidos()
                
                Alert.alert(
                  '✅ Sucesso!',
                  resultado.message,
                  [{ text: 'OK' }]
                )
              } else {
                // Erro - mostrar mensagem
                Alert.alert(
                  '❌ Erro',
                  resultado.message,
                  [{ text: 'OK' }]
                )
              }
            } catch (error: any) {
              console.error('Erro ao cancelar pedido:', error)
              Alert.alert(
                '❌ Erro',
                'Não foi possível cancelar o pedido. Verifique sua conexão e tente novamente.',
                [{ text: 'OK' }]
              )
            } finally {
              setRefreshing(false)
            }
          },
          style: 'destructive'
        }
      ]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return '#fbbf24'
      case 'Aprovado':
        return '#3b82f6'
      case 'Em Separação':
        return '#8b5cf6'
      case 'Saiu para Entrega':
        return '#06b6d4'
      case 'Entregue':
        return '#10b981'
      case 'Cancelado':
        return '#ef4444'
      case 'Rejeitado':
        return '#dc2626'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'clock-outline'
      case 'Aprovado':
        return 'check-circle-outline'
      case 'Em Separação':
        return 'package-variant'
      case 'Saiu para Entrega':
        return 'truck-delivery'
      case 'Entregue':
        return 'check-circle'
      case 'Cancelado':
        return 'close-circle'
      case 'Rejeitado':
        return 'alert-circle'
      default:
        return 'help-circle'
    }
  }

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'Baixa':
        return '#10b981'
      case 'Média':
        return '#f59e0b'
      case 'Alta':
        return '#ef4444'
      case 'Urgente':
        return '#dc2626'
      default:
        return '#6b7280'
    }
  }

  const getUrgenciaIcon = (urgencia: string) => {
    switch (urgencia) {
      case 'Baixa':
        return 'arrow-down'
      case 'Média':
        return 'minus'
      case 'Alta':
        return 'arrow-up'
      case 'Urgente':
        return 'fire'
      default:
        return 'minus'
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'todos'}
          onPress={() => setFilter('todos')}
          style={styles.filterChip}
        >
          Todos
        </Chip>
        <Chip
          selected={filter === 'ativos'}
          onPress={() => setFilter('ativos')}
          style={styles.filterChip}
        >
          Ativos
        </Chip>
        <Chip
          selected={filter === 'entregues'}
          onPress={() => setFilter('entregues')}
          style={styles.filterChip}
        >
          Entregues
        </Chip>
      </View>

      {/* Banner do Período de Pedidos */}
      {statusPeriodo && (
        <Card 
          style={[
            styles.periodoBanner,
            {
              backgroundColor: statusPeriodo.dentrooPeriodo
                ? (statusPeriodo.alertaProximo ? '#fef3c7' : '#dcfce7')
                : '#fee2e2',
              borderLeftColor: statusPeriodo.dentrooPeriodo
                ? (statusPeriodo.alertaProximo ? '#f59e0b' : '#16a34a')
                : '#ef4444'
            }
          ]}
        >
          <Card.Content style={styles.periodoBannerContent}>
            <MaterialCommunityIcons
              name={statusPeriodo.dentrooPeriodo
                ? (statusPeriodo.alertaProximo ? 'clock-alert' : 'check-circle')
                : 'lock'}
              size={24}
              color={statusPeriodo.dentrooPeriodo
                ? (statusPeriodo.alertaProximo ? '#f59e0b' : '#16a34a')
                : '#ef4444'}
            />
            <View style={styles.periodoBannerTextos}>
              <Text style={[
                styles.periodoBannerMensagem,
                {
                  color: statusPeriodo.dentrooPeriodo
                    ? (statusPeriodo.alertaProximo ? '#92400e' : '#166534')
                    : '#991b1b'
                }
              ]}>
                {statusPeriodo.mensagem}
              </Text>
              {statusPeriodo.dentrooPeriodo && (
                <Text style={[
                  styles.periodoBannerInfo,
                  { color: statusPeriodo.alertaProximo ? '#92400e' : '#166534' }
                ]}>
                  Período: dia 15 a 23 de cada mês
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Lista de Pedidos */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 100 + insets.bottom : 100 }}
      >
        {pedidos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant-closed" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
          </View>
        ) : (
          pedidos.map((pedido) => (
            <PedidoCardModern
              key={pedido.id}
              pedido={pedido}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getUrgenciaColor={getUrgenciaColor}
              getUrgenciaIcon={getUrgenciaIcon}
              onDetalhesPress={() => handleDetalhesPress(pedido)}
              onCancelarPress={() => handleCancelarPress(pedido)}
            />
          ))
        )}
      </ScrollView>

      {/* FAB para novo pedido */}
      <FAB
        icon="plus"
        style={styles.fab}
        label="Novo Pedido"
        onPress={handleNovoPedido}
      />

      {/* Dialog Solicitação de Autorização */}
      <Portal>
        <Dialog 
          visible={autorizacaoDialogVisible} 
          onDismiss={() => setAutorizacaoDialogVisible(false)}
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
            ⚠️ Solicitar Autorização
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: spacing.md, color: colors.textSecondary }}>
              Você já fez um pedido este mês. Para fazer um pedido urgente, forneça uma justificativa que será enviada para aprovação.
            </Text>
            <TextInput
              label="Justificativa para Pedido Urgente"
              value={justificativaAutorizacao}
              onChangeText={setJustificativaAutorizacao}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Ex: Material urgente para obra que iniciará amanhã..."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAutorizacaoDialogVisible(false)} textColor={colors.textSecondary}>Cancelar</Button>
            <Button 
              onPress={handleSolicitarAutorizacao} 
              mode="contained"
              buttonColor={colors.warning}
            >
              Solicitar
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog Novo Pedido */}
        <Dialog 
          visible={novoPedidoVisible} 
          onDismiss={() => setNovoPedidoVisible(false)} 
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
            {requerAutorizacao ? '🔐 Pedido com Autorização' : 'Novo Pedido de Material'}
          </Dialog.Title>
          <Dialog.Content>
            {/* ✨ SELEÇÃO DE CONTRATO */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionLabel}>Cliente/Contrato de Destino: *</Text>
              
              {loadingContratos ? (
                <View style={styles.loadingProdutos}>
                  <ActivityIndicator size="small" color={colors.secondary} />
                  <Text style={{ marginLeft: spacing.sm, color: colors.textSecondary }}>Carregando contratos...</Text>
                </View>
              ) : contratos.length === 0 ? (
                <View style={styles.avisoSemContratos}>
                  <MaterialCommunityIcons name="alert-circle" size={24} color={colors.warning} />
                  <Text style={{ color: colors.warning, marginLeft: spacing.sm, flex: 1 }}>
                    Você não possui contratos cadastrados. Vá para a aba "Contratos" para cadastrar um cliente.
                  </Text>
                </View>
              ) : contratoSelecionado ? (
                <View style={styles.contratoSelecionadoContainer}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contratoSelecionadoNome}>
                      📄 {contratoSelecionado.nome_contrato}
                    </Text>
                    <Text style={styles.contratoSelecionadoEndereco}>
                      📍 {formatarEnderecoCompleto(contratoSelecionado)}
                    </Text>
                    {contratoSelecionado.encarregado_nome && (
                      <Text style={styles.contratoSelecionadoEncarregado}>
                        👤 {contratoSelecionado.encarregado_nome}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => setContratoSelecionado(null)}>
                    <MaterialCommunityIcons name="pencil" size={24} color={colors.secondary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.contratosListContainer}>
                  <FlatList
                    data={contratos}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => setContratoSelecionado(item)}>
                        <View style={styles.contratoItem}>
                          <MaterialCommunityIcons name="file-document-outline" size={24} color={colors.secondary} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.contratoItemNome}>{item.nome_contrato}</Text>
                            <Text style={styles.contratoItemEndereco}>
                              {item.endereco_cidade && item.endereco_estado
                                ? `${item.endereco_cidade}/${item.endereco_estado}`
                                : formatarEnderecoCompleto(item)}
                            </Text>
                          </View>
                          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray400} />
                        </View>
                      </TouchableOpacity>
                    )}
                    style={{ maxHeight: 150 }}
                  />
                </View>
              )}
            </View>

            {/* Produto Selecionado */}
            {produtoSelecionado ? (
              <View style={styles.produtoSelecionadoContainer}>
                <Text style={styles.produtoSelecionadoLabel}>Produto Selecionado:</Text>
                <Chip
                  icon="package-variant"
                  onClose={() => setProdutoSelecionado(null)}
                  style={styles.produtoSelecionadoChip}
                  textStyle={{ color: colors.secondary }}
                >
                  {produtoSelecionado.nome}
                </Chip>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionLabel}>Selecione o Produto do Estoque:</Text>
                
                {/* Busca */}
                <Searchbar
                  placeholder="Buscar produto..."
                  onChangeText={handleSearchProdutos}
                  value={searchQuery}
                  style={styles.searchBar}
                />

                {/* Lista de Produtos */}
                {loadingProdutos ? (
                  <View style={styles.loadingProdutos}>
                    <ActivityIndicator size="small" color={colors.secondary} />
                    <Text style={{ marginLeft: spacing.sm, color: colors.textSecondary }}>Carregando produtos...</Text>
                  </View>
                ) : (
                  <View style={styles.produtosListContainer}>
                    <FlatList
                      data={produtosFiltered}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelecionarProduto(item)}>
                          <View style={styles.produtoItem}>
                            <MaterialCommunityIcons name="package-variant" size={20} color={colors.secondary} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.produtoNome}>{item.nome}</Text>
                              {item.codigo && (
                                <Text style={styles.produtoCodigo}>Cód: {item.codigo}</Text>
                              )}
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.gray400} />
                          </View>
                        </TouchableOpacity>
                      )}
                      style={styles.produtosList}
                      ListEmptyComponent={
                        <View style={styles.emptyProdutos}>
                          <Text style={styles.emptyText}>
                            {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto no estoque'}
                          </Text>
                        </View>
                      }
                    />
                  </View>
                )}
              </View>
            )}

            {/* Itens já Adicionados */}
            {itensPedido.length > 0 && (
              <View style={styles.itensAdicionadosContainer}>
                <Text style={styles.itensAdicionadosLabel}>
                  Produtos no Pedido ({itensPedido.length}):
                </Text>
                {itensPedido.map((item, index) => (
                  <View key={index} style={styles.itemAdicionado}>
                    <MaterialCommunityIcons name="package-variant" size={18} color={colors.secondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemNome}>{item.produto_nome}</Text>
                      <Text style={styles.itemQuantidade}>
                        {item.quantidade} {item.unidade}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoverItem(index)}>
                      <MaterialCommunityIcons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Formulário (só aparece depois de selecionar produto) */}
            {produtoSelecionado && (
              <View style={{ gap: 12, marginTop: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    label="Quantidade"
                    value={quantidade}
                    onChangeText={setQuantidade}
                    mode="outlined"
                    keyboardType="numeric"
                    style={{ flex: 2 }}
                    left={<TextInput.Icon icon="numeric" />}
                  />
                  <TextInput
                    label="Unidade"
                    value={unidade}
                    onChangeText={setUnidade}
                    mode="outlined"
                    style={{ flex: 1 }}
                  />
                </View>

                <Button 
                  mode="contained" 
                  onPress={handleAdicionarItem}
                  icon="plus"
                  style={{ marginTop: spacing.sm }}
                  buttonColor={colors.secondary}
                >
                  Adicionar ao Pedido
                </Button>
              </View>
            )}

            {/* Configurações Gerais do Pedido (só aparece se tiver itens) */}
            {itensPedido.length > 0 && !produtoSelecionado && (
              <View style={{ gap: 12, marginTop: 16 }}>
                {/* Aviso de Autorização */}
                {requerAutorizacao && (
                  <View style={styles.avisoAutorizacao}>
                    <MaterialCommunityIcons name="alert-circle" size={20} color={colors.warning} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.avisoAutorizacaoTitulo}>Pedido Requer Autorização</Text>
                      <Text style={styles.avisoAutorizacaoTexto}>
                        Este pedido será enviado para aprovação do painel web.
                      </Text>
                      <Text style={styles.avisoAutorizacaoJustificativa}>
                        Justificativa: {justificativaAutorizacao}
                      </Text>
                    </View>
                  </View>
                )}

                <View>
                  <Text style={{ fontSize: typography.xs, color: colors.textSecondary, marginBottom: spacing.sm }}>Urgência:</Text>
                  <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
                    {(['Baixa', 'Média', 'Alta', 'Urgente'] as const).map((urg) => (
                      <Chip
                        key={urg}
                        selected={urgencia === urg}
                        onPress={() => setUrgencia(urg)}
                        style={{ backgroundColor: urgencia === urg ? colors.secondary : colors.gray100 }}
                        textStyle={{ color: urgencia === urg ? colors.white : colors.textPrimary }}
                      >
                        {urg}
                      </Chip>
                    ))}
                  </View>
                </View>

                <TextInput
                  label="Observações (opcional)"
                  value={observacoes}
                  onChangeText={setObservacoes}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  placeholder="Detalhes adicionais..."
                />
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNovoPedidoVisible(false)} textColor={colors.textSecondary}>Cancelar</Button>
            {itensPedido.length > 0 && !produtoSelecionado && (
              <Button 
                onPress={handleSalvarPedido} 
                mode="contained" 
                icon="send"
                buttonColor={colors.secondary}
              >
                Enviar Pedido
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>

        {/* Dialog de Detalhes do Pedido */}
        <Dialog 
          visible={detalhesDialogVisible} 
          onDismiss={() => setDetalhesDialogVisible(false)} 
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
            Detalhes do Pedido
          </Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {pedidoSelecionado && (
                <View style={{ padding: 16, gap: 16 }}>
                  {/* Informações Principais */}
                  <View style={{ backgroundColor: '#f0f9ff', padding: 12, borderRadius: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0369a1', marginBottom: 4 }}>
                      {pedidoSelecionado.numero_pedido}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#64748b' }}>
                      {new Date(pedidoSelecionado.data_solicitacao).toLocaleString('pt-BR')}
                    </Text>
                  </View>

                  {/* Status e Urgência */}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Chip
                      icon={getStatusIcon(pedidoSelecionado.status)}
                      style={{ backgroundColor: getStatusColor(pedidoSelecionado.status) + '20' }}
                      textStyle={{ color: getStatusColor(pedidoSelecionado.status) }}
                    >
                      {pedidoSelecionado.status}
                    </Chip>
                    <Chip
                      icon={getUrgenciaIcon(pedidoSelecionado.urgencia)}
                      style={{ backgroundColor: getUrgenciaColor(pedidoSelecionado.urgencia) + '20' }}
                      textStyle={{ color: getUrgenciaColor(pedidoSelecionado.urgencia) }}
                    >
                      {pedidoSelecionado.urgencia}
                    </Chip>
                  </View>

                  {/* Lista de Produtos */}
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1e293b' }}>
                      Produtos ({pedidoSelecionado.itens?.length || 0})
                    </Text>
                    {pedidoSelecionado.itens && pedidoSelecionado.itens.length > 0 ? (
                      pedidoSelecionado.itens.map((item, index) => (
                        <View
                          key={item.id || index}
                          style={{
                            backgroundColor: '#f8fafc',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 8,
                            borderLeftWidth: 3,
                            borderLeftColor: '#3b82f6',
                          }}
                        >
                          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 4 }}>
                            {item.produto_nome}
                          </Text>
                          <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>
                            Código: {item.produto_codigo}
                          </Text>
                          <Text style={{ fontSize: 13, color: '#64748b' }}>
                            Quantidade: {item.quantidade} {item.unidade}
                          </Text>
                          {item.observacoes && (
                            <Text style={{ fontSize: 12, color: '#6366f1', marginTop: 4, fontStyle: 'italic' }}>
                              Obs: {item.observacoes}
                            </Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={{ color: '#94a3b8', textAlign: 'center', padding: 16 }}>
                        Nenhum produto encontrado
                      </Text>
                    )}
                  </View>

                  {/* Observações */}
                  {pedidoSelecionado.observacoes && (
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1e293b' }}>
                        Observações
                      </Text>
                      <View style={{ backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8 }}>
                        <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20 }}>
                          {pedidoSelecionado.observacoes}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Autorização */}
                  {pedidoSelecionado.requer_autorizacao && (
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1e293b' }}>
                        Autorização
                      </Text>
                      <View
                        style={{
                          backgroundColor: pedidoSelecionado.autorizacao_status === 'Aprovada' ? '#dcfce7' : '#fef3c7',
                          padding: 12,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: pedidoSelecionado.autorizacao_status === 'Aprovada' ? '#16a34a' : '#f59e0b',
                            marginBottom: 4,
                          }}
                        >
                          Status: {pedidoSelecionado.autorizacao_status || 'Pendente'}
                        </Text>
                        {pedidoSelecionado.autorizacao_justificativa && (
                          <Text style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                            Justificativa: {pedidoSelecionado.autorizacao_justificativa}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button 
              onPress={() => setDetalhesDialogVisible(false)}
              buttonColor={colors.secondary}
              textColor={colors.white}
              mode="contained"
            >
              Fechar
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
    backgroundColor: colors.gray50,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.base,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterChip: {
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  pedidoCard: {
    margin: 12,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pedidoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pedidoNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    gap: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  routeText: {
    fontSize: 12,
    color: '#4b5563',
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  smallText: {
    fontSize: 12,
    color: '#6b7280',
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.secondary,
  },
  sectionLabel: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  searchBar: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  produtosListContainer: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray50,
    ...shadows.sm,
  },
  produtosList: {
    maxHeight: 300,
  },
  produtoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  produtoNome: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  produtoCodigo: {
    fontSize: typography.xs,
    color: colors.gray400,
    marginTop: spacing.xs,
  },
  loadingProdutos: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    justifyContent: 'center',
  },
  emptyProdutos: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  produtoSelecionadoContainer: {
    marginBottom: spacing.md,
  },
  produtoSelecionadoLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  produtoSelecionadoChip: {
    backgroundColor: colors.secondary + '15',
    alignSelf: 'flex-start',
  },
  avisoAutorizacao: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning,
    ...shadows.sm,
  },
  avisoAutorizacaoTitulo: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  avisoAutorizacaoTexto: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  avisoAutorizacaoJustificativa: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  autorizacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.sm,
  },
  autorizacaoText: {
    fontSize: typography.xs,
    color: colors.warning,
    fontWeight: typography.medium,
  },
  itensAdicionadosContainer: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.secondary + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.secondary + '40',
    ...shadows.sm,
  },
  itensAdicionadosLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  itemAdicionado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
    ...shadows.sm,
  },
  itemNome: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  itemQuantidade: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  itensContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  itemPedido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  itemPedidoTexto: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  // ✨ Estilos de Contrato
  contratosListContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray50,
    ...shadows.sm,
  },
  contratoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  contratoItemNome: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  contratoItemEndereco: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  contratoSelecionadoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    backgroundColor: colors.success + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.success,
    gap: spacing.sm,
    ...shadows.sm,
  },
  contratoSelecionadoNome: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  contratoSelecionadoEndereco: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  contratoSelecionadoEncarregado: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  avisoSemContratos: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning,
    ...shadows.sm,
  },
  // ✨ Estilos do Banner de Período
  periodoBanner: {
    margin: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    elevation: 1,
  },
  periodoBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  periodoBannerTextos: {
    flex: 1,
  },
  periodoBannerMensagem: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  periodoBannerInfo: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8,
  },
})

