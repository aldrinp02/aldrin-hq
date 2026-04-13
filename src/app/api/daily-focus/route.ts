import { createServerClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

const UpsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  goal_1: z.string().nullable().optional(),
  goal_2: z.string().nullable().optional(),
  goal_3: z.string().nullable().optional(),
  theme: z.string().nullable().optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_focus')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .maybeSingle()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = UpsertSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 })

  const { data, error } = await supabase
    .from('daily_focus')
    .upsert({ ...parsed.data, user_id: user.id }, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
