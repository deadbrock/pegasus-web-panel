module.exports = {
  expo: {
    name: "Pegasus Supervisor",
    slug: "pegasus-supervisor",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      backgroundColor: "#1e3a8a",
      resizeMode: "contain"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.pegasus.supervisor",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Este app precisa da sua localização para rastreamento de veículos.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Este app precisa da sua localização para rastreamento em tempo real."
      }
    },
    android: {
      package: "com.pegasus.supervisor",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1e3a8a"
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "FOREGROUND_SERVICE"
      ]
    },
    web: {
      bundler: "metro",
      favicon: "./assets/icon.png"
    },
    platforms: ["ios", "android"],
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Permitir que Pegasus Supervisor acesse sua localização."
        }
      ]
      // expo-notifications removido temporariamente para compatibilidade com Expo Go
      // Em production builds (APK), adicionar de volta se necessário
    ],
    scheme: "pegasus-supervisor",
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "a4e08d93-f4ba-4ce1-96bd-a04a093a73d0"
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}

