'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, RefreshCw, Zap } from 'lucide-react'
import { PageHeader, Skeleton, EmptyState } from '@/components/ui'
import type { Contact, ContactType, ContactService, ServiceType, ServiceStatus } from '@/types'

const LEAD_STAGES   = ['new','contacted','qualified','proposal','negotiating','won','lost']
const CLIENT_STAGES = ['active','paused','churned']

const SERVICE_STATUS_COLORS: Record<ServiceStatus, string> = {
  active:    'text-green-400',
  paused:    'text-yellow-400',
  cancelled: 'text-[#555560] line-through',
}

// ── Services Panel ───────────────────────────────────────────────────────────

function ServicesPanel({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const [services, setServices]   = useState<ContactService[]>([])
  const [loading, setLoading]     = useState(true)
  const [newName, setNewName]     = useState('')
  const [newType, setNewType]     = useState<ServiceType>('recurring')
  const [newAmount, setNewAmount] = useState('')
  const [adding, setAdding]       = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/crm/${contact.id}/services`)
    if (res.ok) setServices(await res.json())
    setLoading(false)
  }, [contact.id])

  useEffect(() => { load() }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName || !newAmount) return
    setAdding(true)
    const res = await fetch(`/api/crm/${contact.id}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, type: newType, amount: Number(newAmount), status: 'active' }),
    })
    if (res.ok) {
      const svc = await res.json()
      setServices(s => [...s, svc])
      setNewName(''); setNewAmount(''); setNewType('recurring')
    }
    setAdding(false)
  }

  async function toggleStatus(svc: ContactService) {
    const next: ServiceStatus = svc.status === 'active' ? 'paused' : 'active'
    const res = await fetch(`/api/contact-services/${svc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) setServices(s => s.map(x => x.id === svc.id ? { ...x, status: next } : x))
  }

  async function handleDelete(id: string) {
    await fetch(`/api/contact-services/${id}`, { method: 'DELETE' })
    setServices(s => s.filter(x => x.id !== id))
  }

  const mrr      = services.filter(s => s.type === 'recurring' && s.status === 'active').reduce((a, s) => a + s.amount, 0)
  const oneTime  = services.filter(s => s.type === 'one_time'  && s.status === 'active').reduce((a, s) => a + s.amount, 0)
  const total    = mrr + oneTime

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0d0d0f] border-l border-[#1a1a1f] flex flex-col h-full overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d0f] border-b border-[#1a1a1f] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-white font-semibold">{contact.name}</p>
            {contact.business && <p className="text-xs text-[#555560]">{contact.business}</p>}
          </div>
          <button onClick={onClose} className="text-[#555560] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">

          {/* Totals */}
          {services.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0a0a0c] border border-[#1a1a1f] rounded-xl p-4 text-center">
                <p className="text-[10px] text-[#555560] uppercase tracking-wider mb-1">MRR</p>
                <p className="text-lg font-bold font-mono text-[#FEC300]">${mrr.toLocaleString()}</p>
              </div>
              <div className="bg-[#0a0a0c] border border-[#1a1a1f] rounded-xl p-4 text-center">
                <p className="text-[10px] text-[#555560] uppercase tracking-wider mb-1">One-time</p>
                <p className="text-lg font-bold font-mono text-white">${oneTime.toLocaleString()}</p>
              </div>
              <div className="bg-[#0a0a0c] border border-[#1a1a1f] rounded-xl p-4 text-center">
                <p className="text-[10px] text-[#555560] uppercase tracking-wider mb-1">Total</p>
                <p className="text-lg font-bold font-mono text-green-400">${total.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Services list */}
          <div>
            <p className="text-xs text-[#555560] uppercase tracking-wider mb-3">Servicios</p>
            {loading ? (
              <div className="space-y-2">{[...Array(2)].map((_,i) => <div key={i} className="h-12 bg-[#1a1a1f] rounded-lg animate-pulse" />)}</div>
            ) : services.length === 0 ? (
              <p className="text-sm text-[#555560] text-center py-6">Sin servicios aún</p>
            ) : (
              <div className="space-y-2">
                {services.map(svc => (
                  <div key={svc.id} className={`flex items-center justify-between p-3 rounded-lg border border-[#1a1a1f] bg-[#0a0a0c] ${svc.status === 'cancelled' ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      {svc.type === 'recurring'
                        ? <RefreshCw size={12} className="text-blue-400 shrink-0" />
                        : <Zap size={12} className="text-orange-400 shrink-0" />}
                      <span className={`text-sm truncate ${SERVICE_STATUS_COLORS[svc.status]}`}>{svc.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-mono text-white">${svc.amount.toLocaleString()}</span>
                      <span className={`text-[10px] uppercase font-medium ${svc.type === 'recurring' ? 'text-blue-400' : 'text-orange-400'}`}>
                        {svc.type === 'recurring' ? '/mes' : 'único'}
                      </span>
                      <button
                        onClick={() => toggleStatus(svc)}
                        className="text-[9px] text-[#555560] hover:text-white border border-[#2a2a35] rounded px-1.5 py-0.5 transition-colors"
                      >
                        {svc.status === 'active' ? 'Pausar' : 'Activar'}
                      </button>
                      <button onClick={() => handleDelete(svc.id)} className="text-[#555560] hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add service form */}
          <form onSubmit={handleAdd} className="border border-[#1a1a1f] rounded-xl p-4 space-y-3">
            <p className="text-xs text-[#555560] uppercase tracking-wider">Agregar servicio</p>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre del servicio"
              className="w-full bg-[#0a0a0c] border border-[#1a1a1f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2a2a35]"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as ServiceType)}
                className="bg-[#0a0a0c] border border-[#1a1a1f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2a2a35]"
              >
                <option value="recurring">Recurrente</option>
                <option value="one_time">Pago único</option>
              </select>
              <input
                type="number"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                placeholder="Monto ($)"
                min={0}
                className="bg-[#0a0a0c] border border-[#1a1a1f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2a2a35]"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !newName || !newAmount}
              className="w-full py-2 bg-[#FEC300]/10 text-[#FEC300] text-sm font-medium rounded-lg hover:bg-[#FEC300]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {adding ? 'Agregando...' : '+ Agregar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── CRM Page ─────────────────────────────────────────────────────────────────

