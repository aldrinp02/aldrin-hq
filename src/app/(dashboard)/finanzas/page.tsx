'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Zap, TrendingUp, DollarSign, Target, Sparkles } from 'lucide-react'
import type { Contact, ContactService } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface ContactWithServices extends Contact {
  services: ContactService[]
}

function KPICard({
  label, value, sub, icon: Icon, accent = false,
}: {
  label: string; value: string; sub?: string; icon: React.ElementType; accent?: boolean
}) {
  return (
    <div className="bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-[#555560] uppercase tracking-wider">{label}</p>
        <Icon size={16} className={accent ? 'text-[#FEC300]' : 'text-[#555560]'} />
      </div>
      <p className={`text-3xl font-bold font-mono ${accent ? 'text-[#FEC300]' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-[#555560] mt-2">{sub}</p>}
    </div>
  )
}

function ContactRow({ contact }: { contact: ContactWithServices }) {
  const activeServices = contact.services.filter(s => s.status === 'active')
  const mrr     = activeServices.filter(s => s.type === 'recurring').reduce((a, s) => a + s.amount, 0)
  const oneTime = activeServices.filter(s => s.type === 'one_time').reduce((a, s) => a + s.amount, 0)

  if (activeServices.length === 0) return null

  return (
    <div className="border border-[#1a1a1f] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0c]">
        <div>
          <p className="text-sm font-medium text-white">{contact.name}</p>
          {contact.business && <p className="text-xs text-[#555560]">{contact.business}</p>}
        </div>
        <div className="flex items-center gap-4 text-right">
          {mrr > 0 && (
            <div>
              <p className="text-[10px] text-[#555560] uppercase">MRR</p>
              <p className="text-sm font-mono text-[#FEC300]">${mrr.toLocaleString()}</p>
            </div>
          )}
          {oneTime > 0 && (
            <div>
              <p className="text-[10px] text-[#555560] uppercase">Único</p>
              <p className="text-sm font-mono text-white">${oneTime.toLocaleString()}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-[#555560] uppercase">Total</p>
            <p className="text-sm font-mono text-green-400">${(mrr + oneTime).toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-[#1a1a1f]">
        {activeServices.map(svc => (
          <div key={svc.id} className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              {svc.type === 'recurring'
                ? <RefreshCw size={11} className="text-blue-400" />
                : <Zap size={11} className="text-orange-400" />}
              <span className="text-sm text-[#898B8F]">{svc.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-white">${svc.amount.toLocaleString()}</span>
              <span className={`text-[10px] font-medium uppercase ${svc.type === 'recurring' ? 'text-blue-400' : 'text-orange-400'}`}>
                {svc.type === 'recurring' ? '/mes' : 'único'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FinanzasPage() {
  const supabase = createClient()
  const [clients, setClients]     = useState<ContactWithServices[]>([])
  const [leads, setLeads]         = useState<ContactWithServices[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<'clientes' | 'pipeline'>('clientes')

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: contactsData }, { data: servicesData }] = await Promise.all([
      supabase.from('contacts').select('*').eq('user_id', user.id),
      supabase.from('contact_services').select('*').eq('user_id', user.id),
    ])

    const allContacts = (contactsData ?? []) as Contact[]
    const allServices = (servicesData ?? []) as ContactService[]

    const withServices = (c: Contact): ContactWithServices => ({
      ...c,
      services: allServices.filter(s => s.contact_id === c.id),
    })

    setClients(
      allContacts
        .filter(c => c.type === 'client' && c.stage === 'active')
        .map(withServices)
        .filter(c => c.services.some(s => s.status === 'active'))
    )
    setLeads(
      allContacts
        .filter(c => c.type === 'lead' && ['proposal','negotiating'].includes(c.stage))
        .map(withServices)
        .filter(c => c.services.some(s => s.status === 'active'))
    )
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  // KPI calculations
  const clientServices = clients.flatMap(c => c.services.filter(s => s.status === 'active'))
  const leadServices   = leads.flatMap(c => c.services.filter(s => s.status === 'active'))

  const mrr             = clientServices.filter(s => s.type === 'recurring').reduce((a, s) => a + s.amount, 0)
  const monthlyOneTime  = clientServices.filter(s => s.type === 'one_time').reduce((a, s) => a + s.amount, 0)
  const ingresosMes     = mrr + monthlyOneTime

  const pipelineTotal   = leadServices.reduce((a, s) => a + s.amount, 0)
  const pipelineMRR     = leadServices.filter(s => s.type === 'recurring').reduce((a, s) => a + s.amount, 0)
  const mrrPotencial    = mrr + pipelineMRR

  const displayTab = activeTab === 'clientes' ? clients : leads

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Finanzas</h1>
        <p className="text-sm text-[#555560] mt-0.5">Ingresos actuales y pipeline de ventas</p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-[#0d0d0f] rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard
            label="MRR"
            value={mrr > 0 ? `$${mrr.toLocaleString()}` : '—'}
            sub={`${clients.length} clientes activos`}
            icon={DollarSign}
            accent={mrr > 0}
          />
          <KPICard
            label="Ingresos del mes"
            value={ingresosMes > 0 ? `$${ingresosMes.toLocaleString()}` : '—'}
            sub={monthlyOneTime > 0 ? `Incluye $${monthlyOneTime.toLocaleString()} one-time` : 'Solo recurrente'}
            icon={TrendingUp}
          />
          <KPICard
            label="Pipeline potencial"
            value={pipelineTotal > 0 ? `$${pipelineTotal.toLocaleString()}` : '—'}
            sub={`${leads.length} leads en propuesta`}
            icon={Target}
          />
          <KPICard
            label="MRR potencial"
            value={mrrPotencial > 0 ? `$${mrrPotencial.toLocaleString()}` : '—'}
            sub={pipelineMRR > 0 ? `+$${pipelineMRR.toLocaleString()} si cierran` : 'Sin leads recurrentes'}
            icon={Sparkles}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['clientes', 'pipeline'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === t
                ? 'bg-[#FEC300] text-black'
                : 'bg-[#0d0d0f] text-[#898B8F] hover:text-white border border-[#1a1a1f]'
            }`}
          >
            {t === 'clientes' ? `Clientes (${clients.length})` : `Pipeline (${leads.length})`}
          </button>
        ))}
      </div>

      {/* Contact breakdown */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-24 bg-[#0d0d0f] rounded-xl animate-pulse" />)}</div>
      ) : displayTab.length === 0 ? (
        <div className="text-center py-16 text-[#555560]">
          <p className="text-sm">
            {activeTab === 'clientes'
              ? 'Sin clientes activos con servicios registrados'
              : 'Sin leads en propuesta o negociación con servicios registrados'}
          </p>
          <p className="text-xs mt-1">Agrega servicios desde el CRM → Ver servicios</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayTab.map(c => <ContactRow key={c.id} contact={c} />)}
        </div>
      )}
    </div>
  )
}
