import { createServerClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  category: z.enum(['sacred', 'work', 'personal', 'content']).nullable().optional(),
  due_date: z.string().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 })

  const { data, error } = await supabase
    .from('tasks')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
