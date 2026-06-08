import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { Panel, ProgressRing, StatCard, StatusBadge } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { readUserData } from '../services/localUserData'
import { supabase } from '../services/supabaseClient'
import { 
  SkillsIcon, ReadinessIcon, ResumeIcon, JdMatchingIcon, 
  AiAdvisorIcon, AiMockCoachIcon, InterviewQsIcon, AptitudeIcon, 
  RoadmapsIcon, CompanyPrepIcon, SalaryIcon, CertificationsIcon, 
  ResourceHubIcon, VideoGuidesIcon, PomodoroIcon, GoalsIcon, 
  JournalIcon, AchievementsIcon, PlannerIcon, JobTrackerIcon 
} from '../components/icons'

/* Generate last N days as ISO strings */
function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

const moduleCards = [
  { title: 'Skills Tracker', desc: 'Rate your tech stack', path: '/skills', color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/35', icon: <SkillsIcon className="w-6 h-6 text-cyan-400" /> },
  { title: 'Readiness Score', desc: 'Placement probability', path: '/readiness', color: 'from-blue-500/10 to-violet-500/10 border-blue-500/20 hover:border-blue-500/35', icon: <ReadinessIcon className="w-6 h-6 text-blue-400" /> },
  { title: 'Resume Review', desc: 'ATS feedback instantly', path: '/resume', color: 'from-violet-500/10 to-pink-500/10 border-violet-500/20 hover:border-violet-500/35', icon: <ResumeIcon className="w-6 h-6 text-violet-400" /> },
  { title: 'JD Matching', desc: 'Compare profiles vs JD', path: '/jd-analyzer', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/35', icon: <JdMatchingIcon className="w-6 h-6 text-emerald-400" /> },
  { title: 'AI Placement Advisor', desc: 'Chat with Gemini mentor', path: '/advisor', color: 'from-pink-500/10 to-purple-500/10 border-pink-500/20 hover:border-pink-500/35', icon: <AiAdvisorIcon className="w-6 h-6 text-pink-400" /> },
  { title: 'AI Mock Coach', desc: 'Grades answers live', path: '/mock-interview', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/35', icon: <AiMockCoachIcon className="w-6 h-6 text-amber-400" /> },
  { title: 'Interview Qs', desc: 'Technical & HR practice', path: '/interview', color: 'from-red-500/10 to-rose-500/10 border-red-500/20 hover:border-red-500/35', icon: <InterviewQsIcon className="w-6 h-6 text-red-400" /> },
  { title: 'Aptitude Test', desc: 'Verbal & Quantitative', path: '/aptitude', color: 'from-teal-500/10 to-cyan-500/10 border-teal-500/20 hover:border-teal-500/35', icon: <AptitudeIcon className="w-6 h-6 text-teal-400" /> },
  { title: 'Career Roadmaps', desc: 'Specialization guides', path: '/roadmaps', color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:border-blue-500/35', icon: <RoadmapsIcon className="w-6 h-6 text-blue-400" /> },
  { title: 'Company Prep', desc: 'Rounds & cracking tips', path: '/company-prep', color: 'from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:border-violet-500/35', icon: <CompanyPrepIcon className="w-6 h-6 text-violet-400" /> },
  { title: 'Salary & CTC', desc: 'Hub wise stats', path: '/salary-insights', color: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/35', icon: <SalaryIcon className="w-6 h-6 text-emerald-400" /> },
  { title: 'Certifications', desc: 'Recommended credentials', path: '/certifications', color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/35', icon: <CertificationsIcon className="w-6 h-6 text-cyan-400" /> },
  { title: 'Resource Hub', desc: '200+ curated links', path: '/resources', color: 'from-rose-500/10 to-pink-500/10 border-rose-500/20 hover:border-rose-500/35', icon: <ResourceHubIcon className="w-6 h-6 text-rose-400" /> },
  { title: 'Video Guides', desc: 'Curated YouTube sheets', path: '/videos', color: 'from-orange-500/10 to-amber-500/10 border-orange-500/20 hover:border-orange-500/35', icon: <VideoGuidesIcon className="w-6 h-6 text-orange-400" /> },
  { title: 'Focus Pomodoro', desc: 'Productive study clock', path: '/pomodoro', color: 'from-cyan-500/10 to-teal-500/10 border-cyan-500/20 hover:border-cyan-500/35', icon: <PomodoroIcon className="w-6 h-6 text-cyan-400" /> },
  { title: 'SMART Goals', desc: 'Configure milestones', path: '/goals', color: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/35', icon: <GoalsIcon className="w-6 h-6 text-emerald-400" /> },
  { title: 'Placement Journal', desc: 'Reflect & log logs', path: '/journal', color: 'from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:border-violet-500/35', icon: <JournalIcon className="w-6 h-6 text-violet-400" /> },
  { title: 'Achievements', desc: 'Gamification badges', path: '/achievements', color: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20 hover:border-yellow-500/35', icon: <AchievementsIcon className="w-6 h-6 text-yellow-400" /> },
  { title: 'Planner Task', desc: 'Track daily checklist', path: '/planner', color: 'from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/35', icon: <PlannerIcon className="w-6 h-6 text-green-400" /> },
  { title: 'Job Tracker', desc: 'Kanban job pipeline', path: '/applications', color: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/20 hover:border-indigo-500/35', icon: <JobTrackerIcon className="w-6 h-6 text-indigo-400" /> },
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
    const apps = readUserData(user.id, 'jobApplications', [])
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
      interviewScore: (readUserData(user.id, 'interviewSessions', []))[0]?.score ?? null,
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
            className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-1.5 text-xs font-bold text-gray-300 transition-all hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-95 cursor-pointer"
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
          <p className="text-xs text-gray-500 text-center font-medium">Overall placement score</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="relative group">
            <StatCard label="Skills Saved" value={summary.skillsCount} delay="delay-100" />
            <button 
              onClick={() => navigate('/skills')}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-bold text-white px-2 py-1 rounded-md border border-white/10 cursor-pointer"
            >
              Edit
            </button>
          </div>
          <StatCard label="Resume Score" value={summary.resumeScore ?? 0} suffix="%" delay="delay-200" />
          <StatCard label="Open Tasks" value={local.openTasks} delay="delay-300" />
          <StatCard label="Applications" value={local.applications} delay="delay-400" />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Module cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Core & Career Guidance Modules</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {moduleCards.map((card, i) => (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                style={{ animationDelay: `${i * 30}ms` }}
                className={`animate-fade-up text-left rounded-2xl border p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer ${card.color}`}
              >
                <span className="mb-2 block">{card.icon}</span>
                <p className="font-bold text-sm text-white">{card.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{card.desc}</p>
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
              <span className="text-xs bg-white/[0.04] border border-white/[0.08] text-white rounded-full px-2.5 py-1 font-semibold">
                🔥 {local.streak}d streak
              </span>
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {local.heatmap.map(({ date, active }) => (
                <div
                  key={date} title={date}
                  className={`aspect-square rounded-sm transition-all ${active ? 'bg-white/40 shadow-sm shadow-white/10' : 'bg-white/[0.04]'}`}
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
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
                    <span className="text-[10px] font-bold text-white bg-white/5 border border-white/10 rounded-full px-2 py-0.5">{item.type}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Interview score */}
          <Panel className="animate-fade-up delay-400">
            <h2 className="font-bold text-sm mb-3">Interview Trend</h2>
            <p className="text-5xl font-black text-white">
              {local.interviewScore === null ? '—' : `${local.interviewScore}%`}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-medium">Latest mock interview score</p>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
