import { NextRequest } from 'next/server'

const BACKEND = process.env.PEGASUS_BACKEND_URL

async function proxy(req: NextRequest, params: { path: string[] }) {
	if (!BACKEND) {
		return new Response(JSON.stringify({ error: 'PEGASUS_BACKEND_URL não configurada' }), { status: 500 })
	}
	const urlPath = params.path.join('/')
	const targetUrl = `${BACKEND}/api/${urlPath}`
	const headers = new Headers(req.headers)
	// Evita problemas de caching em chamadas API
	headers.set('cache-control', 'no-store')
	headers.delete('host')

	const init: RequestInit = {
		method: req.method,
		headers,
		body: req.body ? req.body : undefined,
		// @ts-ignore: next specific
		duplex: 'half'
	}

	const res = await fetch(targetUrl, init)
	const body = await res.arrayBuffer()
	return new Response(body, {
		status: res.status,
		headers: res.headers,
	})
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
	return proxy(req, params)
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
	return proxy(req, params)
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
	return proxy(req, params)
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
	return proxy(req, params)
}


