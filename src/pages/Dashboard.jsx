import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { Panel, ProgressRing, StatCard, StatusBadge } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { readUserData } from '../services/localUserData'
import { supabase } from '../services/supabaseClient'

/* Generate last N days as ISO strings */
function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

const moduleCards = [
  { title: 'Skills', desc: 'Rate your tech stack', path: '/skills', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20', icon: '⚡' },
  { title: 'Readiness', desc: 'Your placement score', path: '/readiness', color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/20', icon: '📊' },
  { title: 'Resume', desc: 'ATS feedback instantly', path: '/resume', color: 'from-violet-500/20 to-pink-500/20 border-violet-500/20', icon: '📄' },
  { title: 'Planner', desc: 'Turn gaps into tasks', path: '/planner', color: 'from-green-500/20 to-emerald-500/20 border-green-500/20', icon: '📅' },
  { title: 'Applications', desc: 'Track every job', path: '/applications', color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/20', icon: '💼' },
  { title: 'Mock Interview', desc: 'Practice & score yourself', path: '/interview', color: 'from-red-500/20 to-rose-500/20 border-red-500/20', icon: '🎙️' },
  { title: 'AI Advisor', desc: 'Chat with your mentor', path: '/advisor', color: 'from-purple-500/20 to-violet-500/20 border-purple-500/20', icon: '✨' },
  { title: 'JD Analyzer', desc: 'Match job descriptions', path: '/jd-analyzer', color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/20', icon: '🔍' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState({ name: '', targetRole: 'Not selected', skillsCount: 0, resumeScore: null })
  const [readinessScore, setReadinessScore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [{ data: profile }, { data: skills }, { data: resume }] = await Promise.all([
        supabase.from('profiles').select('full_name, roles(role_name)').eq('id', user.id).maybeSingle(),
        supabase.from('user_skills').select('id, level').eq('user_id', user.id),
        supabase.from('resumes').select('ats_score').eq('user_id', user.id).order('uploaded_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      const levelScore = { beginner: 33, intermediate: 66, advanced: 100 }
      const avgSkill = skills?.length ? Math.round(skills.reduce((s, sk) => s + (levelScore[sk.level] || 0), 0) / skills.length) : 0
      const rScore = Math.round(0.5 * avgSkill + 0.3 * (resume?.ats_score ?? 0) + 0.2 * (profile?.full_name ? 60 : 20))
      setSummary({
        name: profile?.full_name || '',
        targetRole: profile?.roles?.role_name || 'Not selected',
        skillsCount: skills?.length || 0,
        resumeScore: resume?.ats_score ?? null,
      })
      setReadinessScore(rScore)
      setLoading(false)
    }
    fetch()
  }, [user.id])

  const local = useMemo(() => {
    const tasks = readUserData(user.id, 'plannerTasks', [])
    const apps = readUserData(user.id, 'applications', [])
    const sessions = readUserData(user.id, 'interviewSessions', [])
    const days = lastNDays(28)
    const completedDates = new Set(tasks.filter(t => t.completed).map(t => t.dueDate))
    const heatmap = days.map(d => ({ date: d, active: completedDates.has(d) }))
    let streak = 0
    for (let i = days.length - 1; i >= 0; i--) {
      if (completedDates.has(days[i])) streak++
      else break
    }
    const upcoming = [
      ...tasks.filter(t => !t.completed && t.dueDate).map(t => ({ label: t.title, date: t.dueDate, type: 'Task' })),
      ...apps.filter(a => a.deadline).map(a => ({ label: `${a.role} @ ${a.company}`, date: a.deadline, type: 'Application' })),
    ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4)
    return {
      openTasks: tasks.filter(t => !t.completed).length,
      applications: apps.length,
      interviewScore: sessions[0]?.score ?? null,
      heatmap, streak, upcoming,
    }
  }, [user.id])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <AppShell maxWidth="max-w-7xl">
      {/* Hero */}
      <div className="mb-8 animate-fade-up">
        <p className="text-sm text-gray-500 mb-1">{greeting()}{summary.name ? `, ${summary.name}` : ''} 👋</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Your Career <span className="gradient-text">Command Center</span>
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Tech Stack</span>
            <span className="text-white font-black text-lg tracking-tight">{summary.targetRole}</span>
          </div>
          <button 
            onClick={() => navigate('/profile')} 
            className="rounded-xl bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 text-xs font-bold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:border-indigo-500/50 active:scale-95"
          >
            Change Role
          </button>
        </div>
      </div>

      {/* Readiness ring + stats */}
      <div className="grid gap-5 md:grid-cols-[auto_1fr] mb-8">
        {/* Ring */}
        <div className="animate-fade-up delay-100 glass rounded-2xl p-6 flex flex-col items-center justify-center gap-3 min-w-[180px]">
          <div className="relative">
            <ProgressRing value={readinessScore ?? 0} size={140} stroke={11} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-black text-white">{loading ? '—' : `${readinessScore}%`}</p>
              <p className="text-xs text-gray-500">Readiness</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">Overall placement score</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="relative group">
            <StatCard label="Skills Saved" value={summary.skillsCount} color="blue" delay="delay-100" />
            <button 
              onClick={() => navigate('/skills')}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/20 hover:bg-blue-500/40 text-[10px] font-bold text-blue-200 px-2 py-1 rounded-md border border-blue-500/30"
            >
              Edit
            </button>
          </div>
          <StatCard label="Resume Score" value={summary.resumeScore ?? 0} suffix="%" color="indigo" delay="delay-200" />
          <StatCard label="Open Tasks" value={local.openTasks} color="yellow" delay="delay-300" />
          <StatCard label="Applications" value={local.applications} color="green" delay="delay-400" />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Module cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Modules</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {moduleCards.map((card, i) => (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                style={{ animationDelay: `${i * 50}ms` }}
                className={`animate-fade-up text-left rounded-2xl bg-gradient-to-br border p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${card.color}`}
              >
                <span className="text-2xl mb-2 block">{card.icon}</span>
                <p className="font-bold text-sm text-white">{card.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Streak + Heatmap */}
          <Panel className="animate-fade-up delay-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm">Activity (28 days)</h2>
              <span className="text-xs bg-orange-500/10 border border-orange-500/30 text-orange-300 rounded-full px-2.5 py-1 font-semibold">
                🔥 {local.streak}d streak
              </span>
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {local.heatmap.map(({ date, active }) => (
                <div
                  key={date} title={date}
                  className={`aspect-square rounded-sm transition-all ${active ? 'bg-indigo-500 shadow-sm shadow-indigo-500/40' : 'bg-white/[0.04]'}`}
                />
              ))}
            </div>
          </Panel>

          {/* Upcoming deadlines */}
          <Panel className="animate-fade-up delay-300">
            <h2 className="font-bold text-sm mb-4">Upcoming Deadlines</h2>
            {local.upcoming.length === 0 ? (
              <p className="text-xs text-gray-500">No upcoming deadlines. Add tasks with due dates in the Planner.</p>
            ) : (
              <div className="space-y-3">
                {local.upcoming.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3">
                    <StatusBadge tone={item.type === 'Application' ? 'yellow' : 'blue'}>{item.type}</StatusBadge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Interview score */}
          <Panel className="animate-fade-up delay-400">
            <h2 className="font-bold text-sm mb-3">Interview Trend</h2>
            <p className="text-5xl font-black text-indigo-400">
              {local.interviewScore === null ? '—' : `${local.interviewScore}%`}
            </p>
            <p className="text-xs text-gray-500 mt-1">Latest mock interview score</p>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
