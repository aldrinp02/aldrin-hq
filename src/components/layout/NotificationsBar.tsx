'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { X, AlertTriangle, Calendar, CheckSquare } from 'lucide-react'

interface Alert {
  id: string
  type: 'warn' | 'info'
  message: string
  href?: string
  linkLabel?: string
}

export default function NotificationsBar() {
  const supabase = createClient()
  const [alerts, setAlerts]     = useState<Alert[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]
      const found: Alert[] = []

      // 1. Tareas vencidas
      const { data: overdue } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', user.id)
        .neq('status', 'done')
        .lt('due_date', today)
        .not('due_date', 'is', null)

      if (overdue && overdue.length > 0) {
        found.push({
          id: 'overdue-tasks',
          type: 'warn',
          message: `${overdue.length} ${overdue.length === 1 ? 'tarea vencida' : 'tareas vencidas'}`,
          href: '/tasks',
          linkLabel: 'Ver tareas',
        })
      }

      // 2. Contenido programado para hoy sin publicar
      const { data: todayContent } = await supabase
        .from('content_pipeline')
        .select('id, title, stage')
        .eq('user_id', user.id)
        .eq('publish_date', today)
        .neq('stage', 'published')

      if (todayContent && todayContent.length > 0) {
        found.push({
          id: 'today-content',
          type: 'info',
          message: `${todayContent.length === 1
            ? `"${todayContent[0].title}" está programado para hoy`
            : `${todayContent.length} piezas programadas para hoy`}`,
          href: '/calendar',
          linkLabel: 'Ver calendario',
        })
      }

      // 3. Campañas Meta sin leads (best-effort, falla silencioso)
      try {
        const res = await fetch('/api/meta/campaigns?preset=last_7d')
        if (res.ok) {
          const campaigns = await res.json()
          const deadCampaigns = campaigns.filter((c: { status: string; insights?: { data: { spend: string; actions?: { action_type: string; value: string }[] }[] } }) => {
            if (c.status !== 'ACTIVE') return false
            const ins = c.insights?.data?.[0]
            if (!ins) return false
            const spend = Number(ins.spend ?? 0)
            if (spend === 0) return false
            const leads = Number(ins.actions?.find((a: { action_type: string }) => a.action_type === 'lead')?.value ?? 0)
            return leads === 0
          })
          if (deadCampaigns.length > 0) {
            found.push({
              id: 'dead-campaigns',
              type: 'warn',
              message: `${deadCampaigns.length === 1
                ? `"${deadCampaigns[0].name}" lleva 7 días activa sin generar leads`
                : `${deadCampaigns.length} campañas activas sin leads en 7 días`}`,
              href: '/estadisticas',
              linkLabel: 'Ver estadísticas',
            })
          }
        }
      } catch {
        // Meta API falla silencioso — no bloquea las demás alertas
      }

      setAlerts(found)
    }

    check()
  }, [supabase])

  const visible = alerts.filter(a => !dismissed.has(a.id))
  if (visible.length === 0) return null

  return (
    <div className="space-y-1 mb-6">
      {visible.map(alert => (
        <div
          key={alert.id}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${
            alert.type === 'warn'
              ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
              : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
          }`}
        >
          {alert.type === 'warn'
            ? <AlertTriangle size={14} className="shrink-0" />
            : alert.href?.includes('calendar')
              ? <Calendar size={14} className="shrink-0" />
              : <CheckSquare size={14} className="shrink-0" />}

          <span className="flex-1">{alert.message}</span>

          {alert.href && (
            <Link
              href={alert.href}
              className="text-xs underline underline-offset-2 opacity-80 hover:opacity-100 shrink-0"
            >
              {alert.linkLabel}
            </Link>
          )}

          <button
            onClick={() => setDismissed(d => new Set([...d, alert.id]))}
            className="opacity-50 hover:opacity-100 transition-opacity shrink-0 ml-1"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
