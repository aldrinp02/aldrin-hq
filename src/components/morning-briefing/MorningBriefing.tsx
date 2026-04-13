'use client'

import { useState } from 'react'
import type { DailyFocus } from '@/types'
import { Sun, Edit3, Check, X } from 'lucide-react'

const DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatDate() {
  const d = new Date()
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

interface Props {
  initialFocus: DailyFocus | null
  userId: string
}

export default function MorningBriefing({ initialFocus, userId }: Props) {
  const [focus, setFocus] = useState<DailyFocus | null>(initialFocus)
  const [editing, setEditing] = useState(!initialFocus)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    goal_1: initialFocus?.goal_1 ?? '',
    goal_2: initialFocus?.goal_2 ?? '',
    goal_3: initialFocus?.goal_3 ?? '',
    theme: initialFocus?.theme ?? '',
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

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[#FEC300] mb-2">
          <Sun size={20} />
          <span className="text-sm font-medium uppercase tracking-wider">Morning Briefing</span>
        </div>
        <h1 className="text-3xl font-bold text-white">{formatDate()}</h1>
        {focus?.theme && !editing && (
          <p className="text-[#898B8F] mt-1">Noche temática: <span className="text-[#FEC300]">{focus.theme}</span></p>
        )}
      </div>

      {editing ? (
        /* Form */
        <div className="bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-6 space-y-5">
          <h2 className="text-sm text-[#898B8F] uppercase tracking-wider">Define tu día</h2>

          <div>
            <label className="block text-xs text-[#898B8F] uppercase tracking-wider mb-2">Noche temática</label>
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
                placeholder={`¿Qué DEBES completar hoy sí o sí?`}
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
                <X size={16} />
                Cancelar
              </button>
            )}
          </div>
        </div>
      ) : focus ? (
        /* View */
        <div className="space-y-3">
          {[focus.goal_1, focus.goal_2, focus.goal_3].filter(Boolean).map((goal, i) => (
            <div key={i} className="flex items-start gap-4 bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-5 group">
              <span className="font-mono text-[#FEC300] text-sm font-bold mt-0.5 w-6 shrink-0">0{i+1}</span>
              <p className="text-white text-base flex-1">{goal}</p>
            </div>
          ))}

          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 text-[#898B8F] hover:text-white text-sm mt-4 transition-colors"
          >
            <Edit3 size={14} />
            Editar día
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
    </div>
  )
}
