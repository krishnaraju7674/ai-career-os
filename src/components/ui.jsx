import { useEffect, useState } from 'react'

/* ── Animated Counter ── */
export function AnimatedNumber({ value, suffix = '' }) {
  const [cur, setCur] = useState(0)
  useEffect(() => {
    const end = Number(value) || 0
    if (end === 0) { setCur(0); return }
    let frame = 0
    const total = 40
    const timer = setInterval(() => {
      frame++
      setCur(Math.round((frame / total) * end))
      if (frame >= total) clearInterval(timer)
    }, 18)
    return () => clearInterval(timer)
  }, [value])
  return <>{cur}{suffix}</>
}

/* ── Progress Ring ── */
export function ProgressRing({ value = 0, size = 120, stroke = 9, color = 'url(#ringGrad)' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ
  const id = `ringGrad-${size}`
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={`url(#${id})`} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" className="ring-progress"
      />
    </svg>
  )
}

/* ── Skeleton ── */
export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-xl ${className}`} />
}

/* ── Panel ── */
export function Panel({ children, className = '', glow = false }) {
  return (
    <section className={`rounded-2xl glass p-6 transition-all duration-300 hover:border-white/[0.12] ${glow ? 'animate-pulse-glow' : ''} ${className}`}>
      {children}
    </section>
  )
}

/* ── Stat Card ── */
export function StatCard({ label, value, suffix = '', icon, color = 'indigo', delay = '' }) {
  const colors = {
    indigo: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/20 text-indigo-300',
    blue:   'from-blue-500/20 to-cyan-500/20 border-blue-500/20 text-blue-300',
    green:  'from-green-500/20 to-emerald-500/20 border-green-500/20 text-green-300',
    yellow: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/20 text-yellow-300',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/20 text-purple-300',
    red:    'from-red-500/20 to-rose-500/20 border-red-500/20 text-red-300',
  }
  return (
    <div className={`animate-fade-up ${delay} rounded-2xl bg-gradient-to-br border p-5 ${colors[color] || colors.indigo}`}>
      {icon && <div className="mb-3 w-8 h-8 opacity-80">{icon}</div>}
      <p className="text-2xl font-black text-white">
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      <p className="mt-1 text-sm opacity-80">{label}</p>
    </div>
  )
}

/* ── Field ── */
export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  )
}

/* ── Status Badge ── */
export function StatusBadge({ children, tone = 'gray' }) {
  const tones = {
    gray:   'bg-gray-800/80 text-gray-300 border-gray-700/50',
    blue:   'bg-blue-500/10 text-blue-300 border-blue-500/30',
    green:  'bg-green-500/10 text-green-300 border-green-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    red:    'bg-red-500/10 text-red-300 border-red-500/30',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone] || tones.gray}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${tone === 'gray' ? 'bg-gray-500' : `bg-current`}`} />
      {children}
    </span>
  )
}

/* ── Input/Button classes ── */
export const inputClass = [
  'w-full rounded-xl bg-white/[0.04] border border-white/[0.08]',
  'px-4 py-3 text-white placeholder-gray-600 outline-none',
  'transition focus:border-indigo-500/60 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/30',
].join(' ')

export const primaryButtonClass = [
  'rounded-xl px-5 py-3 font-semibold text-white',
  'bg-gradient-to-r from-indigo-600 to-violet-600',
  'hover:from-indigo-500 hover:to-violet-500',
  'transition-all duration-200 shadow-lg shadow-indigo-500/20',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'active:scale-[0.98]',
].join(' ')

export const secondaryButtonClass = [
  'rounded-xl px-5 py-3 font-semibold text-gray-200',
  'bg-white/[0.06] border border-white/[0.08]',
  'hover:bg-white/[0.1] hover:border-white/[0.15]',
  'transition-all duration-200',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'active:scale-[0.98]',
].join(' ')
