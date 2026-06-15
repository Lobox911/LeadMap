interface Props {
  hasWebsite: boolean
  verified?: boolean
  className?: string
}

export default function StatusBadge({ hasWebsite, verified, className = '' }: Props) {
  if (!hasWebsite) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        {verified ? 'Verified No Website' : 'No Website'}
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {verified ? 'Verified Website' : 'Has Website'}
    </span>
  )
}