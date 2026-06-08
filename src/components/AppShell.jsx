import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'

const navSections = [
  {
    title: "Core Modules",
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Profile', path: '/profile', icon: '👤' },
      { label: 'Skills Tracker', path: '/skills', icon: '⚡' },
      { label: 'Readiness Score', path: '/readiness', icon: '📈' },
      { label: 'Resume Review', path: '/resume', icon: '📄' },
      { label: 'JD Matching', path: '/jd-analyzer', icon: '🔍' },
      { label: 'Job Tracker', path: '/applications', icon: '💼' },
    ]
  },
  {
    title: "AI & Practice",
    items: [
      { label: 'AI Advisor', path: '/advisor', icon: '✨', isAi: true },
      { label: 'AI Mock Coach', path: '/mock-interview', icon: '🤖', isAi: true },
      { label: 'Interview Qs', path: '/interview', icon: '🎙️' },
      { label: 'Aptitude Test', path: '/aptitude', icon: '🧩' },
    ]
  },
  {
    title: "Placement Guides",
    items: [
      { label: 'Roadmaps', path: '/roadmaps', icon: '🗺️' },
      { label: 'Company Prep', path: '/company-prep', icon: '🏢' },
      { label: 'Salary Insights', path: '/salary-insights', icon: '💰' },
      { label: 'Certifications', path: '/certifications', icon: '🎓' },
      { label: 'Resource Hub', path: '/resources', icon: '📚' },
      { label: 'Video Guides', path: '/videos', icon: '🎬' },
    ]
  },
  {
    title: "Productivity",
    items: [
      { label: 'Planner Tasks', path: '/planner', icon: '📅' },
      { label: 'SMART Goals', path: '/goals', icon: '🎯' },
      { label: 'Focus Pomodoro', path: '/pomodoro', icon: '⏱️' },
      { label: 'Placement Journal', path: '/journal', icon: '📝' },
      { label: 'Achievements', path: '/achievements', icon: '🏆' },
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
    <div className="flex flex-col h-full bg-[#020617]">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06] shrink-0">
        <button onClick={() => { navigate('/dashboard'); setOpen(false) }} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-all">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="font-extrabold text-sm text-white tracking-wide">AI Career OS</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">
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
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
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
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
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
      <div className="p-3 border-t border-white/[0.06] bg-[#020617] shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-md shadow-cyan-500/20">
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
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-56 flex-col glass border-r border-white/[0.06]">
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
        <header className="sticky top-0 z-30 h-14 flex items-center gap-4 px-4 glass border-b border-white/[0.06] md:hidden">
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
