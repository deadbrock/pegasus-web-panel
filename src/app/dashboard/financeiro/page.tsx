"use client"
import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

type Despesa = { id: number; descricao: string; valor: number; categoria?: string; data: string }
type Receita = { id: number; descricao: string; valor: number; categoria?: string; data: string }

export default function FinanceiroPage() {
	const [despesas, setDespesas] = useState<Despesa[]>([])
	const [receitas, setReceitas] = useState<Receita[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const run = async () => {
			setLoading(true)
			setError(null)
			try {
				const [d, r] = await Promise.all([
					apiFetch('financeiro/despesas').then(r => r.json()),
					apiFetch('financeiro/receitas').then(r => r.json()),
				])
				setDespesas(d)
				setReceitas(r)
			} catch (e: any) {
				setError(e?.message || 'Erro ao carregar financeiro')
			} finally {
				setLoading(false)
			}
		}
		run()
	}, [])

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Financeiro</h1>
			{loading && <div>Carregando...</div>}
			{error && <div className="text-red-500">{error}</div>}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="bg-white p-4 rounded border">
					<h2 className="font-medium mb-2">Despesas</h2>
					<ul className="space-y-2">
						{despesas.map(d => (
							<li key={d.id} className="flex justify-between text-sm">
								<span>{d.descricao}</span>
								<span>R$ {Number(d.valor).toFixed(2)}</span>
							</li>
						))}
					</ul>
				</div>
				<div className="bg-white p-4 rounded border">
					<h2 className="font-medium mb-2">Receitas</h2>
					<ul className="space-y-2">
						{receitas.map(r => (
							<li key={r.id} className="flex justify-between text-sm">
								<span>{r.descricao}</span>
								<span>R$ {Number(r.valor).toFixed(2)}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	)
}