export default function CRMPage() {
  const [contacts, setContacts]   = useState<Contact[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [tab, setTab]             = useState<ContactType>('lead')
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<Contact | null>(null)
  const [services, setServices]   = useState<Contact | null>(null)
  const [form, setForm] = useState({
    name: '', business: '', email: '', phone: '',
    stage: 'new', monthly_value: '', notes: '', type: 'lead' as ContactType,
  })

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
    const body = {
      ...form, type: tab,
      monthly_value: form.monthly_value ? Number(form.monthly_value) : null,
      business: form.business || null, email: form.email || null,
      phone: form.phone || null, notes: form.notes || null,
    }
    if (editing) {
      const res = await fetch(`/api/crm/${editing.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (res.ok) { await load(); setEditing(null) }
    } else {
      const res = await fetch('/api/crm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (res.ok) { await load(); setShowForm(false) }
    }
  }

  async function updateStage(id: string, stage: string) {
    setContacts(c => c.map(x => x.id === id ? { ...x, stage } : x))
    await fetch(`/api/crm/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage }),
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar contacto?')) return
    await fetch(`/api/crm/${id}`, { method: 'DELETE' })
    setContacts(c => c.filter(x => x.id !== id))
  }

  function openEdit(c: Contact) {
    setEditing(c)
    setForm({ name: c.name, business: c.business ?? '', email: c.email ?? '', phone: c.phone ?? '', stage: c.stage, monthly_value: c.monthly_value?.toString() ?? '', notes: c.notes ?? '', type: c.type })
  }

  const stages = tab === 'lead' ? LEAD_STAGES : CLIENT_STAGES

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-[#0d0d0f] rounded-xl animate-pulse" />)}</div>
  if (error)   return <p className="text-red-400 text-sm">{error}</p>

  return (
    <div>
      <PageHeader
        title="CRM"
        description={`${contacts.length} ${tab === 'lead' ? 'leads' : 'clientes'}`}
        action={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#FEC300] hover:bg-[#e6b000] text-black font-semibold px-4 py-2.5 rounded-lg text-sm">
            <Plus size={16} />Nuevo
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['lead','client'] as ContactType[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-[#FEC300] text-black' : 'bg-[#0d0d0f] text-[#898B8F] hover:text-white border border-[#1a1a1f]'}`}>
            {t === 'lead' ? 'Leads' : 'Clientes'}
          </button>
        ))}
      </div>

      {/* Form */}
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-5 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="Nombre *"
              className="col-span-2 bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]" />
            <input value={form.business} onChange={e => setForm(f => ({...f, business: e.target.value}))} placeholder="Empresa"
              className="bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]" />
            <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="Email" type="email"
              className="bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]" />
            <select value={form.stage} onChange={e => setForm(f => ({...f, stage: e.target.value}))}
              className="bg-black border border-[#2a2a35] rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]">
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Notas"
              className="bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FEC300]" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-[#FEC300] hover:bg-[#e6b000] text-black font-semibold px-4 py-2 rounded-lg text-sm">Guardar</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="text-[#898B8F] hover:text-white px-3 py-2 rounded-lg text-sm border border-[#1a1a1f]">Cancelar</button>
          </div>
        </form>
      )}

      {/* Table */}
      {contacts.length === 0 ? (
        <EmptyState title={`Sin ${tab === 'lead' ? 'leads' : 'clientes'}`} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#898B8F] text-xs uppercase tracking-wider border-b border-[#1a1a1f]">
                <th className="text-left pb-3 pr-4">Nombre</th>
                <th className="text-left pb-3 pr-4">Empresa</th>
                <th className="text-left pb-3 pr-4">Etapa</th>
                <th className="text-left pb-3 pr-4">Servicios</th>
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
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => setServices(c)}
                      className="text-xs text-[#FEC300] hover:underline"
                    >
                      Ver servicios
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-[#898B8F] hover:text-white"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-[#898B8F] hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Services panel */}
      {services && (
        <ServicesPanel contact={services} onClose={() => setServices(null)} />
      )}
    </div>
  )
}
