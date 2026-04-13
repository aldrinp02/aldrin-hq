import Link from 'next/link'

interface KPIs {
  tasksPending: number
  tasksDone: number
  projectsActive: number
  pipelineTotal: number
  pipelinePublished: number
  pipelineReady: number
  leads: number
  clients: number
  mrr: number
}

function KPICard({ label, value, sub, href, accent = false }: {
  label: string
  value: string | number
  sub?: string
  href: string
  accent?: boolean
}) {
  return (
    <Link href={href} className="block bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-5 hover:border-[#2a2a35] transition-colors group">
      <p className="text-xs text-[#555560] uppercase tracking-wider mb-3">{label}</p>
      <p className={`text-3xl font-bold font-mono ${accent ? 'text-[#FEC300]' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-[#555560] mt-2">{sub}</p>}
    </Link>
  )
}

export default function DashboardKPIs({ kpis }: { kpis: KPIs }) {
  const pipelinePct = kpis.pipelineTotal > 0
    ? Math.round((kpis.pipelinePublished / kpis.pipelineTotal) * 100)
    : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KPICard
        href="/tasks"
        label="Tareas pendientes"
        value={kpis.tasksPending}
        sub={`${kpis.tasksDone} completadas`}
      />
      <KPICard
        href="/projects"
        label="Proyectos activos"
        value={kpis.projectsActive}
        sub="en progreso"
      />
      <KPICard
        href="/pipeline"
        label="Pipeline"
        value={`${kpis.pipelinePublished}/${kpis.pipelineTotal}`}
        sub={`${kpis.pipelineReady} listos para grabar · ${pipelinePct}% publicado`}
      />
      <KPICard
        href="/crm"
        label="MRR"
        value={kpis.mrr ? `$${kpis.mrr.toLocaleString()}` : '—'}
        sub={`${kpis.clients} clientes · ${kpis.leads} leads`}
        accent={kpis.mrr > 0}
      />
    </div>
  )
}
