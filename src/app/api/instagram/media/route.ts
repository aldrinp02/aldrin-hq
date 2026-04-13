import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const BASE = 'https://graph.facebook.com/v19.0'

async function getIGAccountId(token: string): Promise<string | null> {
  // Step 1: get Pages managed by user
  const pagesRes = await fetch(`${BASE}/me/accounts?access_token=${token}`)
  const pages = await pagesRes.json()
  if (!pages.data?.length) return null

  // Step 2: get IG Business Account linked to first Page
  const pageId = pages.data[0].id
  const igRes = await fetch(`${BASE}/${pageId}?fields=instagram_business_account&access_token=${token}`)
  const igData = await igRes.json()
  return igData.instagram_business_account?.id ?? null
}

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const token = process.env.META_INSTAGRAM_TOKEN
  if (!token) return Response.json({ error: 'META_INSTAGRAM_TOKEN not configured' }, { status: 500 })

  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') ?? '20'

  const igId = await getIGAccountId(token)
  if (!igId) return Response.json({ error: 'No Instagram Business account found' }, { status: 404 })

  const fields = [
    'id', 'caption', 'media_type', 'timestamp',
    'permalink', 'thumbnail_url', 'media_url',
    'like_count', 'comments_count',
    'insights.metric(impressions,reach,saved,plays,shares,total_interactions)',
  ].join(',')

  const mediaRes = await fetch(
    `${BASE}/${igId}/media?fields=${fields}&limit=${limit}&access_token=${token}`,
    { next: { revalidate: 300 } }
  )
  const mediaData = await mediaRes.json()

  if (!mediaRes.ok || mediaData.error) {
    return Response.json({ error: mediaData.error?.message ?? 'Instagram API error' }, { status: 502 })
  }

  // Also fetch account-level info (followers, profile)
  const accountRes = await fetch(
    `${BASE}/${igId}?fields=username,followers_count,media_count&access_token=${token}`,
    { next: { revalidate: 300 } }
  )
  const accountData = await accountRes.json()

  return Response.json({
    account: accountData,
    media: mediaData.data ?? [],
  })
}
