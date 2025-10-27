import { useState } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Card, Title, Text, FAB, ActivityIndicator, Dialog, Portal, TextInput, Button, Chip } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

type Contrato = {
  id: string
  nome: string
  endereco: string
  encarregados: string[]
  status: 'Ativo' | 'Inativo'
}

export default function ContratosScreen() {
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [contratos, setContratos] = useState<Contrato[]>([
    {
      id: '1',
      nome: 'Contrato Obra Centro',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP',
      encarregados: ['João Silva', 'Maria Santos'],
      status: 'Ativo'
    },
    {
      id: '2',
      nome: 'Contrato Manutenção Norte',
      endereco: 'Rua das Flores, 500 - Guarulhos/SP',
      encarregados: ['Pedro Costa'],
      status: 'Ativo'
    }
  ])

  // Dialog
  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nomeContrato, setNomeContrato] = useState('')
  const [enderecoContrato, setEnderecoContrato] = useState('')
  const [encarregado, setEncarregado] = useState('')
  const [listaEncarregados, setListaEncarregados] = useState<string[]>([])

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleNovoContrato = () => {
    setEditingId(null)
    setNomeContrato('')
    setEnderecoContrato('')
    setListaEncarregados([])
    setEncarregado('')
    setDialogVisible(true)
  }

  const handleEditarContrato = (contrato: Contrato) => {
    setEditingId(contrato.id)
    setNomeContrato(contrato.nome)
    setEnderecoContrato(contrato.endereco)
    setListaEncarregados(contrato.encarregados)
    setEncarregado('')
    setDialogVisible(true)
  }

  const handleAdicionarEncarregado = () => {
    if (encarregado.trim()) {
      setListaEncarregados([...listaEncarregados, encarregado.trim()])
      setEncarregado('')
    }
  }

  const handleRemoverEncarregado = (index: number) => {
    setListaEncarregados(listaEncarregados.filter((_, i) => i !== index))
  }

  const handleSalvarContrato = () => {
    if (!nomeContrato.trim()) {
      alert('Nome do contrato é obrigatório')
      return
    }
    if (!enderecoContrato.trim()) {
      alert('Endereço é obrigatório')
      return
    }
    if (listaEncarregados.length === 0) {
      alert('Adicione pelo menos um encarregado')
      return
    }

    if (editingId) {
      // Editar
      setContratos(contratos.map(c => 
        c.id === editingId 
          ? { ...c, nome: nomeContrato, endereco: enderecoContrato, encarregados: listaEncarregados }
          : c
      ))
    } else {
      // Criar novo
      setContratos([
        ...contratos,
        {
          id: Date.now().toString(),
          nome: nomeContrato,
          endereco: enderecoContrato,
          encarregados: listaEncarregados,
          status: 'Ativo'
        }
      ])
    }

    setDialogVisible(false)
  }

  const handleRemoverContrato = (id: string) => {
    setContratos(contratos.filter(c => c.id !== id))
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando contratos...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Meus Contratos</Title>
          <Text style={styles.headerSubtitle}>
            {contratos.length} {contratos.length === 1 ? 'contrato' : 'contratos'} sob sua responsabilidade
          </Text>
        </View>

        {/* Lista de Contratos */}
        {contratos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhum contrato cadastrado</Text>
            <Text style={styles.emptySubtext}>Toque no botão + para adicionar</Text>
          </View>
        ) : (
          contratos.map((contrato) => (
            <Card key={contrato.id} style={styles.contratoCard}>
              <Card.Content>
                {/* Header do Contrato */}
                <View style={styles.contratoHeader}>
                  <View style={styles.contratoTitleRow}>
                    <MaterialCommunityIcons 
                      name="file-document" 
                      size={24} 
                      color="#3b82f6" 
                    />
                    <Text style={styles.contratoNome}>{contrato.nome}</Text>
                  </View>
                  <Chip
                    icon="check-circle"
                    style={styles.statusChip}
                    textStyle={styles.statusText}
                  >
                    {contrato.status}
                  </Chip>
                </View>

                {/* Endereço */}
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{contrato.endereco}</Text>
                </View>

                {/* Encarregados */}
                <View style={styles.encarregadosContainer}>
                  <Text style={styles.encarregadosLabel}>Encarregados:</Text>
                  <View style={styles.encarregadosChips}>
                    {contrato.encarregados.map((enc, idx) => (
                      <Chip key={idx} icon="account" style={styles.encarregadoChip}>
                        {enc}
                      </Chip>
                    ))}
                  </View>
                </View>

                {/* Ações */}
                <View style={styles.actionsRow}>
                  <Button
                    mode="text"
                    onPress={() => handleEditarContrato(contrato)}
                    icon="pencil"
                  >
                    Editar
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => handleRemoverContrato(contrato.id)}
                    icon="delete"
                    textColor="#ef4444"
                  >
                    Remover
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* FAB Novo Contrato */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleNovoContrato}
        label="Novo Contrato"
      />

      {/* Dialog Novo/Editar Contrato */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editingId ? 'Editar Contrato' : 'Novo Contrato'}</Dialog.Title>
          <Dialog.Content style={{ gap: 12 }}>
            <TextInput
              label="Nome do Contrato"
              value={nomeContrato}
              onChangeText={setNomeContrato}
              mode="outlined"
              left={<TextInput.Icon icon="file-document" />}
            />
            <TextInput
              label="Endereço Completo"
              value={enderecoContrato}
              onChangeText={setEnderecoContrato}
              mode="outlined"
              multiline
              numberOfLines={2}
              left={<TextInput.Icon icon="map-marker" />}
            />
            
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600' }}>
                Encarregados:
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  label="Nome do Encarregado"
                  value={encarregado}
                  onChangeText={setEncarregado}
                  mode="outlined"
                  style={{ flex: 1 }}
                  left={<TextInput.Icon icon="account" />}
                />
                <Button 
                  mode="contained" 
                  onPress={handleAdicionarEncarregado}
                  style={{ alignSelf: 'center' }}
                >
                  +
                </Button>
              </View>
              
              {listaEncarregados.length > 0 && (
                <View style={styles.encarregadosChips}>
                  {listaEncarregados.map((enc, idx) => (
                    <Chip 
                      key={idx} 
                      icon="account" 
                      onClose={() => handleRemoverEncarregado(idx)}
                      style={styles.encarregadoChip}
                    >
                      {enc}
                    </Chip>
                  ))}
                </View>
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleSalvarContrato}>Salvar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
  },
  contratoCard: {
    margin: 12,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  contratoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contratoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  contratoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  statusChip: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    color: '#15803d',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  encarregadosContainer: {
    marginTop: 16,
  },
  encarregadosLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  encarregadosChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  encarregadoChip: {
    backgroundColor: '#eff6ff',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3b82f6',
  },
})

