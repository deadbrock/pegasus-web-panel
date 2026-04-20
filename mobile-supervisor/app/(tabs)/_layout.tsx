import { Tabs } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Platform, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const { height } = Dimensions.get('window')
  
  // Ajustar altura da tab bar baseado no tamanho da tela e safe area
  const tabBarHeight = Platform.select({
    ios: 70 + insets.bottom,
    android: Math.max(85, height * 0.10), // Ajustado para 85px mínimo
    default: 85
  })
  
  // Padding bottom para manter separação dos botões do sistema
  const tabBarPaddingBottom = Platform.select({
    ios: insets.bottom || 8,
    android: Math.max(insets.bottom + 15, 22), // Reduzido para 22px mínimo
    default: 22
  })

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // 🔥 Remove o header superior em todas as telas
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 10, // Aumentado para ficar acima de tudo
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 6,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size}) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contratos"
        options={{
          title: 'Contratos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jornada"
        options={{
          title: 'Jornada',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker-path" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

