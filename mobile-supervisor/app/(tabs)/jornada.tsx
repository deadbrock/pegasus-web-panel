import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, ActivityIndicator, Platform,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Location from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  iniciarViagem, finalizarViagem, cancelarViagem,
  fetchMinhasViagens, enviarPosicao,
  haversineKm, type Viagem,
} from '../../services/telemetria-service'
import { colors, spacing, borderRadius, shadows, typography } from '../../styles/theme'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PosicaoLocal {
  latitude: number
  longitude: number
  timestamp: number
  velocidade?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtKm(km: number) {
  return km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(km * 1000)} m`
}

function fmtDuracao(startIso: string) {
  const ms = Date.now() - new Date(startIso).getTime()
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}min` : `${m}:${s.toString().padStart(2, '0')}`
}

function fmtDateBR(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function JornadaScreen() {
  const insets = useSafeAreaInsets()

  // Auth
  const [supervisorId, setSupervisorId] = useState('')
  const [userName, setUserName] = useState('Motorista')

  // Jornada atual
  const [viagemAtiva, setViagemAtiva] = useState<Viagem | null>(null)
  const [veiculoInfo, setVeiculoInfo] = useState('')
  const [kmAtual, setKmAtual] = useState(0)
  const [duracaoStr, setDuracaoStr] = useState('0:00')
  const [velocidadeAtual, setVelocidadeAtual] = useState(0)
  const [gpsStatus, setGpsStatus] = useState<'ok' | 'aguardando' | 'erro'>('aguardando')

  // Histórico
  const [historico, setHistorico] = useState<Viagem[]>([])

  // UI
  const [loading, setLoading] = useState(false)
  const [iniciando, setIniciando] = useState(false)
  const [finalizando, setFinalizando] = useState(false)

  // GPS internals
  const posicoes = useRef<PosicaoLocal[]>([])
  const watchRef = useRef<Location.LocationSubscription | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ultimoEnvio = useRef<number>(0)

  // ─── Carregar user ─────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      const [uid, name] = await Promise.all([
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('userName'),
      ])
      if (uid) setSupervisorId(uid)
      if (name) setUserName(name)

      // Verificar se havia jornada ativa salva localmente
      const savedViagem = await AsyncStorage.getItem('jornadaAtiva')
      if (savedViagem) {
        try {
          const v = JSON.parse(savedViagem) as Viagem
          if (v.status === 'ativa') {
            setViagemAtiva(v)
            await startGps(v)
          }
        } catch { /* ignore */ }
      }

      if (uid) carregarHistorico(uid)
    }
    load()

    return () => {
      watchRef.current?.remove()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // ─── Timer de duração ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!viagemAtiva) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setDuracaoStr(fmtDuracao(viagemAtiva.data_inicio))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [viagemAtiva])

  // ─── GPS ───────────────────────────────────────────────────────────────────

  const startGps = useCallback(async (viagem: Viagem) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setGpsStatus('erro')
        Alert.alert('Permissão necessária', 'Permita o acesso à localização para rastrear a jornada.')
        return
      }

      setGpsStatus('aguardando')

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 50,   // mínimo 50m de distância entre pontos
          timeInterval: 30_000,   // ou a cada 30 segundos
        },
        (loc) => {
          const { latitude, longitude, speed } = loc.coords
          const ts = loc.timestamp

          setGpsStatus('ok')
          setVelocidadeAtual(Math.round((speed ?? 0) * 3.6)) // m/s → km/h

          const novaPos: PosicaoLocal = { latitude, longitude, timestamp: ts, velocidade: speed ?? 0 }
          const prev = posicoes.current
          posicoes.current = [...prev, novaPos]

          // Calcular KM acumulado
          if (prev.length > 0) {
            const last = prev[prev.length - 1]
            const delta = haversineKm(last.latitude, last.longitude, latitude, longitude)
            setKmAtual(k => k + delta)
          }

          // Enviar posição ao Supabase a cada 60s no máximo
          const agora = Date.now()
          if (agora - ultimoEnvio.current > 60_000) {
            ultimoEnvio.current = agora
            enviarPosicao({
              veiculo_id: viagem.veiculo_id,
              latitude,
              longitude,
              velocidade: Math.round((speed ?? 0) * 3.6),
              timestamp: new Date(ts).toISOString(),
            })
          }
        }
      )
    } catch (e) {
      console.error('GPS error:', e)
      setGpsStatus('erro')
    }
  }, [])

  const stopGps = () => {
    watchRef.current?.remove()
    watchRef.current = null
    setGpsStatus('aguardando')
  }

  // ─── Ações ─────────────────────────────────────────────────────────────────

  const carregarHistorico = async (uid: string) => {
    const h = await fetchMinhasViagens(uid)
    setHistorico(h)
  }

  const handleIniciar = async () => {
    if (!supervisorId) return Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.')
    setIniciando(true)
    const v = await iniciarViagem({
      supervisor_id: supervisorId,
      motorista_nome: userName,
      veiculo_info: veiculoInfo.trim() || undefined,
    })
    setIniciando(false)

    if (!v) return Alert.alert('Erro', 'Não foi possível iniciar a jornada.')

    posicoes.current = []
    setKmAtual(0)
    setViagemAtiva(v)
    await AsyncStorage.setItem('jornadaAtiva', JSON.stringify(v))
    await startGps(v)
  }

  const handleFinalizar = async () => {
    if (!viagemAtiva) return
    Alert.alert(
      'Finalizar Jornada',
      `KM registrado: ${fmtKm(kmAtual)}\nDeseja finalizar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'default',
          onPress: async () => {
            setFinalizando(true)
            stopGps()
            const ok = await finalizarViagem(viagemAtiva.id, kmAtual)
            setFinalizando(false)
            if (!ok) return Alert.alert('Erro', 'Não foi possível finalizar a jornada.')
            await AsyncStorage.removeItem('jornadaAtiva')
            setViagemAtiva(null)
            setKmAtual(0)
            setVeiculoInfo('')
            carregarHistorico(supervisorId)
          },
        },
      ]
    )
  }

  const handleCancelar = async () => {
    if (!viagemAtiva) return
    Alert.alert(
      'Cancelar Jornada',
      'Os dados não serão salvos. Confirmar?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            stopGps()
            await cancelarViagem(viagemAtiva.id)
            await AsyncStorage.removeItem('jornadaAtiva')
            setViagemAtiva(null)
            setKmAtual(0)
          },
        },
      ]
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const gpsIcon = gpsStatus === 'ok' ? 'crosshairs-gps' : gpsStatus === 'aguardando' ? 'crosshairs' : 'crosshairs-off'
  const gpsColor = gpsStatus === 'ok' ? colors.success : gpsStatus === 'aguardando' ? colors.warning : colors.error

  return (
    <View style={[styles.container, { paddingTop: insets.top || 16 }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1e40af', '#1e3a8a']} style={styles.header}>
          <Text style={styles.headerTitle}>Jornada GPS</Text>
          <Text style={styles.headerSub}>Rastreamento pelo celular</Text>
        </LinearGradient>

        {/* ── SEM JORNADA ATIVA ── */}
        {!viagemAtiva && (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="car-key" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Iniciar Nova Jornada</Text>
            </View>
            <Text style={styles.label}>Veículo (placa ou modelo)</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: ABC-1234 Sprinter"
              placeholderTextColor={colors.gray400}
              value={veiculoInfo}
              onChangeText={setVeiculoInfo}
            />
            <Text style={styles.inputHint}>Opcional — identifica o veículo no relatório</Text>

            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleIniciar}
              disabled={iniciando}
            >
              {iniciando
                ? <ActivityIndicator color="#fff" />
                : <>
                    <MaterialCommunityIcons name="play-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>Iniciar Jornada</Text>
                  </>}
            </TouchableOpacity>
          </View>
        )}

        {/* ── JORNADA ATIVA ── */}
        {viagemAtiva && (
          <>
            {/* Status GPS */}
            <View style={[styles.gpsBar, { backgroundColor: gpsStatus === 'ok' ? '#dcfce7' : gpsStatus === 'aguardando' ? '#fef3c7' : '#fee2e2' }]}>
              <MaterialCommunityIcons name={gpsIcon} size={16} color={gpsColor} />
              <Text style={[styles.gpsText, { color: gpsColor }]}>
                {gpsStatus === 'ok' ? 'GPS ativo — rastreando' : gpsStatus === 'aguardando' ? 'Aguardando sinal GPS…' : 'Sem sinal GPS'}
              </Text>
            </View>

            {/* Métricas */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <MaterialCommunityIcons name="map-marker-distance" size={24} color={colors.primary} />
                <Text style={styles.metricValue}>{fmtKm(kmAtual)}</Text>
                <Text style={styles.metricLabel}>KM percorrido</Text>
              </View>
              <View style={styles.metricCard}>
                <MaterialCommunityIcons name="clock-outline" size={24} color={colors.secondary} />
                <Text style={styles.metricValue}>{duracaoStr}</Text>
                <Text style={styles.metricLabel}>Duração</Text>
              </View>
              <View style={styles.metricCard}>
                <MaterialCommunityIcons name="speedometer" size={24} color={colors.success} />
                <Text style={styles.metricValue}>{velocidadeAtual} km/h</Text>
                <Text style={styles.metricLabel}>Velocidade</Text>
              </View>
            </View>

            {/* Info da jornada */}
            <View style={styles.card}>
              {viagemAtiva.veiculo_info ? (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="truck" size={16} color={colors.gray500} />
                  <Text style={styles.infoText}>{viagemAtiva.veiculo_info}</Text>
                </View>
              ) : null}
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar-clock" size={16} color={colors.gray500} />
                <Text style={styles.infoText}>Início: {fmtDateBR(viagemAtiva.data_inicio)}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker-path" size={16} color={colors.gray500} />
                <Text style={styles.infoText}>{posicoes.current.length} pontos GPS registrados</Text>
              </View>
            </View>

            {/* Botões */}
            <TouchableOpacity
              style={[styles.btn, styles.btnSuccess]}
              onPress={handleFinalizar}
              disabled={finalizando}
            >
              {finalizando
                ? <ActivityIndicator color="#fff" />
                : <>
                    <MaterialCommunityIcons name="flag-checkered" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>Finalizar Jornada</Text>
                  </>}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={handleCancelar}>
              <MaterialCommunityIcons name="close-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>Cancelar (descartar)</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── HISTÓRICO ── */}
        {historico.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="history" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Últimas Jornadas</Text>
            </View>
            {historico.filter(v => v.status !== 'cancelada').slice(0, 10).map(v => (
              <View key={v.id} style={styles.histRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histDate}>{fmtDateBR(v.data_inicio)}</Text>
                  {v.veiculo_info ? <Text style={styles.histSub}>{v.veiculo_info}</Text> : null}
                </View>
                <View style={styles.histRight}>
                  <Text style={styles.histKm}>{fmtKm(v.km_percorrido)}</Text>
                  <View style={[styles.badge, v.status === 'finalizada' ? styles.badgeOk : styles.badgeActive]}>
                    <Text style={styles.badgeText}>{v.status === 'finalizada' ? 'Concluída' : 'Ativa'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  scroll: { padding: spacing.md, gap: spacing.md },
  header: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  headerTitle: { color: '#fff', fontSize: typography['2xl'], fontWeight: typography.bold },
  headerSub:   { color: 'rgba(255,255,255,0.75)', fontSize: typography.sm, marginTop: 4 },

  gpsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm + 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  gpsText: { fontSize: typography.sm, fontWeight: typography.semibold },

  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  metricValue: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.textPrimary, marginTop: 6 },
  metricLabel: { fontSize: typography.xs, color: colors.textTertiary, marginTop: 2 },

  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
    gap: spacing.sm,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textPrimary },

  label: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.xs,
    padding: spacing.sm + 4,
    fontSize: typography.base,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundTertiary,
  },
  inputHint: { fontSize: typography.xs, color: colors.textTertiary },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoText: { fontSize: typography.sm, color: colors.textSecondary },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    ...shadows.sm,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnSuccess: { backgroundColor: colors.success },
  btnDanger:  { backgroundColor: colors.error },
  btnText: { color: '#fff', fontSize: typography.base, fontWeight: typography.semibold },

  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  histDate: { fontSize: typography.sm, color: colors.textPrimary, fontWeight: typography.medium },
  histSub:  { fontSize: typography.xs, color: colors.textTertiary },
  histRight: { alignItems: 'flex-end', gap: 4 },
  histKm:   { fontSize: typography.base, fontWeight: typography.bold, color: colors.primary },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.full },
  badgeOk:     { backgroundColor: '#dcfce7' },
  badgeActive: { backgroundColor: '#dbeafe' },
  badgeText:   { fontSize: typography.xs, fontWeight: typography.semibold, color: colors.textSecondary },
})
