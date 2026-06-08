import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'
import { 
  DashboardIcon, ProfileIcon, SkillsIcon, ReadinessIcon, 
  ResumeIcon, JdMatchingIcon, JobTrackerIcon, AiAdvisorIcon, 
  AiMockCoachIcon, InterviewQsIcon, AptitudeIcon, RoadmapsIcon, 
  CompanyPrepIcon, SalaryIcon, CertificationsIcon, ResourceHubIcon, 
  VideoGuidesIcon, PlannerIcon, GoalsIcon, PomodoroIcon, 
  JournalIcon, AchievementsIcon 
} from './icons'

const navSections = [
  {
    title: "Core Modules",
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
      { label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
      { label: 'Skills Tracker', path: '/skills', icon: <SkillsIcon /> },
      { label: 'Readiness Score', path: '/readiness', icon: <ReadinessIcon /> },
      { label: 'Resume Review', path: '/resume', icon: <ResumeIcon /> },
      { label: 'JD Matching', path: '/jd-analyzer', icon: <JdMatchingIcon /> },
      { label: 'Job Tracker', path: '/applications', icon: <JobTrackerIcon /> },
    ]
  },
  {
    title: "AI & Practice",
    items: [
      { label: 'AI Advisor', path: '/advisor', icon: <AiAdvisorIcon />, isAi: true },
      { label: 'AI Mock Coach', path: '/mock-interview', icon: <AiMockCoachIcon />, isAi: true },
      { label: 'Interview Qs', path: '/interview', icon: <InterviewQsIcon /> },
      { label: 'Aptitude Test', path: '/aptitude', icon: <AptitudeIcon /> },
    ]
  },
  {
    title: "Placement Guides",
    items: [
      { label: 'Roadmaps', path: '/roadmaps', icon: <RoadmapsIcon /> },
      { label: 'Company Prep', path: '/company-prep', icon: <CompanyPrepIcon /> },
      { label: 'Salary Insights', path: '/salary-insights', icon: <SalaryIcon /> },
      { label: 'Certifications', path: '/certifications', icon: <CertificationsIcon /> },
      { label: 'Resource Hub', path: '/resources', icon: <ResourceHubIcon /> },
      { label: 'Video Guides', path: '/videos', icon: <VideoGuidesIcon /> },
    ]
  },
  {
    title: "Productivity",
    items: [
      { label: 'Planner Tasks', path: '/planner', icon: <PlannerIcon /> },
      { label: 'SMART Goals', path: '/goals', icon: <GoalsIcon /> },
      { label: 'Focus Pomodoro', path: '/pomodoro', icon: <PomodoroIcon /> },
      { label: 'Placement Journal', path: '/journal', icon: <JournalIcon /> },
      { label: 'Achievements', path: '/achievements', icon: <AchievementsIcon /> },
    ]
  }
]

export default function AppShell({ title, subtitle, actions, children, maxWidth = 'max-w-6xl' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const initials = (user?.email || 'U').slice(0, 2).toUpperCase()

  const sidebarMarkup = (
    <div className="flex flex-col h-full bg-[#0b1c2b] border-r border-white/[0.04]">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.04] shrink-0">
        <button onClick={() => { navigate('/'); setOpen(false) }} className="flex items-center gap-3 group">
          <div 
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-2xl tracking-tight text-white cursor-pointer select-none font-bold"
          >
            AI Career OS
          </div>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-white/10 text-white shadow-sm border border-white/10'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="text-base shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                      {item.isAi && (
                        <span className={`ml-auto text-[8px] font-black uppercase px-1.5 py-0.5 rounded border transition-colors ${
                          isActive 
                            ? 'bg-white/20 text-white border-white/30' 
                            : 'bg-white/5 text-gray-500 border-white/10 group-hover:text-gray-400 group-hover:border-white/20'
                        }`}>
                          AI
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/[0.04] bg-[#0b1c2b] shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.02] transition group">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0 text-white border border-white/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 truncate font-semibold">{user?.email}</p>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0b1c2b] text-white flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-56 flex-col glass border-r border-white/[0.04]">
        {sidebarMarkup}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <aside className="relative w-64 flex flex-col glass-strong border-r border-white/[0.1] animate-slide-left">
            {sidebarMarkup}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:pl-56 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center gap-4 px-4 glass border-b border-white/[0.04] md:hidden">
          <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-white transition p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="font-bold text-sm gradient-text">AI Career OS</span>
        </header>

        <main className={`flex-1 ${maxWidth} mx-auto w-full px-4 md:px-8 py-6 md:py-10`}>
          {(title || subtitle || actions) && (
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-up">
              <div>
                {title && <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h1>}
                {subtitle && <p className="mt-1.5 max-w-2xl text-xs text-gray-500 font-medium">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
