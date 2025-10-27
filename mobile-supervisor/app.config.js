module.exports = {
  expo: {
    name: "Pegasus Supervisor",
    slug: "pegasus-supervisor",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    splash: {
      backgroundColor: "#3b82f6",
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
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "FOREGROUND_SERVICE"
      ]
    },
    web: {
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Permitir que Pegasus Supervisor acesse sua localização."
        }
      ],
      [
        "expo-notifications",
        {
          color: "#3b82f6"
        }
      ]
    ],
    scheme: "pegasus-supervisor",
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "pegasus-supervisor-2025"
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}

