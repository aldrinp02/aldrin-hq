'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { ContentItem, ContentStage, Platform, ContentFormat } from '@/types'

const STAGE_COLORS: Record<ContentStage, string> = {
  idea:       'bg-[#2a2a35] text-[#898B8F]',
  scripting:  'bg-blue-500/15 text-blue-400',
  recording:  'bg-orange-500/15 text-orange-400',
  editing:    'bg-purple-500/15 text-purple-400',
  scheduled:  'bg-[#FEC300]/15 text-[#FEC300]',
  published:  'bg-green-500/15 text-green-400',
}

const STAGE_LABELS: Record<ContentStage, string> = {
  idea:      'Idea',
  scripting: 'Guión',
  recording: 'Grabar',
  editing:   'Editar',
  scheduled: 'Programado',
  published: 'Publicado',
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const PILARES = ['El Sistema', 'Táctico & Ads', 'Prueba & Transformación', 'Emprendedor Real']
const ANGULOS = ['A1 Accionable', 'A2 Aspiracional', 'A3 Analítico', 'A4 Antropológico']

const PLATFORM_ABBR: Record<Platform, string> = {
  instagram: 'IG',
  tiktok:    'TT',
  youtube:   'YT',
  twitter:   'TW',
  linkedin:  'LI',
}

function PlatformIcon({ platform }: { platform: Platform }) {
  return <span className="text-[9px] font-mono font-bold">{PLATFORM_ABBR[platform]}</span>
}

function extractMeta(script: string | null) {
  if (!script) return { pilar: '', cta: '', hook: '' }
  const pilar = script.match(/Pilar:\s*([^|\n]+)/)?.[1]?.trim() ?? ''
  const cta   = script.match(/CTA:\s*([^|\n]+)/)?.[1]?.trim() ?? ''
  const hook  = script.match(/Hook:\s*([^\n]+)/)?.[1]?.trim() ?? ''
  return { pilar, cta, hook }
}

// ── Detail Panel (same as Pipeline) ─────────────────────────────────────────

interface DetailPanelProps {
  item: ContentItem
  onClose: () => void
  onSave: (updated: ContentItem) => void
  onDelete: (id: string) => void
}

function DetailPanel({ item, onClose, onSave, onDelete }: DetailPanelProps) {
  const supabase = createClient()
  const [form, setForm] = useState<ContentItem>(item)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiPilar, setAiPilar] = useState(extractMeta(item.script).pilar || PILARES[1])
  const [aiAngulo, setAiAngulo] = useState(ANGULOS[0])

  const STAGES: ContentStage[] = ['idea','scripting','recording','editing','scheduled','published']
  const PLATFORMS: Platform[] = ['instagram','tiktok','youtube','twitter','linkedin']
  const FORMATS: ContentFormat[] = ['reel','post','story','video','thread']

  async function handleSave() {
    setSaving(true)
    const { data, error } = await supabase
      .from('content_pipeline')
      .update({
        title: form.title,
        platform: form.platform,
        format: form.format,
        stage: form.stage,
        script: form.script,
        publish_date: form.publish_date,
      })
      .eq('id', form.id)
      .select()
      .single()
    setSaving(false)
    if (!error && data) onSave(data as ContentItem)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este contenido?')) return
    setDeleting(true)
    await supabase.from('content_pipeline').delete().eq('id', form.id)
    setDeleting(false)
    onDelete(form.id)
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, pilar: aiPilar, angle: aiAngulo }),
      })
      const { script } = await res.json()
      setForm(f => ({ ...f, script }))
    } finally {
      setGenerating(false)
    }
  }

  const meta = extractMeta(form.script)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0d0d0f] border-l border-[#1a1a1f] flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d0f] border-b border-[#1a1a1f] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-xs text-[#555560]">
            <PlatformIcon platform={form.platform} />
            <span className="uppercase">{form.platform}</span>
            <span>·</span>
            <span className="uppercase">{form.format}</span>
          </div>
          <button onClick={onClose} className="text-[#555560] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Title */}
          <div>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-transparent text-xl font-semibold text-white outline-none border-b border-transparent focus:border-[#2a2a35] pb-1 transition-colors"
              placeholder="Título del contenido"
            />
          </div>

          {/* Stage pills */}
          <div>
            <p className="text-xs text-[#555560] uppercase tracking-wider mb-2">Etapa</p>
            <div className="flex flex-wrap gap-2">
              {(['idea','scripting','recording','editing','scheduled','published'] as ContentStage[]).map(s => (
                <button
                  key={s}
                  onClick={() => setForm(f => ({ ...f, stage: s }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    form.stage === s ? STAGE_COLORS[s] + ' ring-1 ring-current' : 'bg-[#1a1a1f] text-[#555560] hover:text-white'
                  }`}
                >
                  {STAGE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Platform + Format + Date */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-[#555560] uppercase tracking-wider mb-1">Plataforma</p>
              <select
                value={form.platform}
                onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}
                className="w-full bg-[#0d0d0f] border border-[#1a1a1f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2a2a35]"
              >
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-[#555560] uppercase tracking-wider mb-1">Formato</p>
              <select
                value={form.format}
                onChange={e => setForm(f => ({ ...f, format: e.target.value as ContentFormat }))}
                className="w-full bg-[#0d0d0f] border border-[#1a1a1f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2a2a35]"
              >
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-[#555560] uppercase tracking-wider mb-1">Fecha</p>
              <input
                type="date"
                value={form.publish_date ?? ''}
                onChange={e => setForm(f => ({ ...f, publish_date: e.target.value || null }))}
                className="w-full bg-[#0d0d0f] border border-[#1a1a1f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2a2a35]"
              />
            </div>
          </div>

          {/* Meta extracted */}
          {(meta.pilar || meta.hook) && (
            <div className="bg-[#0a0a0c] border border-[#1a1a1f] rounded-xl p-4 space-y-2">
              {meta.pilar && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#555560] uppercase tracking-wider">Pilar</span>
                  <span className="text-[#FEC300]">{meta.pilar}</span>
                </div>
              )}
              {meta.cta && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#555560] uppercase tracking-wider">CTA</span>
                  <span className="text-white">{meta.cta}</span>
                </div>
              )}
              {meta.hook && (
                <div className="flex items-start gap-2 text-xs">
                  <span className="text-[#555560] uppercase tracking-wider shrink-0">Hook</span>
                  <span className="text-[#898B8F]">{meta.hook}</span>
                </div>
              )}
            </div>
          )}

          {/* AI generate */}
          <div className="border border-[#1a1a1f] rounded-xl p-4 space-y-3">
            <p className="text-xs text-[#555560] uppercase tracking-wider">Generar guión con IA</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#555560] mb-1">Pilar</p>
                <select
                  value={aiPilar}
                  onChange={e => setAiPilar(e.target.value)}
                  className="w-full bg-[#0d0d0f] border border-[#1a1a1f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2a2a35]"
                >
                  {PILARES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-[#555560] mb-1">Ángulo</p>
                <select
                  value={aiAngulo}
                  onChange={e => setAiAngulo(e.target.value)}
                  className="w-full bg-[#0d0d0f] border border-[#1a1a1f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2a2a35]"
                >
                  {ANGULOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2 rounded-lg bg-[#FEC300]/10 text-[#FEC300] text-sm font-medium hover:bg-[#FEC300]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generando...' : '✦ Generar guión'}
            </button>
          </div>

          {/* Script */}
          <div>
            <p className="text-xs text-[#555560] uppercase tracking-wider mb-2">Guión</p>
            <textarea
              value={form.script ?? ''}
              onChange={e => setForm(f => ({ ...f, script: e.target.value || null }))}
              rows={20}
              className="w-full bg-[#0a0a0c] border border-[#1a1a1f] rounded-xl px-4 py-3 text-sm text-[#898B8F] font-mono leading-relaxed focus:outline-none focus:border-[#2a2a35] resize-none"
              placeholder="El guión aparecerá aquí..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0d0d0f] border-t border-[#1a1a1f] px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-[#555560] hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-[#FEC300] text-black text-sm font-semibold rounded-lg hover:bg-[#FEC300]/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Calendar Page ────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const supabase = createClient()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed
  const [items, setItems] = useState<ContentItem[]>([])
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('content_pipeline')
      .select('*')
      .not('publish_date', 'is', null)
      .order('publish_date', { ascending: true })
    setItems((data as ContentItem[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchItems() }, [fetchItems])

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  // Group items by date string (YYYY-MM-DD)
  const byDate: Record<string, ContentItem[]> = {}
  for (const item of items) {
    if (!item.publish_date) continue
    const d = item.publish_date.split('T')[0]
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(item)
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const todayStr = today.toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendario</h1>
          <p className="text-sm text-[#555560] mt-0.5">Contenido programado por fecha</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#1a1a1f] text-[#898B8F] hover:text-white hover:border-[#2a2a35] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-white font-semibold min-w-[160px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#1a1a1f] text-[#898B8F] hover:text-white hover:border-[#2a2a35] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}
            className="px-3 py-1.5 text-xs border border-[#1a1a1f] rounded-lg text-[#898B8F] hover:text-white hover:border-[#2a2a35] transition-colors"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="border border-[#1a1a1f] rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#1a1a1f]">
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-xs text-[#555560] uppercase tracking-wider font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        {loading ? (
          <div className="h-96 flex items-center justify-center text-[#555560] text-sm">
            Cargando...
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - firstDay + 1
              const isValid = dayNum >= 1 && dayNum <= daysInMonth
              const mm = String(month + 1).padStart(2, '0')
              const dd = String(dayNum).padStart(2, '0')
              const dateStr = `${year}-${mm}-${dd}`
              const isToday = isValid && dateStr === todayStr
              const cellItems = isValid ? (byDate[dateStr] ?? []) : []
              const isLastRow = i >= totalCells - 7

              return (
                <div
                  key={i}
                  className={`min-h-[120px] p-2 border-b border-r border-[#1a1a1f] ${
                    isLastRow ? 'border-b-0' : ''
                  } ${(i + 1) % 7 === 0 ? 'border-r-0' : ''} ${
                    !isValid ? 'bg-[#08080a]' : ''
                  }`}
                >
                  {isValid && (
                    <>
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 ${
                        isToday ? 'bg-[#FEC300] text-black font-bold' : 'text-[#555560]'
                      }`}>
                        {dayNum}
                      </div>
                      <div className="space-y-1">
                        {cellItems.slice(0, 3).map(item => (
                          <button
                            key={item.id}
                            onClick={() => setSelected(item)}
                            className="w-full text-left"
                          >
                            <div className={`px-2 py-1 rounded text-[10px] leading-tight truncate font-medium ${STAGE_COLORS[item.stage]} hover:opacity-80 transition-opacity`}>
                              <div className="flex items-center gap-1">
                                <PlatformIcon platform={item.platform} />
                                <span className="truncate">{item.title}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                        {cellItems.length > 3 && (
                          <p className="text-[10px] text-[#555560] px-1">
                            +{cellItems.length - 3} más
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {(Object.entries(STAGE_LABELS) as [ContentStage, string][]).map(([stage, label]) => (
          <div key={stage} className="flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${STAGE_COLORS[stage].split(' ')[0]}`} />
            <span className="text-xs text-[#555560]">{label}</span>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          item={selected}
          onClose={() => setSelected(null)}
          onSave={updated => {
            setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
            setSelected(updated)
          }}
          onDelete={id => {
            setItems(prev => prev.filter(i => i.id !== id))
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}
