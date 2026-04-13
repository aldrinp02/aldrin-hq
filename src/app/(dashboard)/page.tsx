import { createServerClient } from '@/lib/supabase/server'
import MorningBriefing from '@/components/morning-briefing/MorningBriefing'

export default async function HomePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]
  const { data: focus } = await supabase
    .from('daily_focus')
    .select('*')
    .eq('user_id', user!.id)
    .eq('date', today)
    .maybeSingle()

  return <MorningBriefing initialFocus={focus} userId={user!.id} />
}
