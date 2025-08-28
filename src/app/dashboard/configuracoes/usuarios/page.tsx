"use client"
import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

type User = { id: number; email: string; username: string; name?: string; role: string }

export default function UsuariosPage() {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [form, setForm] = useState({ email: '', name: '', role: 'gestor', password: '' })

	const load = async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await apiFetch('usuarios')
			const data = await res.json()
			setUsers(data)
		} catch (e: any) {
			setError(e?.message || 'Erro ao carregar usuários')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [])

	const onCreate = async () => {
		try {
			await apiFetch('usuarios', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...form, username: form.email })
			})
			setForm({ email: '', name: '', role: 'gestor', password: '' })
			await load()
		} catch (e) {}
	}

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Usuários</h1>
			{loading && <div>Carregando...</div>}
			{error && <div className="text-red-500">{error}</div>}
			<div className="bg-white p-4 rounded border space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-5 gap-2">
					<input className="border rounded px-2 py-1" placeholder="email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} />
					<input className="border rounded px-2 py-1" placeholder="nome" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} />
					<select className="border rounded px-2 py-1" value={form.role} onChange={e=>setForm(f=>({...f, role:e.target.value}))}>
						<option value="gestor">gestor</option>
						<option value="financeiro">financeiro</option>
						<option value="diretor">diretor</option>
					</select>
					<input className="border rounded px-2 py-1" placeholder="senha" type="password" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))} />
					<button className="px-3 py-1 border rounded" onClick={onCreate}>Criar</button>
				</div>
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left">
							<th>Email</th>
							<th>Nome</th>
							<th>Perfil</th>
						</tr>
					</thead>
					<tbody>
						{users.map(u => (
							<tr key={u.id} className="border-t">
								<td className="py-2">{u.email}</td>
								<td>{u.name}</td>
								<td>{u.role}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}


