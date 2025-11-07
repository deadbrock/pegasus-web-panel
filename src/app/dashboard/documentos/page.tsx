"use client"
import React, { useEffect, useState } from 'react'
import { 
	fetchDocumentos, 
	createDocumento, 
	uploadDocumento, 
	subscribeDocumentos,
	type Documento 
} from '@/lib/services/documentos-service'
import { useToast } from '@/hooks/use-toast'

export default function DocumentosPage() {
	const [docs, setDocs] = useState<Documento[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [tipo, setTipo] = useState<string>('')
	const [titulo, setTitulo] = useState('')
	const [tipoNovo, setTipoNovo] = useState<'financeiro' | 'fiscal' | 'logistica' | 'outro'>('financeiro')
	const [file, setFile] = useState<File | null>(null)
	const [uploading, setUploading] = useState(false)
	const { toast } = useToast()

	const load = async () => {
		setLoading(true)
		setError(null)
		try {
			const data = await fetchDocumentos(tipo || undefined)
			setDocs(data)
		} catch (e: any) {
			setError(e?.message || 'Erro ao carregar documentos')
			toast({
				title: 'Erro',
				description: 'Não foi possível carregar os documentos',
				variant: 'destructive'
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { 
		load()
		
		// Subscrever mudanças em tempo real
		const unsubscribe = subscribeDocumentos(() => {
			console.log('[Documentos] Mudança detectada, recarregando...')
			load()
		})
		
		return () => unsubscribe()
	}, [tipo])

	const onUpload = async () => {
		if (!file || !titulo) {
			toast({
				title: 'Erro',
				description: 'Preencha o título e selecione um arquivo',
				variant: 'destructive'
			})
			return
		}
		
		setUploading(true)
		setError(null)
		try {
			// Upload do arquivo
			const arquivo_url = await uploadDocumento(file)
			if (!arquivo_url) {
				throw new Error('Falha ao fazer upload do arquivo')
			}

			// Criar registro no banco
			const created = await createDocumento({
				titulo,
				tipo: tipoNovo,
				arquivo_url
			})

			if (!created) {
				throw new Error('Falha ao registrar documento')
			}

			toast({
				title: 'Sucesso',
				description: 'Documento enviado com sucesso!'
			})

			setTitulo('')
			setTipoNovo('financeiro')
			setFile(null)
			await load()
		} catch (e: any) {
			setError(e?.message || 'Erro ao enviar documento')
			toast({
				title: 'Erro',
				description: e?.message || 'Erro ao enviar documento',
				variant: 'destructive'
			})
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