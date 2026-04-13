import { createServerClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

const CreateSchema = z.object({
  title: z.string().min(1),
  notes: z.string().nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  category: z.enum(['sacred', 'work', 'personal', 'content']).nullable().optional(),
  due_date: z.string().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const project_id = searchParams.get('project_id')

  let query = supabase.from('tasks').select('*, projects(name, color)').eq('user_id', user.id)

  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)
  if (project_id) query = query.eq('project_id', project_id)

  const { data, error } = await query.order('created_at', { ascending: false })
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
    .from('tasks')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
