"use client"
import React, { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'

export function HeaderAuth() {
	const { user, login, logout } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const onLogin = async () => {
		setLoading(true)
		setError(null)
		try {
			await login(email, password)
			setEmail('')
			setPassword('')
		} catch (e: any) {
			setError(e?.message || 'Erro ao autenticar')
		} finally {
			setLoading(false)
		}
	}

	if (user) {
		return (
			<div className="flex items-center gap-3">
				<span className="text-sm">{user.name || user.email} ({user.role})</span>
				<button className="px-3 py-1 border rounded" onClick={logout}>Sair</button>
			</div>
		)
	}

	return (
		<div className="flex items-center gap-2">
			<input className="px-2 py-1 border rounded" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
			<input className="px-2 py-1 border rounded" placeholder="senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
			<button className="px-3 py-1 border rounded" onClick={onLogin} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
			{error && <span className="text-red-500 text-sm">{error}</span>}
		</div>
	)
}


