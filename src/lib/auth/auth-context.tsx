"use client"
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type User = { id: number; email: string; name?: string; role: string } | null

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

	useEffect(() => {
		const t = typeof window !== 'undefined' ? localStorage.getItem('pegasus_token') : null
		if (t) {
			setToken(t)
			try {
				const payload = JSON.parse(atob(t.split('.')[1]))
				setUser({ id: 0, email: payload.sub, name: payload.name, role: payload.role })
			} catch {}
		}
	}, [])

	const login = async (email: string, password: string) => {
		const form = new URLSearchParams()
		form.append('username', email)
		form.append('password', password)
		
		const endpoint = '/api/backend/auth/token'
		console.log('[Auth] Fazendo login em:', endpoint)
		
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: form.toString(),
			cache: 'no-store',
		})
		
		console.log('[Auth] Resposta:', res.status, res.statusText)
		
		if (!res.ok) {
			const errorText = await res.text()
			console.error('[Auth] Erro:', errorText)
			throw new Error(`Falha no login: ${res.status} ${res.statusText}`)
		}
		
		const data = await res.json()
		localStorage.setItem('pegasus_token', data.access_token)
		setToken(data.access_token)
		const payload = JSON.parse(atob(data.access_token.split('.')[1]))
		setUser({ id: 0, email, name: payload.name, role: payload.role })
		console.log('[Auth] Login bem-sucedido para:', email)
	}

	const logout = () => {
		localStorage.removeItem('pegasus_token')
		setUser(null)
		setToken(null)
	}

	const value = useMemo(() => ({ user, token, login, logout }), [user, token])
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
	return ctx
}


