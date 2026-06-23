/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { useEffect, useState, useRef } from 'react'

/* ── Animated Number ── */
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
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color === 'url(#ringGrad)' ? `url(#${id})` : color} strokeWidth={stroke}
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
    <section className={`rounded-2xl liquid-glass p-6 transition-all duration-300 ${glow ? 'animate-pulse-glow' : ''} ${className}`}>
      {children}
    </section>
  )
}

/* ── 3D Card ── */
export function Card3D({ children, className = '', glow = false }) {
  const cardRef = useRef(null)
  
  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const factor = 6 // Subtle tilt angle
    const rotateX = -(y / rect.height) * factor
    const rotateY = (x / rect.width) * factor
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }

  return (
    <div className="card-3d-wrap" style={{ perspective: '1000px' }}>
      <section
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`card-3d rounded-2xl liquid-glass p-6 transition-all duration-200 ease-out relative overflow-hidden ${glow ? 'animate-pulse-glow' : ''} ${className}`}
      >
        {children}
      </section>
    </div>
  )
}

/* ── Stat Card ── */
export function StatCard({ label, value, suffix = '', icon, delay = '' }) {
  // Cinematic styling: minimalist borders and simple highlights
  return (
    <div className={`animate-fade-up ${delay} rounded-2xl liquid-glass p-5 border border-white/[0.04]`}>
      {icon && <div className="mb-3 w-8 h-8 opacity-60 text-white">{icon}</div>}
      <p className="text-2xl font-semibold text-white">
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      <p className="mt-1 text-xs text-[#a3a3a3] font-medium tracking-wide uppercase">{label}</p>
    </div>
  )
}

/* ── Field ── */
export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{label}</span>
      {children}
    </label>
  )
}

/* ── Status Badge ── */
export function StatusBadge({ children, tone = 'gray' }) {
  const dotColors = {
    gray: 'bg-gray-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    green: 'bg-emerald-400',
    red: 'bg-red-400'
  }
  const dotColor = dotColors[tone] || 'bg-white/60'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs font-semibold text-white">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {children}
    </span>
  )
}

/* ── Input/Button classes ── */
export const inputClass = [
  'w-full rounded-xl bg-white/[0.02] border border-white/[0.08]',
  'px-4 py-3 text-white placeholder-gray-600 outline-none',
  'transition focus:border-white/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-white/10',
].join(' ')

export const primaryButtonClass = [
  'rounded-full px-6 py-2.5 text-sm font-semibold text-white cursor-pointer transition-all duration-300',
  'liquid-glass hover:scale-[1.03] active:scale-[0.98]',
].join(' ')

export const secondaryButtonClass = [
  'rounded-full px-6 py-2.5 text-sm font-semibold text-gray-300 cursor-pointer transition-all duration-300',
  'bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:text-white active:scale-[0.98]',
].join(' ')
