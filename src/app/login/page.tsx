'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, Zap, TrendingUp, Shield, BarChart3, Truck, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  { icon: BarChart3, title: 'Analytics em tempo real', desc: 'Indicadores executivos e performance operacional ao vivo.' },
  { icon: Truck,     title: 'Gestão de frota completa', desc: 'Rastreamento, manutenção e motoristas em um só lugar.' },
  { icon: TrendingUp, title: 'Controle financeiro', desc: 'Centros de custo, despesas e margem operacional.' },
  { icon: Shield,    title: 'Auditoria e conformidade', desc: 'Documentos, compliance e alertas automáticos.' },
]

export default function LoginPage() {
  const { user, login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (e: any) {
      setError(e?.message || 'Credenciais inválidas. Verifique e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left panel — Brand ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] bg-[#0f172a] relative overflow-hidden flex-col">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a]" />
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/8 blur-3xl" />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative flex flex-col h-full px-12 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg tracking-tight">Pegasus</p>
              <p className="text-blue-400 text-[10px] font-semibold uppercase tracking-widest">Gestão Logística</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="mt-auto mb-12">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
              Inteligência<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                operacional
              </span><br />
              ao seu alcance.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Controle sua frota, finanças e operações logísticas com precisão e clareza em tempo real.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold mb-0.5">{f.title}</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-8 text-slate-600 text-xs">
            © {new Date().getFullYear()} Pegasus Gestão Logística · Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <p className="text-slate-800 font-bold text-lg">Pegasus</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
              Bem-vindo de volta
            </h2>
            <p className="text-slate-500 text-sm">
              Faça login para acessar sua conta
            </p>
          </div>

          <form onSubmit={onLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-white',
                    'placeholder:text-slate-400 text-slate-900',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                    'transition-all duration-150',
                    error ? 'border-rose-300' : 'border-slate-200'
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Sua senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm bg-white',
                    'placeholder:text-slate-400 text-slate-900',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                    'transition-all duration-150',
                    error ? 'border-rose-300' : 'border-slate-200'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-3.5 py-3 text-sm animate-scale-in">
                <div className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl',
                'text-sm font-semibold text-white',
                'bg-gradient-to-r from-blue-600 to-blue-500',
                'hover:from-blue-700 hover:to-blue-600',
                'shadow-lg shadow-blue-500/25',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                'transition-all duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
                'mt-2'
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Pegasus · v1.2
          </p>
        </div>
      </div>
    </div>
  )
}
