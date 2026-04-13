'use client'

import { useEffect, useState } from 'react'
import { Plus, X, GripVertical, Trash2, Calendar, FileText } from 'lucide-react'
import { PageHeader, Skeleton, ErrorState } from '@/components/ui'
import type { ContentItem, ContentStage, Platform, ContentFormat } from '@/types'

const STAGES: { key: ContentStage; label: string; color: string }[] = [
  { key: 'idea',      label: 'Idea',       color: '#555560' },
  { key: 'scripting', label: 'Guión',      color: '#3b82f6' },
  { key: 'recording', label: 'Grabación',  color: '#f59e0b' },
  { key: 'editing',   label: 'Edición',    color: '#a855f7' },
  { key: 'scheduled', label: 'Programado', color: '#FEC300' },
  { key: 'published', label: 'Publicado',  color: '#22c55e' },
]

const PILAR_COLORS: Record<string, string> = {
  'El Sistema':              'bg-blue-500/10 text-blue-400',
  'Táctico & Ads':           'bg-[#FEC300]/10 text-[#FEC300]',
  'Prueba & Transformación': 'bg-green-500/10 text-green-400',
  'Emprendedor Real':        'bg-pink-500/10 text-pink-400',
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C', tiktok: '#69C9D0', youtube: '#FF0000',
  twitter: '#1DA1F2', linkedin: '#0A66C2',
}

function extractMeta(script: string | null): { pilar: string; cta: string; hook: string } {
  if (!script) return { pilar: '', cta: '', hook: '' }
  const pilarMatch = script.match(/Pilar:\s*([^|\n]+)/)
  const ctaMatch   = script.match(/CTA:\s*([^|\n]+)/)
  const hookMatch  = script.match(/Hook:\s*(.+)/)
  return {
    pilar: pilarMatch ? pilarMatch[1].trim() : '',
    cta:   ctaMatch   ? ctaMatch[1].trim()   : '',
    hook:  hookMatch  ? hookMatch[1].trim()  : '',
  }
}

