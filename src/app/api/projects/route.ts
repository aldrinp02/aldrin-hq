import { createServerClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

const CreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).default('active'),
  color: z.string().default('#FEC300'),
  progress: z.number().min(0).max(100).default(0),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
})

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
    .from('projects')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
