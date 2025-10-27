import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, FlatList } from 'react-native'
import { Card, Title, Paragraph, Text, Chip, ActivityIndicator, Dialog, Portal, TextInput, Button, Searchbar } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { fetchProdutosDisponiveis, type Produto } from '../../services/produtos-service'

type Stats = {
  pedidos_ativos: number
  pedidos_pendentes: number
  pedidos_concluidos: number
  total_pedidos: number
}

export default function DashboardScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userName, setUserName] = useState('Supervisor')
  const [stats, setStats] = useState<Stats>({
    pedidos_ativos: 5,
    pedidos_pendentes: 3,
    pedidos_concluidos: 12,
    total_pedidos: 20,
  })

  // Dialog Novo Pedido
  const [novoPedidoVisible, setNovoPedidoVisible] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('UN')
  const [urgencia, setUrgencia] = useState('Média')
  const [observacoes, setObservacoes] = useState('')
  
  // Produtos do estoque
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtosFiltered, setProdutosFiltered] = useState<Produto[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingProdutos, setLoadingProdutos] = useState(false)

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => setLoading(false), 500)
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleNovoPedido = async () => {
    setProdutoSelecionado(null)
    setQuantidade('')
    setUnidade('UN')
    setUrgencia('Média')
    setObservacoes('')
    setSearchQuery('')
    setNovoPedidoVisible(true)
    
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
  }

  const handleSalvarPedido = () => {
    if (!produtoSelecionado) {
      Alert.alert('Erro', 'Selecione um produto da lista')
      return
    }
    if (!quantidade || Number(quantidade) <= 0) {
      Alert.alert('Erro', 'Quantidade inválida')
      return
    }

    setNovoPedidoVisible(false)
    Alert.alert(
      'Pedido Criado!',
      `Pedido de ${quantidade} ${unidade} de ${produtoSelecionado.nome} foi enviado com urgência ${urgencia}.`,
      [{ text: 'OK' }]
    )
    
    // Atualizar estatísticas
    setStats({
      ...stats,
      pedidos_pendentes: stats.pedidos_pendentes + 1,
      total_pedidos: stats.total_pedidos + 1
    })
  }

  const handleHistorico = () => {
    router.push('/(tabs)/pedidos')
  }

  const handlePendentes = () => {
    router.push('/(tabs)/pedidos')
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Title style={styles.userName}>{userName}!</Title>
        </View>
        <MaterialCommunityIcons name="account-circle" size={48} color="#3b82f6" />
      </View>

      {/* Cards de Estatísticas */}
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, styles.blueCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="clipboard-list" size={32} color="#3b82f6" />
            <Title style={styles.statNumber}>{stats.pedidos_ativos}</Title>
            <Paragraph style={styles.statLabel}>Em Andamento</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, styles.orangeCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="clock-outline" size={32} color="#f59e0b" />
            <Title style={styles.statNumber}>{stats.pedidos_pendentes}</Title>
            <Paragraph style={styles.statLabel}>Pendentes</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, styles.greenCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="check-circle" size={32} color="#10b981" />
            <Title style={styles.statNumber}>{stats.pedidos_concluidos}</Title>
            <Paragraph style={styles.statLabel}>Concluídos</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, styles.purpleCard]}>
          <Card.Content>
            <MaterialCommunityIcons name="format-list-bulleted" size={32} color="#8b5cf6" />
            <Title style={styles.statNumber}>{stats.total_pedidos}</Title>
            <Paragraph style={styles.statLabel}>Total de Pedidos</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Ações Rápidas</Title>
        
        <TouchableOpacity onPress={handleNovoPedido}>
          <Card style={styles.actionCard}>
            <Card.Content style={styles.actionContent}>
              <MaterialCommunityIcons name="plus-circle" size={24} color="#3b82f6" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Novo Pedido de Material</Text>
                <Text style={styles.actionDescription}>Solicitar materiais do almoxarifado</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
            </Card.Content>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleHistorico}>
          <Card style={styles.actionCard}>
            <Card.Content style={styles.actionContent}>
              <MaterialCommunityIcons name="history" size={24} color="#10b981" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Histórico de Pedidos</Text>
                <Text style={styles.actionDescription}>Ver todos os pedidos anteriores</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
            </Card.Content>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePendentes}>
          <Card style={styles.actionCard}>
            <Card.Content style={styles.actionContent}>
              <MaterialCommunityIcons name="clipboard-text" size={24} color="#f59e0b" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Pedidos Pendentes</Text>
                <Text style={styles.actionDescription}>Verificar status dos pedidos</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Status do Sistema */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Status do Sistema</Title>
        <View style={styles.statusRow}>
          <Chip icon="check-circle" style={styles.statusChip} textStyle={styles.statusText}>
            Sistema Online
          </Chip>
          <Chip icon="sync" style={styles.statusChip} textStyle={styles.statusText}>
            Sincronizado
          </Chip>
        </View>
      </View>

      {/* Dialog Novo Pedido */}
      <Portal>
        <Dialog visible={novoPedidoVisible} onDismiss={() => setNovoPedidoVisible(false)} style={{ maxHeight: '90%' }}>
          <Dialog.Title>Novo Pedido de Material</Dialog.Title>
          <Dialog.Content>
            {/* Produto Selecionado */}
            {produtoSelecionado ? (
              <View style={styles.produtoSelecionadoContainer}>
                <Text style={styles.produtoSelecionadoLabel}>Produto Selecionado:</Text>
                <Chip
                  icon="package-variant"
                  onClose={() => setProdutoSelecionado(null)}
                  style={styles.produtoSelecionadoChip}
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
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text style={{ marginLeft: 8, color: '#6b7280' }}>Carregando produtos...</Text>
                  </View>
                ) : (
                  <View style={styles.produtosListContainer}>
                    <FlatList
                      data={produtosFiltered}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelecionarProduto(item)}>
                          <View style={styles.produtoItem}>
                            <MaterialCommunityIcons name="package-variant" size={20} color="#3b82f6" />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.produtoNome}>{item.nome}</Text>
                              {item.codigo && (
                                <Text style={styles.produtoCodigo}>Cód: {item.codigo}</Text>
                              )}
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
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

                <View>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Urgência:</Text>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {['Baixa', 'Média', 'Alta', 'Urgente'].map((urg) => (
                      <Chip
                        key={urg}
                        selected={urgencia === urg}
                        onPress={() => setUrgencia(urg)}
                        style={{ backgroundColor: urgencia === urg ? '#3b82f6' : '#f3f4f6' }}
                        textStyle={{ color: urgencia === urg ? 'white' : '#4b5563' }}
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
            <Button onPress={() => setNovoPedidoVisible(false)}>Cancelar</Button>
            {produtoSelecionado && (
              <Button onPress={handleSalvarPedido} mode="contained">Enviar Pedido</Button>
            )}
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
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    marginBottom: 4,
  },
  blueCard: {
    backgroundColor: '#eff6ff',
  },
  orangeCard: {
    backgroundColor: '#fff7ed',
  },
  greenCard: {
    backgroundColor: '#f0fdf4',
  },
  purpleCard: {
    backgroundColor: '#faf5ff',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  actionCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    color: '#15803d',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  searchBar: {
    marginBottom: 12,
  },
  produtosListContainer: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  produtosList: {
    maxHeight: 300,
  },
  produtoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  produtoNome: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  produtoCodigo: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  loadingProdutos: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'center',
  },
  emptyProdutos: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  produtoSelecionadoContainer: {
    marginBottom: 16,
  },
  produtoSelecionadoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  produtoSelecionadoChip: {
    backgroundColor: '#eff6ff',
    alignSelf: 'flex-start',
  },
})

