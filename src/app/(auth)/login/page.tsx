'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-mono text-3xl font-bold text-white tracking-tight">
            ALDRIN <span className="text-[#FEC300]">HQ</span>
          </h1>
          <p className="mt-2 text-[#898B8F] text-sm">Tu headquarters personal</p>
        </div>

        <div className="bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs text-[#898B8F] uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm placeholder-[#555560] focus:outline-none focus:border-[#FEC300] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#898B8F] uppercase tracking-wider mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-black border border-[#2a2a35] rounded-lg px-4 py-3 text-white text-sm placeholder-[#555560] focus:outline-none focus:border-[#FEC300] transition-colors"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FEC300] hover:bg-[#e6b000] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg py-3 text-sm transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar al HQ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
