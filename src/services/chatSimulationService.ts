import { getSupabaseClient } from '@/lib/supabaseClient'

// Passa a usar proxy local do Next.js para evitar CORS e 502
const proxyBase = '/api/pegai'

export type ChatMessage = {
	role: 'user' | 'assistant'
	content: string
	timestamp?: string
}

export async function sendMessage(message: string): Promise<any> {
	const supabase = getSupabaseClient()
	const token = (await supabase.auth.getSession()).data.session?.access_token
	const url = `${proxyBase}/simulation`
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify({ message }),
	})
	if (!res.ok) throw new Error(await res.text())
	return res.json()
}

export async function getHistory(): Promise<ChatMessage[]> {
	const supabase = getSupabaseClient()
	const token = (await supabase.auth.getSession()).data.session?.access_token
	const url = `${proxyBase}/history`
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	})
	if (!res.ok) throw new Error(await res.text())
	return res.json()
}


