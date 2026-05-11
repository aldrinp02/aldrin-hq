import { createServerClient } from '@/lib/supabase/server'
import MorningBriefing from '@/components/morning-briefing/MorningBriefing'
import type { ContentItem } from '@/types'

export default async function BriefingPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const uid = user!.id
  const today = new Date().toISOString().split('T')[0]

  const [{ data: focus }, { data: pipeline }] = await Promise.all([
    supabase.from('daily_focus').select('*').eq('user_id', uid).eq('date', today).maybeSingle(),
    supabase.from('content_pipeline').select('*').eq('user_id', uid),
  ])

  const todayContent = ((pipeline ?? []) as ContentItem[]).filter(p =>
    p.publish_date?.startsWith(today)
  )

  return <MorningBriefing initialFocus={focus} userId={uid} todayContent={todayContent} />
}
