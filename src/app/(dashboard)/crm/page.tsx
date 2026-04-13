'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, Badge, Skeleton, ErrorState, EmptyState } from '@/components/ui'
import type { Contact, ContactType } from '@/types'

const LEAD_STAGES = ['new','contacted','qualified','proposal','negotiating','won','lost']
const CLIENT_STAGES = ['active','paused','churned']

const STAGE_VARIANT: Record<string, 'success'|'warning'|'muted'|'gold'|'default'> = {
  new: 'default', contacted: 'muted', qualified: 'warning',
  proposal: 'gold', negotiating: 'gold', won: 'success', lost: 'muted',
  active: 'success', paused: 'warning', churned: 'muted',
}

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<ContactType>('lead')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [form, setForm] = useState({ name: '', business: '', email: '', phone: '', stage: 'new', monthly_value: '', notes: '', type: 'lead' as ContactType })

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/crm?type=${tab}`)
    if (res.ok) setContacts(await res.json())
    else setError('Error cargando CRM')
    setLoading(false)
  }

  useEffect(() => { load() }, [tab])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { ...form, type: tab, monthly_value: form.monthly_value ? Number(form.monthly_value) : null, business: form.business || null, email: form.email || null, phone: form.phone || null, notes: form.notes || null }
    if (editing) {
      const res = await fetch(`/api/crm/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { await load(); setEditing(null) }
    } else {
      const res = await fetch('/api/crm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { await load(); setShowForm(false) }
    }
  }

  async function updateStage(id: string, stage: string) {
    setContacts(c => c.map(x => x.id === id ? { ...x, stage } : x))
    await fetch(`/api/crm/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage }) })
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar contacto?')) return
    await fetch(`/api/crm/${id}`, { method: 'DELETE' })
    setContacts(c => c.filter(x => x.id !== id))
  }

  const stages = tab === 'lead' ? LEAD_STAGES : CLIENT_STAGES

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div>
      <PageHeader title="CRM" description={`${contacts.length} ${tab === 'lead' ? 'leads' : 'clientes'}`}
        action={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#FEC300] hover:bg-[#e6b000] text-black font-semibold px-4 py-2.5 rounded-lg text-sm"><Plus size={16} />Nuevo</button>} />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['lead','client'] as ContactType[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-[#FEC300] text-black' : 'bg-[#0d0d0f] text-[#898B8F] hover:text-white border border-[#1a1a1f]'}`}>
            {t === 'lead' ? 'Leads' : 'Clientes'}
          </button>
        ))}
      </div>

      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-5 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="Nombre *"
              className="col-span-2 bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]" />
            <input value={form.business} onChange={e => setForm(f => ({...f, business: e.target.value}))} placeholder="Empresa"
              className="bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]" />
            <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="Email" type="email"
              className="bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]" />
            <input value={form.monthly_value} onChange={e => setForm(f => ({...f, monthly_value: e.target.value}))} placeholder="Valor mensual ($)" type="number"
              className="bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]" />
            <select value={form.stage} onChange={e => setForm(f => ({...f, stage: e.target.value}))}
              className="bg-black border border-[#2a2a35] rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]">
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Notas" rows={2}
            className="w-full bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300] resize-none" />
          <div className="flex gap-3">
            <button type="submit" className="bg-[#FEC300] hover:bg-[#e6b000] text-black font-semibold px-4 py-2 rounded-lg text-sm">Guardar</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="text-[#898B8F] hover:text-white px-3 py-2 rounded-lg text-sm border border-[#1a1a1f]">Cancelar</button>
          </div>
        </form>
      )}

      {contacts.length === 0 ? <EmptyState title={`Sin ${tab === 'lead' ? 'leads' : 'clientes'}`} /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#898B8F] text-xs uppercase tracking-wider border-b border-[#1a1a1f]">
                <th className="text-left pb-3 pr-4">Nombre</th>
                <th className="text-left pb-3 pr-4">Empresa</th>
                <th className="text-left pb-3 pr-4">Etapa</th>
                {tab === 'client' && <th className="text-left pb-3 pr-4">Valor/mes</th>}
                <th className="text-left pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1f]">
              {contacts.map(c => (
                <tr key={c.id} className="hover:bg-[#0d0d0f]/50 transition-colors">
                  <td className="py-3 pr-4 text-white font-medium">{c.name}</td>
                  <td className="py-3 pr-4 text-[#898B8F]">{c.business ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <select value={c.stage} onChange={e => updateStage(c.id, e.target.value)}
                      className="bg-transparent text-xs border border-[#2a2a35] rounded-lg px-2 py-1 text-white focus:outline-none focus:border-[#FEC300]">
                      {stages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  {tab === 'client' && <td className="py-3 pr-4 font-mono text-[#FEC300]">{c.monthly_value ? `$${c.monthly_value}` : '—'}</td>}
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(c); setForm({ name: c.name, business: c.business ?? '', email: c.email ?? '', phone: c.phone ?? '', stage: c.stage, monthly_value: c.monthly_value?.toString() ?? '', notes: c.notes ?? '', type: c.type }) }}
                        className="p-1.5 text-[#898B8F] hover:text-white"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-[#898B8F] hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
