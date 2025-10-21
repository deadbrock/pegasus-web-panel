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
	// Configuração experimental para Server Actions
	experimental: {
		serverActions: {
			allowedOrigins: [
				'pegasus-production-1453.up.railway.app',
				'pegasus-web-panel-6nroyy96n-douglas-projects-c2be5a2b.vercel.app',
				'*.vercel.app',
				'*.railway.app',
				'localhost:8080',
				'localhost:3000'
			],
		},
	},
	async rewrites() {
		return [
			// Redirecionamentos de compatibilidade
			{ source: '/api/chat/:path*', destination: '/api/pegai/:path*' },
			{ source: '/api/auth/:path*', destination: '/api/backend/auth/:path*' },
		]
	},
	webpack: (config) => {
		// Resolver fallbacks para módulos que podem não existir
		config.resolve.fallback = {
			...config.resolve.fallback,
			'react-native': false,
			'antd': false,
		}
		return config
	},
}

module.exports = nextConfig 