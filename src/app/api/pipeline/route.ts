import { createServerClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

const CreateSchema = z.object({
  title: z.string().min(1),
  platform: z.enum(['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin']),
  format: z.enum(['reel', 'post', 'story', 'video', 'thread']),
  stage: z.enum(['idea', 'scripting', 'recording', 'editing', 'scheduled', 'published']).default('idea'),
  script: z.string().nullable().optional(),
  publish_date: z.string().nullable().optional(),
  order_index: z.number().default(0),
})

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('content_pipeline')
    .select('*')
    .eq('user_id', user.id)
    .order('stage')
    .order('order_index')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 })

  const { data, error } = await supabase
    .from('content_pipeline')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
