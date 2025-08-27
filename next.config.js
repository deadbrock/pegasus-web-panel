/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['moswhtqcgjcpsideykzw.supabase.co'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Ignorar erros de TypeScript durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorar erros de ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Especificar apenas onde o Next.js deve procurar páginas
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  webpack: (config, { isServer }) => {
    // Resolver fallbacks para módulos que podem não existir
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'react-native': false,
      'antd': false,
    }
    
    return config
  },
}

/**** Next.js config para rewrites do PegAI ****/

/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		return [
			{ source: '/api/chat/:path*', destination: '/api/pegai/:path*' },
		]
	},
}

module.exports = nextConfig 