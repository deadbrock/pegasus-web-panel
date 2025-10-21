"use client"
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'

type User = { id: string; email: string; name?: string; role: string } | null

type AuthState = {
	user: User
	token: string | null
	login: (email: string, password: string) => Promise<void>
	logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User>(null)
	const [token, setToken] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	// Verificar sessão existente ao carregar
	useEffect(() => {
		const checkSession = async () => {
			try {
				const { data: { session } } = await supabase.auth.getSession()
				
				if (session?.user) {
					console.log('[Auth] Sessão encontrada:', session.user.email)
					setToken(session.access_token)
					setUser({
						id: session.user.id,
						email: session.user.email || '',
						name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
						role: session.user.user_metadata?.role || 'user'
					})
				}
			} catch (error) {
				console.error('[Auth] Erro ao verificar sessão:', error)
			} finally {
				setLoading(false)
			}
		}

		checkSession()

		// Escutar mudanças de autenticação
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				setToken(session.access_token)
				setUser({
					id: session.user.id,
					email: session.user.email || '',
					name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
					role: session.user.user_metadata?.role || 'user'
				})
			} else {
				setToken(null)
				setUser(null)
			}
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [])

	const login = async (email: string, password: string) => {
		console.log('[Auth] Fazendo login via Supabase:', email)
		
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (error) {
				console.error('[Auth] Erro do Supabase:', error)
				throw new Error(error.message || 'Falha no login')
			}

			if (!data.user || !data.session) {
				throw new Error('Credenciais inválidas')
			}

			console.log('[Auth] Login bem-sucedido:', data.user.email)
			
			setToken(data.session.access_token)
			setUser({
				id: data.user.id,
				email: data.user.email || '',
				name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
				role: data.user.user_metadata?.role || 'user'
			})
		} catch (error: any) {
			console.error('[Auth] Erro ao fazer login:', error)
			throw error
		}
	}

	const logout = async () => {
		console.log('[Auth] Fazendo logout')
		await supabase.auth.signOut()
		setUser(null)
		setToken(null)
	}

	const value = useMemo(() => ({ user, token, login, logout }), [user, token])
	
	// Não renderizar até verificar sessão
	if (loading) {
		return <div className="min-h-screen flex items-center justify-center">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
		</div>
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
	return ctx
}


