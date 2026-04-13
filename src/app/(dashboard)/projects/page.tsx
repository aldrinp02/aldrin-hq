'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, Badge, Skeleton, ErrorState, EmptyState } from '@/components/ui'
import type { Project } from '@/types'

const PRIORITY_VARIANT = { high: 'gold', medium: 'warning', low: 'muted' } as const
const STATUS_VARIANT = { active: 'success', paused: 'warning', completed: 'muted', archived: 'muted' } as const

function ProjectForm({ initial, onSave, onCancel }: {
  initial?: Partial<Project>
  onSave: (data: Partial<Project>) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    color: initial?.color ?? '#FEC300',
    priority: initial?.priority ?? 'medium',
    status: initial?.status ?? 'active',
    progress: initial?.progress ?? 0,
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-6 space-y-4 mb-6">
      <h3 className="text-sm text-[#898B8F] uppercase tracking-wider">{initial?.id ? 'Editar' : 'Nuevo'} Proyecto</h3>
      <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="Nombre del proyecto"
        className="w-full bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]" />
      <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Descripción (opcional)"
        className="w-full bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]" />
      <div className="flex gap-3">
        <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value as Project['priority']}))}
          className="bg-black border border-[#2a2a35] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FEC300]">
          <option value="high">Alta prioridad</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value as Project['status']}))}
          className="bg-black border border-[#2a2a35] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FEC300]">
          <option value="active">Activo</option>
          <option value="paused">Pausado</option>
          <option value="completed">Completado</option>
        </select>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-[#898B8F]">Progreso</span>
          <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({...f, progress: Number(e.target.value)}))} className="flex-1 accent-[#FEC300]" />
          <span className="font-mono text-sm text-[#FEC300] w-8">{form.progress}%</span>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-[#FEC300] hover:bg-[#e6b000] disabled:opacity-50 text-black font-semibold px-5 py-2.5 rounded-lg text-sm">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel} className="text-[#898B8F] hover:text-white px-4 py-2.5 rounded-lg text-sm border border-[#1a1a1f]">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/projects')
    if (res.ok) setProjects(await res.json())
    else setError('Error cargando proyectos')
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(data: Partial<Project>) {
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) { await load(); setShowForm(false) }
  }

  async function handleUpdate(data: Partial<Project>) {
    if (!editing) return
    const res = await fetch(`/api/projects/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) { await load(); setEditing(null) }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este proyecto?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects(p => p.filter(x => x.id !== id))
  }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div>
      <PageHeader title="Proyectos" description={`${projects.filter(p => p.status === 'active').length} activos`}
        action={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#FEC300] hover:bg-[#e6b000] text-black font-semibold px-4 py-2.5 rounded-lg text-sm"><Plus size={16} />Nuevo</button>} />

      {showForm && <ProjectForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}
      {editing && <ProjectForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />}

      {projects.length === 0 ? <EmptyState title="Sin proyectos" description="Crea tu primer proyecto" /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map(p => (
            <div key={p.id} className="bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-5 hover:border-[#2a2a35] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <h3 className="font-semibold text-white">{p.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(p)} className="p-1.5 text-[#898B8F] hover:text-white rounded"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-[#898B8F] hover:text-red-400 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
              {p.description && <p className="text-[#898B8F] text-sm mb-3">{p.description}</p>}
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
                <Badge variant={PRIORITY_VARIANT[p.priority]}>{p.priority}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[#1a1a1f] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-[#FEC300] transition-all" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="font-mono text-xs text-[#FEC300]">{p.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
