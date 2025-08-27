"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { sendMessage as sendChatMessage, getHistory } from '@/services/chatSimulationService'

type Msg = { from: 'user' | 'ai'; text: string }

export default function SimulationChat() {
	const [input, setInput] = useState('')
	const [messages, setMessages] = useState<Msg[]>([{
		from: 'ai',
		text: 'Olá! Eu sou o PegAI. Pergunte qualquer coisa sobre logística que eu respondo com análise preditiva.'
	}])
	const [loading, setLoading] = useState(false)
	const endRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

	useEffect(() => {
		;(async () => {
			try {
				const history = await getHistory()
				if (history && Array.isArray(history) && history.length > 0) {
					const mapped: Msg[] = history.map(h => ({ from: h.role === 'assistant' ? 'ai' : 'user', text: h.content }))
					setMessages(mapped)
				}
			} catch {}
		})()
	}, [])

	const handleSend = async () => {
		const q = input.trim()
		if (!q || loading) return
		setMessages(prev => [...prev, { from: 'user', text: q }])
		setInput('')
		setLoading(true)
		try {
			const res = await sendChatMessage(q)
			const reply: string = res.reply || res.text || 'Sem resposta.'
			await typeOut(reply)
		} catch (e) {
			setMessages(prev => [...prev, { from: 'ai', text: 'Ocorreu um erro. Tente novamente em instantes.' }])
		} finally {
			setLoading(false)
		}
	}

	const typeOut = async (full: string) => {
		const chunks = full.split('')
		let acc = ''
		setMessages(prev => [...prev, { from: 'ai', text: '' }])
		for (const c of chunks) {
			acc += c
			await new Promise(r => setTimeout(r, 8))
			setMessages(prev => {
				const cloned = [...prev]
				cloned[cloned.length - 1] = { from: 'ai', text: acc }
				return cloned
			})
		}
	}

	const clearChat = () => {
		setMessages([
			{ from: 'ai', text: 'Nova simulação iniciada. Qual cenário você quer testar?' },
		])
	}

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Textarea
					placeholder="Ex.: Se os pedidos aumentarem 10% no próximo mês, qual o impacto na frota?"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className="min-h-24"
				/>
			</div>
			<div className="flex gap-2 items-center">
				<Button onClick={handleSend} disabled={loading}>Enviar</Button>
				<Button variant="outline" onClick={clearChat}>Novo Chat</Button>
				{loading && <span className="text-sm text-muted-foreground">IA está pensando...</span>}
			</div>

			<div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
				{messages.map((m, idx) => (
					<div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
						<div className={`${m.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} px-3 py-2 rounded-xl max-w-[80%] whitespace-pre-wrap`}>
							{m.text}
						</div>
					</div>
				))}
				<div ref={endRef} />
			</div>
		</div>
	)
}


