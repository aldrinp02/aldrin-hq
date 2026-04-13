import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const AD_ACCOUNT_ID = 'act_266976331199070'
const BASE = 'https://graph.facebook.com/v19.0'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const token = process.env.META_ACCESS_TOKEN
  if (!token) return Response.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 })

  const { searchParams } = new URL(request.url)
  const preset = searchParams.get('preset') ?? 'this_month'

  const fields = [
    'spend', 'impressions', 'reach', 'clicks',
    'ctr', 'cpm', 'cpc', 'frequency',
    'actions', 'action_values', 'cost_per_action_type',
  ].join(',')

  const url = `${BASE}/${AD_ACCOUNT_ID}/insights?fields=${fields}&date_preset=${preset}&access_token=${token}`

  const res = await fetch(url, { next: { revalidate: 300 } })
  const json = await res.json()

  if (!res.ok || json.error) {
    return Response.json({ error: json.error?.message ?? 'Meta API error' }, { status: 502 })
  }

  return Response.json(json.data?.[0] ?? null)
}
