#!/usr/bin/env node

/**
 * Script para verificar variáveis de ambiente necessárias
 * Útil antes de fazer deploy
 */

const requiredEnvVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'URL do projeto Supabase',
    example: 'https://xxxxxxxxxxxxx.supabase.co',
    public: true
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Chave anônima (anon/public) do Supabase',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    public: true
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Chave service_role do Supabase (SECRETA)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    public: false,
    critical: true
  }
]

const optionalEnvVars = [
  {
    name: 'DATABASE_URL',
    description: 'String de conexão PostgreSQL do Supabase',
    example: 'postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres'
  }
]

console.log('🔍 Verificando variáveis de ambiente...\n')

let hasErrors = false
let hasWarnings = false

// Verificar variáveis obrigatórias
console.log('📋 Variáveis Obrigatórias:')
console.log('─'.repeat(80))

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar.name]
  const isSet = !!value

  if (isSet) {
    // Mostrar apenas primeiros/últimos caracteres para segurança
    const displayValue = envVar.public 
      ? value 
      : `${value.substring(0, 20)}...${value.substring(value.length - 10)}`
    
    console.log(`✅ ${envVar.name}`)
    console.log(`   ${envVar.description}`)
    console.log(`   Valor: ${displayValue}`)
    
    // Validações básicas
    if (envVar.name.includes('URL') && !value.startsWith('http')) {
      console.log(`   ⚠️  AVISO: URL deve começar com http:// ou https://`)
      hasWarnings = true
    }
    
    if (envVar.name.includes('KEY') && value.length < 30) {
      console.log(`   ⚠️  AVISO: Chave parece muito curta`)
      hasWarnings = true
    }
  } else {
    console.log(`❌ ${envVar.name} - NÃO CONFIGURADA`)
    console.log(`   ${envVar.description}`)
    console.log(`   Exemplo: ${envVar.example}`)
    
    if (envVar.critical) {
      console.log(`   ⚠️  CRÍTICO: Esta variável é necessária para funcionalidades importantes!`)
    }
    
    hasErrors = true
  }
  console.log('')
})

// Verificar variáveis opcionais
console.log('\n📋 Variáveis Opcionais:')
console.log('─'.repeat(80))

optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar.name]
  const isSet = !!value

  if (isSet) {
    const displayValue = value.includes('postgresql://') 
      ? value.replace(/:[^@]+@/, ':****@') // Ocultar senha
      : value
    
    console.log(`✅ ${envVar.name}`)
    console.log(`   ${envVar.description}`)
    console.log(`   Valor: ${displayValue}`)
  } else {
    console.log(`ℹ️  ${envVar.name} - não configurada (opcional)`)
    console.log(`   ${envVar.description}`)
  }
  console.log('')
})

// Resumo
console.log('\n' + '═'.repeat(80))
console.log('📊 RESUMO')
console.log('═'.repeat(80))

if (!hasErrors && !hasWarnings) {
  console.log('✅ Todas as variáveis obrigatórias estão configuradas!')
  console.log('✅ Nenhum problema detectado!')
  console.log('\n🚀 Você está pronto para fazer deploy!')
} else {
  if (hasErrors) {
    console.log('❌ Algumas variáveis obrigatórias NÃO estão configuradas!')
    console.log('\n📝 Para configurar localmente:')
    console.log('   1. Crie/edite o arquivo .env.local na raiz do projeto')
    console.log('   2. Adicione as variáveis faltantes')
    console.log('   3. Reinicie o servidor (npm run dev)')
    console.log('\n📝 Para configurar na Vercel:')
    console.log('   1. Acesse vercel.com → seu projeto → Settings → Environment Variables')
    console.log('   2. Adicione cada variável faltante')
    console.log('   3. Faça redeploy do projeto')
    console.log('\n📖 Consulte DEPLOY_VERCEL.md para instruções detalhadas')
  }
  
  if (hasWarnings) {
    console.log('\n⚠️  Alguns avisos foram detectados. Verifique os valores acima.')
  }
}

console.log('\n' + '═'.repeat(80))

// Exit code
process.exit(hasErrors ? 1 : 0)

