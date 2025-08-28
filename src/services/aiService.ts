import { getSupabaseClient } from '@/lib/supabaseClient'

export async function postAuth(path: string, body?: any) {
  const supabase = getSupabaseClient()
  const token = (await supabase.auth.getSession()).data.session?.access_token
  const base = process.env.NEXT_PUBLIC_API_URL || ''
  const res = await fetch(`${base}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


