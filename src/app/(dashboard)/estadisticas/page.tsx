'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp, MousePointer, Eye, DollarSign, Users,
  RefreshCw, AlertCircle, Heart, MessageCircle, Bookmark, Play, Share2,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface MetaAction { action_type: string; value: string }

interface MetaInsights {
  spend: string; impressions: string; reach: string; clicks: string
  ctr: string; cpm: string; cpc: string; frequency: string
  actions?: MetaAction[]; cost_per_action_type?: MetaAction[]
}

interface MetaCampaign {
  id: string; name: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED'
  objective: string
  insights?: { data: MetaInsights[] }
}

interface IGInsightValue { value: number }
interface IGInsight { name: string; values?: IGInsightValue[]; value?: number }

interface IGMedia {
  id: string; caption?: string; media_type: string
  timestamp: string; permalink: string
  thumbnail_url?: string; media_url?: string
  like_count: number; comments_count: number
  insights?: { data: IGInsight[] }
}

interface IGAccount { username: string; followers_count: number; media_count: number }

// ── Helpers ──────────────────────────────────────────────────────────────────

const PRESETS = [
  { value: 'today',      label: 'Hoy' },
  { value: 'yesterday',  label: 'Ayer' },
  { value: 'last_7d',    label: '7 días' },
  { value: 'last_30d',   label: '30 días' },
  { value: 'this_month', label: 'Este mes' },
  { value: 'last_month', label: 'Mes pasado' },
  { value: 'maximum',    label: 'Todo' },
]

function getAction(actions: MetaAction[] | undefined, type: string): number {
  return Number(actions?.find(a => a.action_type === type)?.value ?? 0)
}

function getInsight(insights: IGInsight[] | undefined, name: string): number {
  const ins = insights?.find(i => i.name === name)
  return ins?.value ?? ins?.values?.[0]?.value ?? 0
}

