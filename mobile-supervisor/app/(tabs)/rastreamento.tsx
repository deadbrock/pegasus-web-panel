import { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Card, Title, Text, Chip, ActivityIndicator, List } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import MapView, { Marker } from 'react-native-maps'
import { supabase } from '../../services/supabase'

type Veiculo = {
  id: string
  placa: string
  modelo: string
  status: string
  latitude?: number
  longitude?: number
  motorista?: string
}

export default function RastreamentoScreen() {
  const [loading, setLoading] = useState(true)
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [selectedVeiculo, setSelectedVeiculo] = useState<string | null>(null)

  useEffect(() => {
    loadVeiculos()

    // Configurar realtime para posições
    const subscription = supabase
      .channel('posicoes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posicoes_veiculo' }, () => {
        loadVeiculos()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadVeiculos = async () => {
    try {
      // Buscar veículos ativos
      const { data: veiculosData, error: veiculosError } = await supabase
        .from('veiculos')
        .select('*')
        .eq('status', 'Ativo')

      if (veiculosError) throw veiculosError

      // Para cada veículo, buscar última posição
      const veiculosComPosicao = await Promise.all(
        (veiculosData || []).map(async (veiculo) => {
          const { data: posicaoData } = await supabase
            .from('posicoes_veiculo')
            .select('latitude, longitude, motorista_nome')
            .eq('veiculo_id', veiculo.id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single()

          return {
            id: veiculo.id,
            placa: veiculo.placa,
            modelo: veiculo.modelo,
            status: veiculo.status,
            latitude: posicaoData?.latitude,
            longitude: posicaoData?.longitude,
            motorista: posicaoData?.motorista_nome,
          }
        })
      )

      setVeiculos(veiculosComPosicao)
    } catch (error) {
      console.error('Erro ao carregar veículos:', error)
    } finally {
      setLoading(false)
    }
  }

  const veiculosComLocalizacao = veiculos.filter(v => v.latitude && v.longitude)

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando rastreamento...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Mapa */}
      {veiculosComLocalizacao.length > 0 ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: veiculosComLocalizacao[0].latitude!,
            longitude: veiculosComLocalizacao[0].longitude!,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {veiculosComLocalizacao.map((veiculo) => (
            <Marker
              key={veiculo.id}
              coordinate={{
                latitude: veiculo.latitude!,
                longitude: veiculo.longitude!,
              }}
              title={veiculo.placa}
              description={veiculo.modelo}
              onPress={() => setSelectedVeiculo(veiculo.id)}
            >
              <View style={styles.markerContainer}>
                <MaterialCommunityIcons name="truck" size={32} color="#3b82f6" />
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.noMapContainer}>
          <MaterialCommunityIcons name="map-marker-off" size={64} color="#9ca3af" />
          <Text style={styles.noMapText}>Nenhum veículo com localização disponível</Text>
        </View>
      )}

      {/* Lista de Veículos */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Title style={styles.listTitle}>Veículos em Rota</Title>
          <Chip icon="truck" style={styles.countChip}>
            {veiculos.length}
          </Chip>
        </View>

        <ScrollView style={styles.vehicleList}>
          {veiculos.map((veiculo) => (
            <Card
              key={veiculo.id}
              style={[
                styles.vehicleCard,
                selectedVeiculo === veiculo.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedVeiculo(veiculo.id)}
            >
              <Card.Content>
                <View style={styles.vehicleHeader}>
                  <View style={styles.vehicleInfo}>
                    <MaterialCommunityIcons name="truck" size={24} color="#3b82f6" />
                    <View style={styles.vehicleDetails}>
                      <Text style={styles.vehiclePlaca}>{veiculo.placa}</Text>
                      <Text style={styles.vehicleModelo}>{veiculo.modelo}</Text>
                    </View>
                  </View>
                  <Chip
                    icon={veiculo.latitude ? 'map-marker-check' : 'map-marker-off'}
                    style={
                      veiculo.latitude
                        ? styles.activeChip
                        : styles.inactiveChip
                    }
                    textStyle={
                      veiculo.latitude
                        ? styles.activeChipText
                        : styles.inactiveChipText
                    }
                  >
                    {veiculo.latitude ? 'Rastreando' : 'Sem sinal'}
                  </Chip>
                </View>

                {veiculo.motorista && (
                  <View style={styles.motoristaRow}>
                    <MaterialCommunityIcons name="account" size={16} color="#6b7280" />
                    <Text style={styles.motoristaText}>{veiculo.motorista}</Text>
                  </View>
                )}

                {veiculo.latitude && veiculo.longitude && (
                  <View style={styles.coordsRow}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#9ca3af" />
                    <Text style={styles.coordsText}>
                      {veiculo.latitude.toFixed(6)}, {veiculo.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))}

          {veiculos.length === 0 && (
            <View style={styles.emptyList}>
              <MaterialCommunityIcons name="truck-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>Nenhum veículo em rota</Text>
            </View>
          )}
        </ScrollView>
      </View>
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
  map: {
    flex: 1,
  },
  noMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#e5e7eb',
  },
  noMapText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  listContainer: {
    maxHeight: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  countChip: {
    backgroundColor: '#eff6ff',
  },
  vehicleList: {
    paddingHorizontal: 16,
  },
  vehicleCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleDetails: {
    gap: 2,
  },
  vehiclePlaca: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  vehicleModelo: {
    fontSize: 12,
    color: '#6b7280',
  },
  activeChip: {
    backgroundColor: '#dcfce7',
  },
  activeChipText: {
    color: '#15803d',
  },
  inactiveChip: {
    backgroundColor: '#fee2e2',
  },
  inactiveChipText: {
    color: '#dc2626',
  },
  motoristaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  motoristaText: {
    fontSize: 14,
    color: '#4b5563',
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  coordsText: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  emptyList: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
})

