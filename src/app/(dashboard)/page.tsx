import { createServerClient } from '@/lib/supabase/server'
import MorningBriefing from '@/components/morning-briefing/MorningBriefing'
import DashboardKPIs from '@/components/dashboard/DashboardKPIs'
import type { ContentItem } from '@/types'

export default async function HomePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const uid = user!.id
  const today = new Date().toISOString().split('T')[0]

  const [
    { data: focus },
    { data: tasks },
    { data: projects },
    { data: pipeline },
    { data: contacts },
  ] = await Promise.all([
    supabase.from('daily_focus').select('*').eq('user_id', uid).eq('date', today).maybeSingle(),
    supabase.from('tasks').select('status').eq('user_id', uid),
    supabase.from('projects').select('status').eq('user_id', uid),
    supabase.from('content_pipeline').select('*').eq('user_id', uid),
    supabase.from('contacts').select('type, monthly_value, stage').eq('user_id', uid),
  ])

  const kpis = {
    tasksPending:      (tasks ?? []).filter(t => t.status !== 'done').length,
    tasksDone:         (tasks ?? []).filter(t => t.status === 'done').length,
    projectsActive:    (projects ?? []).filter(p => p.status === 'active').length,
    pipelineTotal:     (pipeline ?? []).length,
    pipelinePublished: (pipeline ?? []).filter(p => p.stage === 'published').length,
    pipelineReady:     (pipeline ?? []).filter(p => p.stage === 'scripting').length,
    leads:             (contacts ?? []).filter(c => c.type === 'lead').length,
    clients:           (contacts ?? []).filter(c => c.type === 'client').length,
    mrr:               (contacts ?? [])
                         .filter(c => c.type === 'client' && c.monthly_value)
                         .reduce((sum, c) => sum + (c.monthly_value ?? 0), 0),
  }

  const todayContent = ((pipeline ?? []) as ContentItem[])
    .filter(p => p.publish_date?.startsWith(today))

  return (
    <div className="space-y-8">
      <DashboardKPIs kpis={kpis} />
      <MorningBriefing initialFocus={focus} userId={uid} todayContent={todayContent} />
    </div>
  )
}
