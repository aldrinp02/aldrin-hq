import { createServerClient } from '@/lib/supabase/server'

const BASE = 'https://graph.facebook.com/v19.0'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const token = process.env.META_INSTAGRAM_TOKEN
  if (!token) return Response.json({ error: 'No token' }, { status: 500 })

  const [meRes, pagesRes] = await Promise.all([
    fetch(`${BASE}/me?fields=id,name&access_token=${token}`),
    fetch(`${BASE}/me/accounts?fields=id,name,instagram_business_account&access_token=${token}`),
  ])

  const me    = await meRes.json()
  const pages = await pagesRes.json()

  return Response.json({ me, pages })
}
