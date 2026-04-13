'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { DailyFocus, ContentItem, ContentStage } from '@/types'
import { Sun, Edit3, Check, X, Video, FileText, BookOpen } from 'lucide-react'

const DIAS  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatDate() {
  const d = new Date()
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

const STAGE_COLORS: Record<ContentStage, string> = {
  idea:      'bg-[#2a2a35] text-[#898B8F]',
  scripting: 'bg-blue-500/15 text-blue-400',
  recording: 'bg-orange-500/15 text-orange-400',
  editing:   'bg-purple-500/15 text-purple-400',
  scheduled: 'bg-[#FEC300]/15 text-[#FEC300]',
  published: 'bg-green-500/15 text-green-400',
}

const STAGE_LABELS: Record<ContentStage, string> = {
  idea:      'Idea',
  scripting: 'Guión listo',
  recording: 'Grabar',
  editing:   'Editar',
  scheduled: 'Programado',
  published: 'Publicado',
}

const FORMAT_ICONS: Record<string, React.ElementType> = {
  reel:   Video,
  post:   FileText,
  story:  FileText,
  video:  Video,
  thread: BookOpen,
}

interface Props {
  initialFocus: DailyFocus | null
  userId: string
  todayContent: ContentItem[]
}

export default function MorningBriefing({ initialFocus, userId: _userId, todayContent }: Props) {
  const [focus, setFocus]   = useState<DailyFocus | null>(initialFocus)
  const [editing, setEditing] = useState(!initialFocus)
  const [saving, setSaving]   = useState(false)
  const [form, setForm] = useState({
    goal_1: initialFocus?.goal_1 ?? '',
    goal_2: initialFocus?.goal_2 ?? '',
    goal_3: initialFocus?.goal_3 ?? '',
    theme:  initialFocus?.theme  ?? '',
  })

  async function handleSave() {
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    const res = await fetch('/api/daily-focus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, ...form }),
    })
    if (res.ok) {
      const data = await res.json()
      setFocus(data)
      setEditing(false)
    }
    setSaving(false)
  }

  const unpublished = todayContent.filter(c => c.stage !== 'published')
  const published   = todayContent.filter(c => c.stage === 'published')

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#FEC300] mb-2">
          <Sun size={20} />
          <span className="text-sm font-medium uppercase tracking-wider">Morning Briefing</span>
        </div>
        <h1 className="text-3xl font-bold text-white">{formatDate()}</h1>
        {focus?.theme && !editing && (
          <p className="text-[#898B8F] mt-1">Tema del día: <span className="text-[#FEC300]">{focus.theme}</span></p>
        )}
      </div>

      {/* Tareas sagradas */}
      {editing ? (
        <div className="bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-6 space-y-5">
          <h2 className="text-sm text-[#898B8F] uppercase tracking-wider">Define tu día</h2>
          <div>
            <label className="block text-xs text-[#898B8F] uppercase tracking-wider mb-2">Tema del día</label>
            <input
              value={form.theme}
              onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
              placeholder="Ej: Noche de Deep Work, Noche de Contenido..."
              className="w-full bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm placeholder-[#555560] focus:outline-none focus:border-[#FEC300]"
            />
          </div>
          {(['goal_1', 'goal_2', 'goal_3'] as const).map((key, i) => (
            <div key={key}>
              <label className="block text-xs text-[#898B8F] uppercase tracking-wider mb-2">
                Tarea Sagrada {i + 1}
              </label>
              <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder="¿Qué DEBES completar hoy sí o sí?"
                className="w-full bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm placeholder-[#555560] focus:outline-none focus:border-[#FEC300]"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#FEC300] hover:bg-[#e6b000] disabled:opacity-50 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              <Check size={16} />
              {saving ? 'Guardando...' : 'Guardar día'}
            </button>
            {focus && (
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-2 text-[#898B8F] hover:text-white px-4 py-2.5 rounded-lg text-sm border border-[#1a1a1f] hover:border-[#2a2a35] transition-colors"
              >
                <X size={16} />Cancelar
              </button>
            )}
          </div>
        </div>
      ) : focus ? (
        <div className="space-y-3">
          {[focus.goal_1, focus.goal_2, focus.goal_3].filter(Boolean).map((goal, i) => (
            <div key={i} className="flex items-start gap-4 bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-5">
              <span className="font-mono text-[#FEC300] text-sm font-bold mt-0.5 w-6 shrink-0">0{i+1}</span>
              <p className="text-white text-base flex-1">{goal}</p>
            </div>
          ))}
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 text-[#898B8F] hover:text-white text-sm mt-4 transition-colors"
          >
            <Edit3 size={14} />Editar día
          </button>
        </div>
      ) : (
        <div className="bg-[#0d0d0f] border border-[#1a1a1f] border-dashed rounded-xl p-8 text-center">
          <p className="text-[#898B8F] mb-4">No hay focus para hoy todavía.</p>
          <button
            onClick={() => setEditing(true)}
            className="bg-[#FEC300] hover:bg-[#e6b000] text-black font-semibold px-5 py-2.5 rounded-lg text-sm"
          >
            Definir mi día
          </button>
        </div>
      )}

      {/* Contenido de hoy */}
      {todayContent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#555560] uppercase tracking-wider">Contenido de hoy</p>
            <Link href="/calendar" className="text-xs text-[#555560] hover:text-[#FEC300] transition-colors">
              Ver calendario →
            </Link>
          </div>
          <div className="space-y-2">
            {todayContent.map(item => {
              const FormatIcon = FORMAT_ICONS[item.format] ?? Video
              return (
                <Link
                  key={item.id}
                  href="/pipeline"
                  className="flex items-center gap-3 bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl px-4 py-3 hover:border-[#2a2a35] transition-colors group"
                >
                  <FormatIcon size={15} className="text-[#555560] shrink-0" />
                  <p className="text-sm text-white flex-1 truncate">{item.title}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STAGE_COLORS[item.stage]}`}>
                    {STAGE_LABELS[item.stage]}
                  </span>
                  <span className="text-[10px] text-[#555560] uppercase shrink-0">{item.platform}</span>
                </Link>
              )
            })}
          </div>
          {unpublished.length > 0 && published.length === 0 && (
            <p className="text-xs text-[#555560] mt-2">
              {unpublished.length === 1
                ? '1 pieza pendiente de publicar hoy'
                : `${unpublished.length} piezas pendientes de publicar hoy`}
            </p>
          )}
          {published.length > 0 && published.length === todayContent.length && (
            <p className="text-xs text-green-400 mt-2">✓ Todo el contenido de hoy publicado</p>
          )}
        </div>
      )}
    </div>
  )
}
