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
	const [saldo, setSaldo] = useState<{despesas:number, receitas:number, saldo:number} | null>(null)
	const [novaDespesa, setNovaDespesa] = useState({ descricao: '', valor: '', categoria: '', data: '' })
	const [novaReceita, setNovaReceita] = useState({ descricao: '', valor: '', categoria: '', data: '' })

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
				const fluxo = await apiFetch('financeiro/fluxo-caixa').then(r => r.json())
				setSaldo(fluxo)
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
			{saldo && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="bg-white p-4 rounded border">
						<div className="text-sm text-gray-500">Despesas</div>
						<div className="text-xl font-semibold">R$ {saldo.despesas.toFixed(2)}</div>
					</div>
					<div className="bg-white p-4 rounded border">
						<div className="text-sm text-gray-500">Receitas</div>
						<div className="text-xl font-semibold">R$ {saldo.receitas.toFixed(2)}</div>
					</div>
					<div className="bg-white p-4 rounded border">
						<div className="text-sm text-gray-500">Saldo</div>
						<div className="text-xl font-semibold">R$ {saldo.saldo.toFixed(2)}</div>
					</div>
				</div>
			)}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="bg-white p-4 rounded border">
					<h2 className="font-medium mb-2">Despesas</h2>
					<div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
						<input className="border rounded px-2 py-1" placeholder="Descrição" value={novaDespesa.descricao} onChange={e=>setNovaDespesa(s=>({...s, descricao:e.target.value}))} />
						<input className="border rounded px-2 py-1" placeholder="Valor" value={novaDespesa.valor} onChange={e=>setNovaDespesa(s=>({...s, valor:e.target.value}))} />
						<input className="border rounded px-2 py-1" placeholder="Categoria" value={novaDespesa.categoria} onChange={e=>setNovaDespesa(s=>({...s, categoria:e.target.value}))} />
						<input className="border rounded px-2 py-1" placeholder="Data" type="date" value={novaDespesa.data} onChange={e=>setNovaDespesa(s=>({...s, data:e.target.value}))} />
						<button className="px-3 py-1 border rounded" onClick={async ()=>{
							await apiFetch('financeiro/despesas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
								descricao:novaDespesa.descricao, valor: Number(novaDespesa.valor||0), categoria:novaDespesa.categoria||null, data:novaDespesa.data
							})})
							setNovaDespesa({ descricao:'', valor:'', categoria:'', data:'' })
							const [d, fluxo] = await Promise.all([
								apiFetch('financeiro/despesas').then(r=>r.json()),
								apiFetch('financeiro/fluxo-caixa').then(r=>r.json()),
							])
							setDespesas(d)
							setSaldo(fluxo)
						}}>Adicionar</button>
					</div>
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
					<div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
						<input className="border rounded px-2 py-1" placeholder="Descrição" value={novaReceita.descricao} onChange={e=>setNovaReceita(s=>({...s, descricao:e.target.value}))} />
						<input className="border rounded px-2 py-1" placeholder="Valor" value={novaReceita.valor} onChange={e=>setNovaReceita(s=>({...s, valor:e.target.value}))} />
						<input className="border rounded px-2 py-1" placeholder="Categoria" value={novaReceita.categoria} onChange={e=>setNovaReceita(s=>({...s, categoria:e.target.value}))} />
						<input className="border rounded px-2 py-1" placeholder="Data" type="date" value={novaReceita.data} onChange={e=>setNovaReceita(s=>({...s, data:e.target.value}))} />
						<button className="px-3 py-1 border rounded" onClick={async ()=>{
							await apiFetch('financeiro/receitas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
								descricao:novaReceita.descricao, valor: Number(novaReceita.valor||0), categoria:novaReceita.categoria||null, data:novaReceita.data
							})})
							setNovaReceita({ descricao:'', valor:'', categoria:'', data:'' })
							const [r, fluxo] = await Promise.all([
								apiFetch('financeiro/receitas').then(r=>r.json()),
								apiFetch('financeiro/fluxo-caixa').then(r=>r.json()),
							])
							setReceitas(r)
							setSaldo(fluxo)
						}}>Adicionar</button>
					</div>
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


