import { ScrollView, View, Platform, ScrollViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ReactNode } from 'react'

interface TabScreenContainerProps extends ScrollViewProps {
  children: ReactNode
}

export function TabScreenContainer({ children, style, ...props }: TabScreenContainerProps) {
  const insets = useSafeAreaInsets()
  
  // Calcular padding bottom baseado na plataforma e safe area
  // Android precisa de mais espaço por causa dos botões de navegação do sistema
  const bottomPadding = Platform.OS === 'ios' ? 100 + insets.bottom : 120

  return (
    <ScrollView style={style} {...props}>
      {children}
      {/* Espaço extra para a tab bar não cobrir o conteúdo */}
      <View style={{ height: bottomPadding }} />
    </ScrollView>
  )
}

