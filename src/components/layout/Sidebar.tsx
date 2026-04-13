'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Sun, FolderOpen, CheckSquare, Layout, Users,
  ChevronLeft, ChevronRight, LogOut, Menu
} from 'lucide-react'

const NAV = [
  { href: '/',          label: 'Morning Briefing', icon: Sun },
  { href: '/projects',  label: 'Proyectos',         icon: FolderOpen },
  { href: '/tasks',     label: 'Tareas',             icon: CheckSquare },
  { href: '/pipeline',  label: 'Pipeline',           icon: Layout },
  { href: '/crm',       label: 'CRM',                icon: Users },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-[#1a1a1f] ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <span className="font-mono font-bold text-lg tracking-tight">
            ALDRIN <span className="text-[#FEC300]">HQ</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 text-[#898B8F] hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 text-[#898B8F]"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[#FEC300]/10 text-[#FEC300] border-l-2 border-[#FEC300] pl-[10px]'
                  : 'text-[#898B8F] hover:text-white hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-[#1a1a1f]">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#898B8F] hover:text-red-400 hover:bg-red-400/5 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Salir' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Salir</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 bg-[#0d0d0f] border border-[#1a1a1f] rounded-lg text-[#898B8F] hover:text-white"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#0d0d0f] border-r border-[#1a1a1f] transform transition-transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#0d0d0f] border-r border-[#1a1a1f] transition-all duration-200 shrink-0 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