function DetailPanel({ item, onClose, onSave, onDelete }: {
  item: ContentItem
  onClose: () => void
  onSave: (updated: ContentItem) => void
  onDelete: (id: string) => void
}) {
  const [form, setForm] = useState({ ...item })
  const [saving, setSaving] = useState(false)
  const meta = extractMeta(form.script)

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/pipeline/${form.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        platform: form.platform,
        format: form.format,
        stage: form.stage,
        script: form.script,
        publish_date: form.publish_date || null,
      }),
    })
    if (res.ok) onSave(form)
    setSaving(false)
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a1f] shrink-0">
        <div className="flex items-center gap-2 text-[#555560]">
          <FileText size={13} />
          <span className="text-xs uppercase tracking-wider">Contenido</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { if (confirm('¿Eliminar?')) onDelete(item.id) }}
            className="p-1.5 text-[#555560] hover:text-red-400 transition-colors rounded"
          >
            <Trash2 size={13} />
          </button>
          <button onClick={onClose} className="p-1.5 text-[#555560] hover:text-white transition-colors rounded">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Title */}
        <textarea
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          rows={2}
          className="w-full bg-transparent text-white text-base font-semibold resize-none focus:outline-none placeholder-[#555560] leading-snug"
          placeholder="Título del contenido"
        />

        {/* Stage pills */}
        <div>
          <p className="text-[10px] text-[#555560] uppercase tracking-wider mb-2">Etapa</p>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map(s => (
              <button
                key={s.key}
                onClick={() => setForm(f => ({ ...f, stage: s.key }))}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all"
                style={form.stage === s.key
                  ? { background: s.color + '22', borderColor: s.color, color: s.color }
                  : { background: 'transparent', borderColor: '#2a2a35', color: '#555560' }
                }
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: form.stage === s.key ? s.color : '#555560' }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Platform / Format */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-[#555560] uppercase tracking-wider mb-1.5">Plataforma</p>
            <select
              value={form.platform}
              onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}
              className="w-full bg-black border border-[#2a2a35] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FEC300]"
            >
              {['instagram','tiktok','youtube','twitter','linkedin'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] text-[#555560] uppercase tracking-wider mb-1.5">Formato</p>
            <select
              value={form.format}
              onChange={e => setForm(f => ({ ...f, format: e.target.value as ContentFormat }))}
              className="w-full bg-black border border-[#2a2a35] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FEC300]"
            >
              {['reel','post','story','video','thread'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Publish date */}
        <div>
          <p className="text-[10px] text-[#555560] uppercase tracking-wider mb-1.5">Fecha de publicación</p>
          <div className="relative">
            <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555560]" />
            <input
              type="date"
              value={form.publish_date ?? ''}
              onChange={e => setForm(f => ({ ...f, publish_date: e.target.value || null }))}
              className="w-full bg-black border border-[#2a2a35] rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:border-[#FEC300]"
            />
          </div>
        </div>

        {/* Pilar / CTA badges */}
        {(meta.pilar || meta.cta) && (
          <div className="flex flex-wrap gap-2">
            {meta.pilar && (
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${PILAR_COLORS[meta.pilar] ?? 'bg-white/5 text-[#898B8F]'}`}>
                {meta.pilar}
              </span>
            )}
            {meta.cta && (
              <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-white/5 text-[#898B8F] border border-[#1a1a1f]">
                CTA: {meta.cta}
              </span>
            )}
          </div>
        )}

        <div className="border-t border-[#1a1a1f]" />

        {/* Guión */}
        <div>
          <p className="text-[10px] text-[#555560] uppercase tracking-wider mb-2">Guión completo</p>
          <textarea
            value={form.script ?? ''}
            onChange={e => setForm(f => ({ ...f, script: e.target.value }))}
            rows={22}
            placeholder="Escribe aquí el guión completo..."
            className="w-full bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-[#c9c9cc] text-sm focus:outline-none focus:border-[#FEC300] resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-[#1a1a1f] shrink-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#FEC300] hover:bg-[#e6b000] disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)
  const [newForm, setNewForm] = useState({
    title: '', platform: 'instagram', format: 'reel', stage: 'idea' as ContentStage, script: '',
  })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/pipeline')
    if (res.ok) setItems(await res.json())
    else setError('Error cargando pipeline')
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newForm, script: newForm.script || null }),
    })
    if (res.ok) {
      const created = await res.json()
      setItems(prev => [...prev, created])
      setNewForm({ title: '', platform: 'instagram', format: 'reel', stage: 'idea', script: '' })
      setShowNewForm(false)
    }
  }

  async function moveToStage(id: string, stage: ContentStage) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, stage } : i))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, stage } : null)
    await fetch(`/api/pipeline/${id}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    })
  }

  async function handleDelete(id: string) {
    await fetch(`/api/pipeline/${id}`, { method: 'DELETE' })
    setItems(i => i.filter(x => x.id !== id))
    setSelected(null)
  }

  function handleSave(updated: ContentItem) {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    setSelected(updated)
  }

  function handleDrop(e: React.DragEvent, targetStage: ContentStage) {
    e.preventDefault()
    if (dragging) moveToStage(dragging, targetStage)
    setDragging(null)
  }

  if (loading) return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="shrink-0 w-48 h-64 bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl animate-pulse" />
      ))}
    </div>
  )
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 md:-m-8 overflow-hidden">

      {/* Kanban */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-3 shrink-0">
          <PageHeader
            title="Pipeline de Contenido"
            description={`${items.length} piezas`}
            action={
              <button onClick={() => setShowNewForm(v => !v)} className="flex items-center gap-2 bg-[#FEC300] hover:bg-[#e6b000] text-black font-semibold px-4 py-2.5 rounded-lg text-sm">
                <Plus size={16} />Nueva pieza
              </button>
            }
          />
          {showNewForm && (
            <form onSubmit={handleCreate} className="bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-4 mt-3 flex flex-wrap gap-2 items-end">
              <input
                value={newForm.title}
                onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="Título del contenido"
                className="bg-black border border-[#2a2a35] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FEC300] flex-1 min-w-48"
              />
              {(['platform','format','stage'] as const).map(field => (
                <select key={field} value={(newForm as any)[field]} onChange={e => setNewForm(f => ({ ...f, [field]: e.target.value }))}
                  className="bg-black border border-[#2a2a35] rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                  {field === 'platform' && ['instagram','tiktok','youtube','twitter','linkedin'].map(v => <option key={v} value={v}>{v}</option>)}
                  {field === 'format'   && ['reel','post','story','video','thread'].map(v => <option key={v} value={v}>{v}</option>)}
                  {field === 'stage'    && STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              ))}
              <button type="submit" className="bg-[#FEC300] hover:bg-[#e6b000] text-black font-semibold px-4 py-2 rounded-lg text-sm">Crear</button>
              <button type="button" onClick={() => setShowNewForm(false)} className="text-[#898B8F] hover:text-white px-3 py-2 rounded-lg text-sm border border-[#1a1a1f]">✕</button>
            </form>
          )}
        </div>

        <div className="flex-1 overflow-x-auto px-6 md:px-8 pb-6">
          <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
            {STAGES.map(({ key, label, color }) => {
              const stageItems = items.filter(i => i.stage === key)
              return (
                <div key={key} className="flex flex-col w-52 shrink-0"
                  onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, key)}>
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <h3 className="text-xs text-[#898B8F] font-semibold uppercase tracking-wider">{label}</h3>
                    </div>
                    <span className="font-mono text-xs text-[#555560]">{stageItems.length}</span>
                  </div>
                  <div className="flex-1 space-y-2 min-h-[80px]">
                    {stageItems.length === 0 && (
                      <div className="h-16 border border-dashed border-[#1a1a1f] rounded-lg" />
                    )}
                    {stageItems.map(item => {
                      const meta = extractMeta(item.script)
                      const isSelected = selected?.id === item.id
                      return (
                        <div key={item.id}
                          draggable
                          onDragStart={() => setDragging(item.id)}
                          onDragEnd={() => setDragging(null)}
                          onClick={() => setSelected(isSelected ? null : item)}
                          className={`bg-[#0d0d0f] border rounded-lg p-3 cursor-pointer hover:border-[#2a2a35] transition-all ${
                            isSelected ? 'border-[#FEC300]/60' : 'border-[#1a1a1f]'
                          } ${dragging === item.id ? 'opacity-40' : ''}`}
                        >
                          <div className="flex items-start gap-1.5 mb-2">
                            <GripVertical size={11} className="text-[#555560] mt-0.5 shrink-0" />
                            <p className="text-white text-xs font-medium leading-snug">{item.title}</p>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-medium" style={{ color: PLATFORM_COLORS[item.platform] }}>
                              {item.platform}
                            </span>
                            {meta.pilar && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium truncate max-w-[80px] ${PILAR_COLORS[meta.pilar] ?? 'bg-white/5 text-[#898B8F]'}`}>
                                {meta.pilar.split(' ')[0]}
                              </span>
                            )}
                          </div>
                          {meta.hook && (
                            <p className="text-[#555560] text-[10px] leading-snug mt-1.5 line-clamp-2">{meta.hook}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-[400px] shrink-0 border-l border-[#1a1a1f] h-full overflow-hidden">
          <DetailPanel
            item={selected}
            onClose={() => setSelected(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  )
}
