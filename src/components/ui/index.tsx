// Shared UI primitives

export function KPICard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#0d0d0f] border border-[#1a1a1f] border-l-2 border-l-[#FEC300] rounded-xl p-5">
      <p className="text-xs text-[#898B8F] uppercase tracking-wider mb-2">{label}</p>
      <p className="font-mono text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-[#555560] mt-1">{sub}</p>}
    </div>
  )
}

export function Badge({ children, variant = 'default' }: {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'muted'
}) {
  const styles = {
    default:  'bg-white/10 text-white',
    gold:     'bg-[#FEC300]/10 text-[#FEC300]',
    success:  'bg-green-500/10 text-green-400',
    warning:  'bg-amber-500/10 text-amber-400',
    muted:    'bg-[#898B8F]/10 text-[#898B8F]',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1f] rounded-lg ${className}`} />
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-red-400 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-[#FEC300] hover:underline">
          Reintentar
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-white font-medium mb-1">{title}</p>
      {description && <p className="text-[#898B8F] text-sm">{description}</p>}
    </div>
  )
}

export function PageHeader({ title, description, action }: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-[#898B8F] text-sm mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
