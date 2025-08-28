export async function apiFetch(path: string, init?: RequestInit) {
	const token = typeof window !== 'undefined' ? localStorage.getItem('pegasus_token') : null
	const headers = new Headers(init?.headers || {})
	if (token) headers.set('Authorization', `Bearer ${token}`)
	headers.set('cache-control', 'no-store')
	return fetch(`/api/backend/${path.replace(/^\//, '')}`, { ...init, headers })
}


