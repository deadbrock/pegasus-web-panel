import { Stack } from 'expo-router'
import { Provider as PaperProvider } from 'react-native-paper'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  )
}