function fmt(n: number, decimals = 0) {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}
function fmtMoney(n: number) { return `$${fmt(n, 2)}` }

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Hoy'
  if (d === 1) return 'Ayer'
  if (d < 7)   return `${d}d`
  if (d < 30)  return `${Math.floor(d/7)}sem`
  return `${Math.floor(d/30)}m`
}

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  ACTIVE:   'bg-green-500/15 text-green-400',
  PAUSED:   'bg-yellow-500/15 text-yellow-400',
  ARCHIVED: 'bg-[#2a2a35] text-[#555560]',
  DELETED:  'bg-red-500/15 text-red-400',
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, icon: Icon, accent = false }: {
  label: string; value: string; sub?: string; icon: React.ElementType; accent?: boolean
}) {
  return (
    <div className="bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-[#555560] uppercase tracking-wider">{label}</p>
        <Icon size={15} className={accent ? 'text-[#FEC300]' : 'text-[#555560]'} />
      </div>
      <p className={`text-2xl font-bold font-mono ${accent ? 'text-[#FEC300]' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-[#555560] mt-1.5">{sub}</p>}
    </div>
  )
}

// ── Instagram Tab ─────────────────────────────────────────────────────────────

function InstagramTab() {
  const [account, setAccount]   = useState<IGAccount | null>(null)
  const [media, setMedia]       = useState<IGMedia[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/instagram/media?limit=20')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Instagram API error')
      setAccount(data.account)
      setMedia(data.media)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-[#0d0d0f] rounded-xl animate-pulse" />)}
    </div>
  )

  if (error) return (
    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
      <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm text-red-400 font-medium">Error conectando con Instagram</p>
        <p className="text-xs text-red-400/70 mt-1">{error}</p>
        <p className="text-xs text-[#555560] mt-2">Verifica que META_INSTAGRAM_TOKEN esté en .env.local y tenga permisos instagram_manage_insights</p>
      </div>
    </div>
  )

  // Summary metrics across all posts
  const totalLikes    = media.reduce((a, m) => a + (m.like_count ?? 0), 0)
  const totalComments = media.reduce((a, m) => a + (m.comments_count ?? 0), 0)
  const totalReach    = media.reduce((a, m) => a + getInsight(m.insights?.data, 'reach'), 0)
  const totalPlays    = media.reduce((a, m) => a + getInsight(m.insights?.data, 'plays'), 0)
  const totalSaved    = media.reduce((a, m) => a + getInsight(m.insights?.data, 'saved'), 0)

  return (
    <div className="space-y-6">
      {/* Account header */}
      {account && (
        <div className="flex items-center gap-4 bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {account.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold">@{account.username}</p>
            <p className="text-xs text-[#555560]">{fmt(account.followers_count)} seguidores · {fmt(account.media_count)} publicaciones</p>
          </div>
          <button onClick={load} className="ml-auto text-[#555560] hover:text-white transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPICard label="Likes" value={fmt(totalLikes)} icon={Heart} />
        <KPICard label="Comentarios" value={fmt(totalComments)} icon={MessageCircle} />
        <KPICard label="Guardados" value={fmt(totalSaved)} icon={Bookmark} />
        <KPICard label="Plays" value={fmt(totalPlays)} icon={Play} accent={totalPlays > 0} />
        <KPICard label="Alcance total" value={fmt(totalReach)} icon={Eye} />
      </div>

      <div className="border-t border-[#1a1a1f]" />

      {/* Posts table */}
      <div>
        <p className="text-xs text-[#555560] uppercase tracking-wider mb-4">Últimas {media.length} publicaciones</p>
        {media.length === 0 ? (
          <p className="text-sm text-[#555560] text-center py-8">Sin publicaciones</p>
        ) : (
          <div className="border border-[#1a1a1f] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#555560] text-xs uppercase tracking-wider border-b border-[#1a1a1f] bg-[#0a0a0c]">
                  <th className="text-left px-4 py-3">Contenido</th>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-right px-4 py-3"><Heart size={11} className="inline" /></th>
                  <th className="text-right px-4 py-3"><MessageCircle size={11} className="inline" /></th>
                  <th className="text-right px-4 py-3"><Bookmark size={11} className="inline" /></th>
                  <th className="text-right px-4 py-3"><Play size={11} className="inline" /></th>
                  <th className="text-right px-4 py-3"><Share2 size={11} className="inline" /></th>
                  <th className="text-right px-4 py-3">Alcance</th>
                  <th className="text-right px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1f]">
                {media.map(m => {
                  const ins     = m.insights?.data
                  const reach   = getInsight(ins, 'reach')
                  const saved   = getInsight(ins, 'saved')
                  const plays   = getInsight(ins, 'plays')
                  const shares  = getInsight(ins, 'shares')
                  const caption = m.caption?.split('\n')[0]?.slice(0, 60) ?? '(sin caption)'

                  return (
                    <tr key={m.id} className="hover:bg-[#0d0d0f]/60 transition-colors">
                      <td className="px-4 py-3 max-w-[220px]">
                        <a href={m.permalink} target="_blank" rel="noopener noreferrer"
                          className="text-white hover:text-[#FEC300] transition-colors truncate block text-xs">
                          {caption}{m.caption && m.caption.length > 60 ? '…' : ''}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] text-[#555560] uppercase font-medium">{m.media_type}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#898B8F] text-xs">{fmt(m.like_count)}</td>
                      <td className="px-4 py-3 text-right font-mono text-[#898B8F] text-xs">{fmt(m.comments_count)}</td>
                      <td className="px-4 py-3 text-right font-mono text-[#898B8F] text-xs">{saved > 0 ? fmt(saved) : '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-[#FEC300] text-xs">{plays > 0 ? fmt(plays) : '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-[#898B8F] text-xs">{shares > 0 ? fmt(shares) : '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-white text-xs">{reach > 0 ? fmt(reach) : '—'}</td>
                      <td className="px-4 py-3 text-right text-[#555560] text-xs">{timeAgo(m.timestamp)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EstadisticasPage() {
  const [activeTab, setActiveTab] = useState<'ads' | 'instagram'>('ads')
  const [preset, setPreset]       = useState('this_month')
  const [insights, setInsights]   = useState<MetaInsights | null>(null)
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const loadAds = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [insRes, campRes] = await Promise.all([
        fetch(`/api/meta/insights?preset=${preset}`),
        fetch(`/api/meta/campaigns?preset=${preset}`),
      ])
      if (!insRes.ok) { const e = await insRes.json(); throw new Error(e.error ?? 'Error en Meta API') }
      const [insData, campData] = await Promise.all([insRes.json(), campRes.json()])
      setInsights(insData); setCampaigns(campData)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    }
    setLoading(false)
  }, [preset])

  useEffect(() => { if (activeTab === 'ads') loadAds() }, [activeTab, loadAds])

  const spend       = Number(insights?.spend ?? 0)
  const impressions = Number(insights?.impressions ?? 0)
  const reach       = Number(insights?.reach ?? 0)
  const clicks      = Number(insights?.clicks ?? 0)
  const ctr         = Number(insights?.ctr ?? 0)
  const cpm         = Number(insights?.cpm ?? 0)
  const cpc         = Number(insights?.cpc ?? 0)
  const leads       = getAction(insights?.actions, 'lead') || getAction(insights?.actions, 'onsite_conversion.lead_grouped')
  const cpl         = leads > 0 ? spend / leads : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Estadísticas</h1>
          <p className="text-sm text-[#555560] mt-0.5">Meta Ads + Instagram orgánico</p>
        </div>
        {activeTab === 'ads' && (
          <div className="flex items-center gap-2">
            <div className="flex bg-[#0d0d0f] border border-[#1a1a1f] rounded-lg overflow-hidden">
              {PRESETS.map(p => (
                <button key={p.value} onClick={() => setPreset(p.value)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${preset === p.value ? 'bg-[#FEC300] text-black' : 'text-[#898B8F] hover:text-white'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={loadAds} disabled={loading}
              className="flex items-center justify-center w-9 h-9 border border-[#1a1a1f] rounded-lg text-[#898B8F] hover:text-white transition-colors disabled:opacity-40">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('ads')}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[#FEC300] text-black">
          Meta Ads
        </button>
      </div>

      {/* ── ADS TAB ── */}
      {activeTab === 'ads' && (
        <>
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-red-400 font-medium">Error conectando con Meta</p>
                <p className="text-xs text-red-400/70 mt-1">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_,i) => <div key={i} className="h-24 bg-[#0d0d0f] rounded-xl animate-pulse" />)}
            </div>
          ) : !error && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPICard label="Gasto" value={fmtMoney(spend)} sub={`CPM ${fmtMoney(cpm)}`} icon={DollarSign} accent />
                <KPICard label="Leads" value={fmt(leads)} sub={leads > 0 ? `CPL ${fmtMoney(cpl)}` : 'Sin datos de lead'} icon={Users} accent={leads > 0} />
                <KPICard label="Alcance" value={fmt(reach)} sub={`${fmt(impressions)} impresiones`} icon={Eye} />
                <KPICard label="Clicks" value={fmt(clicks)} sub={`CTR ${Number(ctr).toFixed(2)}% · CPC ${fmtMoney(cpc)}`} icon={MousePointer} />
              </div>

              <div className="border-t border-[#1a1a1f]" />

              <div>
                <p className="text-xs text-[#555560] uppercase tracking-wider mb-4">Campañas</p>
                {campaigns.length === 0 ? (
                  <p className="text-sm text-[#555560] text-center py-8">Sin campañas en este período</p>
                ) : (
                  <div className="border border-[#1a1a1f] rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[#555560] text-xs uppercase tracking-wider border-b border-[#1a1a1f] bg-[#0a0a0c]">
                          <th className="text-left px-4 py-3">Campaña</th>
                          <th className="text-left px-4 py-3">Estado</th>
                          <th className="text-right px-4 py-3">Gasto</th>
                          <th className="text-right px-4 py-3">Impresiones</th>
                          <th className="text-right px-4 py-3">Clicks</th>
                          <th className="text-right px-4 py-3">Leads</th>
                          <th className="text-right px-4 py-3">CPL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a1a1f]">
                        {campaigns.map(c => {
                          const ins     = c.insights?.data?.[0]
                          const cSpend  = Number(ins?.spend ?? 0)
                          const cImpr   = Number(ins?.impressions ?? 0)
                          const cClicks = Number(ins?.clicks ?? 0)
                          const cLeads  = getAction(ins?.actions, 'lead') || getAction(ins?.actions, 'onsite_conversion.lead_grouped')
                          const cCPL    = cLeads > 0 ? cSpend / cLeads : 0
                          return (
                            <tr key={c.id} className="hover:bg-[#0d0d0f]/60 transition-colors">
                              <td className="px-4 py-3 text-white font-medium max-w-[240px] truncate">{c.name}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${CAMPAIGN_STATUS_COLORS[c.status] ?? 'text-[#898B8F]'}`}>{c.status}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-[#FEC300]">{ins ? fmtMoney(cSpend) : '—'}</td>
                              <td className="px-4 py-3 text-right font-mono text-[#898B8F]">{ins ? fmt(cImpr) : '—'}</td>
                              <td className="px-4 py-3 text-right font-mono text-[#898B8F]">{ins ? fmt(cClicks) : '—'}</td>
                              <td className="px-4 py-3 text-right font-mono text-white">{ins ? fmt(cLeads) : '—'}</td>
                              <td className="px-4 py-3 text-right font-mono text-[#898B8F]">{ins && cLeads > 0 ? fmtMoney(cCPL) : '—'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                      {campaigns.length > 1 && (
                        <tfoot>
                          <tr className="border-t border-[#2a2a35] bg-[#0a0a0c] text-xs font-semibold">
                            <td className="px-4 py-3 text-[#555560] uppercase tracking-wider" colSpan={2}>Total</td>
                            <td className="px-4 py-3 text-right font-mono text-[#FEC300]">{fmtMoney(spend)}</td>
                            <td className="px-4 py-3 text-right font-mono text-[#898B8F]">{fmt(impressions)}</td>
                            <td className="px-4 py-3 text-right font-mono text-[#898B8F]">{fmt(clicks)}</td>
                            <td className="px-4 py-3 text-right font-mono text-white">{fmt(leads)}</td>
                            <td className="px-4 py-3 text-right font-mono text-[#898B8F]">{leads > 0 ? fmtMoney(cpl) : '—'}</td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Instagram tab — pendiente */}
    </div>
  )
}
