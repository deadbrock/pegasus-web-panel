"use client"
import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { supabase } from '@/lib/supabaseClient'


type Documento = { id: number; titulo: string; tipo: string; arquivo_url: string; usuario_id: number }

export default function DocumentosPage() {
	const [docs, setDocs] = useState<Documento[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [tipo, setTipo] = useState<string>('')
	const [titulo, setTitulo] = useState('')
	const [tipoNovo, setTipoNovo] = useState('financeiro')
	const [file, setFile] = useState<File | null>(null)
	const [uploading, setUploading] = useState(false)

	const load = async () => {
		setLoading(true)
		setError(null)
		try {
			const url = tipo ? `documentos?tipo=${encodeURIComponent(tipo)}` : 'documentos'
			const res = await apiFetch(url)
			const data = await res.json()
			setDocs(data)
		} catch (e: any) {
			setError(e?.message || 'Erro ao carregar documentos')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [tipo])

	const onUpload = async () => {
		if (!file || !titulo) return
		setUploading(true)
		setError(null)
		try {
			const path = `${Date.now()}_${file.name}`
			const { error: upErr } = await supabase.storage.from('documentos').upload(path, file, { upsert: false })
			if (upErr) throw upErr
			const { data: pub } = supabase.storage.from('documentos').getPublicUrl(path)
			const arquivo_url = pub.publicUrl
			const res = await apiFetch('documentos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ titulo, tipo: tipoNovo, arquivo_url })
			})
			if (!res.ok) throw new Error('Falha ao registrar documento')
			setTitulo('')
			setTipoNovo('financeiro')
			setFile(null)
			await load()
		} catch (e: any) {
			setError(e?.message || 'Erro ao enviar documento')
		} finally {
			setUploading(false)
		}
	}

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Documentos</h1>
			{loading && <div>Carregando...</div>}
			{error && <div className="text-red-500">{error}</div>}

			<div className="bg-white p-4 rounded border space-y-4">
				<div className="flex items-center gap-2">
					<select className="border rounded px-2 py-1" value={tipo} onChange={e=>setTipo(e.target.value)}>
						<option value="">Todos os tipos</option>
						<option value="financeiro">Financeiro</option>
						<option value="fiscal">Fiscal</option>
						<option value="logistica">Logística</option>
					</select>
				</div>

				<table className="w-full text-sm">
					<thead>
						<tr className="text-left">
							<th>Título</th>
							<th>Tipo</th>
							<th>Arquivo</th>
						</tr>
					</thead>
					<tbody>
						{docs.map(d => (
							<tr key={d.id} className="border-t">
								<td className="py-2">{d.titulo}</td>
								<td>{d.tipo}</td>
								<td>
									<a className="text-blue-600 hover:underline" href={d.arquivo_url} target="_blank">Abrir</a>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="bg-white p-4 rounded border space-y-3">
				<h2 className="font-medium">Novo Documento</h2>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
					<input className="border rounded px-2 py-1" placeholder="Título" value={titulo} onChange={e=>setTitulo(e.target.value)} />
					<select className="border rounded px-2 py-1" value={tipoNovo} onChange={e=>setTipoNovo(e.target.value)}>
						<option value="financeiro">Financeiro</option>
						<option value="fiscal">Fiscal</option>
						<option value="logistica">Logística</option>
					</select>
					<input type="file" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
					<button className="px-3 py-1 border rounded" onClick={onUpload} disabled={uploading}>{uploading ? 'Enviando...' : 'Enviar'}</button>
				</div>
			</div>
		</div>
	)
} 