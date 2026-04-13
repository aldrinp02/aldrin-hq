'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Circle, CheckCircle2 } from 'lucide-react'
import { PageHeader, Badge, Skeleton, ErrorState, EmptyState } from '@/components/ui'
import type { Task } from '@/types'

const PRIORITY_VARIANT = { high: 'gold', medium: 'warning', low: 'muted' } as const
const STATUS_LABELS = { todo: 'Pendiente', in_progress: 'En progreso', done: 'Hecho' }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Task['status'] | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [form, setForm] = useState({ title: '', priority: 'medium' as Task['priority'], status: 'todo' as Task['status'], category: '' })

  async function load() {
    setLoading(true)
    const params = filter !== 'all' ? `?status=${filter}` : ''
    const res = await fetch(`/api/tasks${params}`)
    if (res.ok) setTasks(await res.json())
    else setError('Error cargando tareas')
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { ...form, category: form.category || null }
    if (editingTask) {
      const res = await fetch(`/api/tasks/${editingTask.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { await load(); setEditingTask(null) }
    } else {
      const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { await load(); setShowForm(false); setForm({ title: '', priority: 'medium', status: 'todo', category: '' }) }
    }
  }

  async function toggleDone(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    const res = await fetch(`/api/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
    if (res.ok) setTasks(t => t.map(x => x.id === task.id ? { ...x, status: newStatus } : x))
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta tarea?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks(t => t.filter(x => x.id !== id))
  }

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
  if (error) return <ErrorState message={error} onRetry={load} />

  const formEl = (
    <form onSubmit={handleSubmit} className="bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-5 mb-6 space-y-4">
      <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required placeholder="Título de la tarea"
        className="w-full bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]" />
      <div className="flex gap-3 flex-wrap">
        <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value as Task['priority']}))}
          className="bg-black border border-[#2a2a35] rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
          <option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option>
        </select>
        <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
          className="bg-black border border-[#2a2a35] rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
          <option value="">Categoría...</option><option value="sacred">Sagrada</option><option value="work">Trabajo</option>
          <option value="personal">Personal</option><option value="content">Contenido</option>
        </select>
        <button type="submit" className="bg-[#FEC300] hover:bg-[#e6b000] text-black font-semibold px-4 py-2 rounded-lg text-sm">Guardar</button>
        <button type="button" onClick={() => { setShowForm(false); setEditingTask(null) }} className="text-[#898B8F] hover:text-white px-3 py-2 rounded-lg text-sm border border-[#1a1a1f]">Cancelar</button>
      </div>
    </form>
  )

  return (
    <div>
      <PageHeader title="Tareas" description={`${tasks.filter(t => t.status !== 'done').length} pendientes`}
        action={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#FEC300] hover:bg-[#e6b000] text-black font-semibold px-4 py-2.5 rounded-lg text-sm"><Plus size={16} />Nueva</button>} />

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'todo', 'in_progress', 'done'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-[#FEC300] text-black' : 'bg-[#0d0d0f] text-[#898B8F] hover:text-white border border-[#1a1a1f]'}`}>
            {s === 'all' ? 'Todas' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {(showForm || editingTask) && formEl}

      {tasks.length === 0 ? <EmptyState title="Sin tareas" description="Crea tu primera tarea" /> : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className={`flex items-center gap-3 bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl px-4 py-3 hover:border-[#2a2a35] transition-colors ${task.status === 'done' ? 'opacity-50' : ''}`}>
              <button onClick={() => toggleDone(task)} className="shrink-0 text-[#898B8F] hover:text-[#FEC300]">
                {task.status === 'done' ? <CheckCircle2 size={18} className="text-green-400" /> : <Circle size={18} />}
              </button>
              <span className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-[#555560]' : 'text-white'}`}>{task.title}</span>
              <div className="flex items-center gap-2 shrink-0">
                {task.category && <Badge variant="muted">{task.category}</Badge>}
                <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
                <button onClick={() => { setEditingTask(task); setForm({ title: task.title, priority: task.priority, status: task.status, category: task.category ?? '' }) }} className="p-1 text-[#898B8F] hover:text-white"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(task.id)} className="p-1 text-[#898B8F] hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
