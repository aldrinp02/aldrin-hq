'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sun, FolderOpen, CheckSquare, Layers,
  CalendarDays, Users, DollarSign, BarChart2,
} from 'lucide-react'

interface AppTile {
  href: string
  label: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
}

interface Section {
  label?: string
  tiles: AppTile[]
}

const SECTIONS: Section[] = [
  {
    tiles: [
      {
        href: '/briefing',
        label: 'Morning\nBriefing',
        icon: Sun,
        iconColor: 'text-[#FEC300]',
        iconBg: 'bg-[#FEC300]/15',
      },
    ],
  },
  {
    label: 'TRABAJO',
    tiles: [
      {
        href: '/tasks',
        label: 'Tareas',
        icon: CheckSquare,
        iconColor: 'text-green-400',
        iconBg: 'bg-green-500/15',
      },
      {
        href: '/projects',
        label: 'Proyectos',
        icon: FolderOpen,
        iconColor: 'text-blue-400',
        iconBg: 'bg-blue-500/15',
      },
    ],
  },
  {
    label: 'CONTENIDO',
    tiles: [
      {
        href: '/pipeline',
        label: 'Pipeline',
        icon: Layers,
        iconColor: 'text-purple-400',
        iconBg: 'bg-purple-500/15',
      },
      {
        href: '/calendar',
        label: 'Calendario',
        icon: CalendarDays,
        iconColor: 'text-orange-400',
        iconBg: 'bg-orange-500/15',
      },
    ],
  },
  {
    label: 'NEGOCIO',
    tiles: [
      {
        href: '/crm',
        label: 'CRM',
        icon: Users,
        iconColor: 'text-teal-400',
        iconBg: 'bg-teal-500/15',
      },
      {
        href: '/finanzas',
        label: 'Finanzas',
        icon: DollarSign,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/15',
      },
      {
        href: '/estadisticas',
        label: 'Estadísticas',
        icon: BarChart2,
        iconColor: 'text-sky-400',
        iconBg: 'bg-sky-500/15',
      },
    ],
  },
]

interface Props {
  onNavigate?: () => void
}

export default function MobileAppGrid({ onNavigate }: Props) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="pt-2 pb-1">
        <p className="text-xs text-[#555560] uppercase tracking-widest font-mono">ALDRIN <span className="text-[#FEC300]">HQ</span></p>
      </div>

      {SECTIONS.map((section, si) => (
        <div key={si} className="space-y-3">
          {section.label && (
            <p className="text-[10px] text-[#555560] uppercase tracking-widest font-mono px-1">
              {section.label}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {section.tiles.map((tile) => {
              const Icon = tile.icon
              return (
                <Link
                  key={tile.href}
                  href={tile.href}
                  onClick={onNavigate}
                  className="flex flex-col items-start gap-3 bg-[#0d0d0f] border border-[#1a1a1f] rounded-2xl p-4 active:scale-95 transition-transform"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tile.iconBg}`}>
                    <Icon size={20} className={tile.iconColor} />
                  </div>
                  <p className="text-sm font-medium text-white leading-tight whitespace-pre-line">
                    {tile.label}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
