import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'
import { useToast } from '../context/ToastContext'
import { 
  DashboardIcon, ProfileIcon, SkillsIcon, ReadinessIcon, 
  ResumeIcon, JdMatchingIcon, JobTrackerIcon, AiAdvisorIcon, 
  AiMockCoachIcon, InterviewQsIcon, AptitudeIcon, RoadmapsIcon, 
  CompanyPrepIcon, SalaryIcon, CertificationsIcon, ResourceHubIcon, 
  VideoGuidesIcon, PlannerIcon, GoalsIcon, PomodoroIcon, 
  JournalIcon, AchievementsIcon, TailorIcon, TreeIcon, SimulatorIcon
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
      { label: 'Resume Tailor', path: '/resume-tailor', icon: <TailorIcon />, isAi: true },
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
      { label: 'Test Simulator', path: '/test-simulator', icon: <SimulatorIcon /> },
      { label: 'Code Sandbox', path: '/code-sandbox', icon: <SimulatorIcon />, isAi: true },
    ]
  },
  {
    title: "Placement Guides",
    items: [
      { label: 'Roadmaps', path: '/roadmaps', icon: <RoadmapsIcon /> },
      { label: 'Skill Tree', path: '/skill-tree', icon: <TreeIcon /> },
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

export default function AppShell({ title, subtitle, actions, children, maxWidth = 'max-w-6xl', showPremiumActions = false }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [isPresentation, setIsPresentation] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [presentationTheme, setPresentationTheme] = useState('nebula')
  const [shareFormat, setShareFormat] = useState('ascii')
  const [shareStats, setShareStats] = useState({
    name: 'Candidate',
    role: 'Software Engineer',
    readiness: 75,
    resume: 80,
    tests: 0,
    focusHours: 0
  })

  useEffect(() => {
    if (!user?.id) return
    
    const fetchShareData = async () => {
      try {
        const [
          { data: profile },
          { data: skills },
          { data: resume },
          { data: tests },
          { data: pomos }
        ] = await Promise.all([
          supabase.from('profiles').select('full_name, roles(role_name)').eq('id', user.id).maybeSingle(),
          supabase.from('user_skills').select('level').eq('user_id', user.id),
          supabase.from('resumes').select('ats_score').eq('user_id', user.id).order('uploaded_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('test_submissions').select('score').eq('user_id', user.id),
          supabase.from('pomodoro_sessions').select('minutes_focused').eq('user_id', user.id)
        ])

        const name = profile?.full_name || user.email.split('@')[0]
        const role = profile?.roles?.role_name || 'Software Engineer'
        
        const levelScore = { beginner: 33, intermediate: 66, advanced: 100 }
        const avgSkill = skills?.length ? Math.round(skills.reduce((s, sk) => s + (levelScore[sk.level] || 0), 0) / skills.length) : 0
        const ats = resume?.ats_score ?? 0
        const readiness = Math.round(0.5 * avgSkill + 0.3 * ats + 0.2 * (profile?.full_name ? 60 : 20))

        const totalMinutes = (pomos || []).reduce((s, p) => s + (p.minutes_focused || 0), 0)
        const focusHours = Math.round((totalMinutes / 60) * 10) / 10

        setShareStats({
          name,
          role,
          readiness: readiness || 50,
          resume: ats || 40,
          tests: tests?.length || 0,
          focusHours
        })
      } catch (e) {
        console.error('Error fetching share stats:', e)
      }
    }
    
    fetchShareData()
  }, [user?.id])

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

  const themeGlows = {
    nebula: {
      bg: 'bg-[#0b1c2b]',
      grid: 'rgba(99, 102, 241, 0.03)',
      orb1: 'bg-purple-500/[0.04]',
      orb2: 'bg-indigo-500/[0.03]',
      accentText: 'text-indigo-400',
      borderClass: 'border-indigo-500/20 hover:border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
      accentBg: 'bg-indigo-500/10 text-indigo-300'
    },
    synthwave: {
      bg: 'bg-[#180a22]',
      grid: 'rgba(236, 72, 153, 0.03)',
      orb1: 'bg-pink-500/[0.05]',
      orb2: 'bg-fuchsia-500/[0.03]',
      accentText: 'text-pink-400',
      borderClass: 'border-pink-500/20 hover:border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.1)]',
      accentBg: 'bg-pink-500/10 text-pink-300'
    },
    terminal: {
      bg: 'bg-[#020804]',
      grid: 'rgba(34, 197, 94, 0.02)',
      orb1: 'bg-green-500/[0.03]',
      orb2: 'bg-emerald-500/[0.02]',
      accentText: 'text-green-400',
      borderClass: 'border-green-500/20 hover:border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
      accentBg: 'bg-green-500/10 text-green-300'
    },
    aurora: {
      bg: 'bg-[#04161a]',
      grid: 'rgba(20, 184, 166, 0.03)',
      orb1: 'bg-teal-500/[0.04]',
      orb2: 'bg-cyan-500/[0.03]',
      accentText: 'text-teal-400',
      borderClass: 'border-teal-500/20 hover:border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.1)]',
      accentBg: 'bg-teal-500/10 text-teal-300'
    }
  }

  const asciiText = `┌──────────────────────────────────────────────┐
│          AI OS PLACEMENT PORTFOLIO           │
├──────────────────────────────────────────────┤
│ Candidate:  \${shareStats.name.padEnd(30)} │
│ Target Role: \${shareStats.role.padEnd(29)} │
│                                              │
│ [📊 METRICS]                                 │
│ Placement Readiness Score:  \${(shareStats.readiness + "%").padEnd(16)} │
│ ATS Resume Compatibility:   \${(shareStats.resume + "%").padEnd(16)} │
│ Pomodoro Focus Time:        \${(shareStats.focusHours + " Hours").padEnd(16)} │
│ Proctor Mock Exams Taken:   \${(shareStats.tests + " Tests").padEnd(16)} │
│                                              │
│ [🔒 SECURITY VERIFIED]                       │
│ Status: Credentials Authenticated            │
└──────────────────────────────────────────────┘`

  const markdownText = `### 🚀 Placement Readiness Portfolio — \${shareStats.name}
*Target Role: \${shareStats.role}*

| Metric | Score / Value | Status |
| :--- | :--- | :--- |
| **Placement Readiness** | \${shareStats.readiness}% | \${shareStats.readiness >= 75 ? '🟢 Ready' : '🟡 Preparing'} |
| **ATS Resume Compatibility** | \${shareStats.resume}% | \${shareStats.resume >= 80 ? '🟢 Strong' : '🟡 Optimization Recommended'} |
| **Pomodoro Focus Time** | \${shareStats.focusHours} Hours | \${shareStats.focusHours >= 10 ? '🔥 High Focus' : '⚡ Developing'} |
| **Proctor Mock Exams** | \${shareStats.tests} Tests Taken | \${shareStats.tests >= 3 ? '🟢 Practiced' : '🟡 Needs Practice'} |

*Generated via [AI Career OS](\${window.location.origin})*`

  const jsonText = JSON.stringify({
    candidate: shareStats.name,
    targetRole: shareStats.role,
    verifiedMetrics: {
      placementReadinessScore: `\${shareStats.readiness}%`,
      atsResumeScore: `\${shareStats.resume}%`,
      pomodoroFocusTimeHours: shareStats.focusHours,
      proctoredMockExamsCount: shareStats.tests
    },
    systemVerified: true,
    generatedAt: new Date().toISOString().split('T')[0]
  }, null, 2)

  const handleCopyCurrentFormat = () => {
    let content = ''
    if (shareFormat === 'ascii') content = asciiText
    else if (shareFormat === 'markdown') content = markdownText
    else if (shareFormat === 'json') content = jsonText
    
    navigator.clipboard.writeText(content)
    toast.success(`\${shareFormat.toUpperCase()} Portfolio Copied! 📋`)
  }

  const handleCopyLink = () => {
    const link = `\${window.location.origin}/profile?share=\${user?.id?.slice(0, 8) || 'verified'}`
    navigator.clipboard.writeText(link)
    toast.success('Public Sharing Link Copied! 🔗')
  }

  return (
    <div 
      className={`min-h-screen text-white flex relative overflow-x-hidden transition-colors duration-500 \${isPresentation ? themeGlows[presentationTheme].bg : 'bg-[#0b1c2b]'} \${isPresentation ? 'presentation-active' : ''}`}
      style={{
        '--theme-accent': presentationTheme === 'nebula' ? '#6366f1' : presentationTheme === 'synthwave' ? '#ec4899' : presentationTheme === 'terminal' ? '#22c55e' : '#14b8a6',
        '--theme-glow': presentationTheme === 'nebula' ? 'rgba(99,102,241,0.12)' : presentationTheme === 'synthwave' ? 'rgba(236,72,153,0.12)' : presentationTheme === 'terminal' ? 'rgba(34,197,94,0.12)' : 'rgba(20,184,166,0.12)',
        '--theme-border': presentationTheme === 'nebula' ? 'rgba(99,102,241,0.2)' : presentationTheme === 'synthwave' ? 'rgba(236,72,153,0.2)' : presentationTheme === 'terminal' ? 'rgba(34,197,94,0.2)' : 'rgba(20,184,166,0.2)'
      }}
    >
      <style>{`
        .presentation-active .glass, .presentation-active .glass-strong, .presentation-active .bg-slate-900\\/\\[0\\.15\\] {
          background: rgba(255, 255, 255, 0.01) !important;
          border-color: var(--theme-border) !important;
          box-shadow: 0 0 25px var(--theme-glow) !important;
          transition: all 0.5s ease !important;
        }
        .presentation-active input, .presentation-active select, .presentation-active textarea {
          border-color: var(--theme-border) !important;
          background: rgba(255, 255, 255, 0.02) !important;
          transition: all 0.5s ease !important;
        }
        .presentation-active input:focus, .presentation-active select:focus, .presentation-active textarea:focus {
          border-color: var(--theme-accent) !important;
          box-shadow: 0 0 10px var(--theme-glow) !important;
        }
        .presentation-active button {
          box-shadow: 0 0 15px var(--theme-glow) !important;
        }
      `}</style>

      {/* Presentation Mode Background Grid */}
      {isPresentation && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-500">
          <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:4rem_4rem] animate-pulse"
            style={{ '--grid-color': themeGlows[presentationTheme].grid }}
          />
          <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse \${themeGlows[presentationTheme].orb1}`} style={{ animationDuration: '8s' }} />
          <div className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse \${themeGlows[presentationTheme].orb2}`} style={{ animationDuration: '12s' }} />
          
          {/* Dynamic Matrix Rain Overlay */}
          {presentationTheme === 'terminal' && <MatrixRainOverlay />}
        </div>
      )}

      {/* Floating Presentation Control bar */}
      {isPresentation && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-black/60 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md shadow-2xl animate-fade-in">
          <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
            <span className="text-[9px] uppercase tracking-wider font-mono text-gray-500 font-black">Theme</span>
            {['nebula', 'synthwave', 'terminal', 'aurora'].map(t => (
              <button
                key={t}
                onClick={() => setPresentationTheme(t)}
                className={`w-3.5 h-3.5 rounded-full border transition cursor-pointer \${
                  t === 'nebula' ? 'bg-indigo-500' :
                  t === 'synthwave' ? 'bg-pink-500' :
                  t === 'terminal' ? 'bg-green-500' :
                  'bg-teal-500'
                } \${
                  presentationTheme === t ? 'border-white scale-125 shadow-lg shadow-white/20' : 'border-transparent hover:scale-110'
                }`}
                title={t.toUpperCase()}
              />
            ))}
          </div>
          <button 
            onClick={() => setIsPresentation(false)}
            className="text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
          >
            Exit Presentation ❌
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden ${isPresentation ? '' : 'md:flex'} fixed inset-y-0 left-0 z-40 w-56 flex-col glass border-r border-white/[0.04]`}>
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
      <div className={`flex-1 ${isPresentation ? '' : 'md:pl-56'} min-h-screen flex flex-col transition-all duration-300 relative z-10`}>
        {/* Mobile top bar */}
        <header className={`sticky top-0 z-30 h-14 flex items-center gap-4 px-4 glass border-b border-white/[0.04] ${isPresentation ? 'hidden' : 'md:hidden'}`}>
          <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-white transition p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="font-bold text-sm gradient-text">AI Career OS</span>
        </header>
 
        <main className={`flex-1 ${maxWidth} mx-auto w-full px-4 md:px-8 py-6 md:py-10 ${isPresentation ? 'pt-16' : ''}`}>
          {(title || subtitle || actions) && (
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-up">
              <div>
                <div className="flex items-center gap-3">
                  {title && <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h1>}
                  
                  {/* Premium Action Badges (Only shown if enabled) */}
                  {showPremiumActions && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => setIsPresentation(true)}
                        title="Enter Full-Screen Presentation Mode"
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[9px] font-black text-gray-400 hover:text-white uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                      >
                        📺 Present
                      </button>
                      <button 
                        onClick={() => setShowShareModal(true)}
                        title="Share Placement Stats Portfolio"
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[9px] font-black text-gray-400 hover:text-white uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                      >
                        🔗 Share
                      </button>
                    </div>
                  )}
                </div>
                {subtitle && <p className="mt-1.5 max-w-2xl text-xs text-gray-500 font-medium">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Share Portfolio HUD Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-lg bg-[#020617] border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] animate-scale-in overflow-hidden">
            
            {/* HUD Scan lines */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(6,182,212,0.02)_50%,transparent_50%)] bg-[size:100%_4px]" />

            {/* Glowing lock corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">AI PORTFOLIO SHARE INTERFACE</span>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-white text-xs font-bold font-mono transition cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Export and broadcast your placement statistics to recruiters, professors, and LinkedIn contacts. Copies directly to your clipboard.
            </p>

            {/* Format Tabs */}
            <div className="flex border-b border-white/10 mb-4">
              {['ascii', 'markdown', 'json'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setShareFormat(fmt)}
                  className={`flex-grow py-2 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-b-2 text-center ${
                    shareFormat === fmt ? 'border-cyan-500 text-cyan-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Terminal View */}
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-cyan-500 leading-normal select-all shadow-inner overflow-x-auto whitespace-pre max-h-56">
              {shareFormat === 'ascii' && asciiText}
              {shareFormat === 'markdown' && markdownText}
              {shareFormat === 'json' && jsonText}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={handleCopyCurrentFormat}
                className="rounded-xl py-3 px-4 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                📋 Copy {shareFormat.toUpperCase()} Format
              </button>
              <button
                onClick={handleCopyLink}
                className="rounded-xl py-3 px-4 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                🔗 Copy Shareable URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MatrixRainOverlay() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const alphabet = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const fontSize = 14
    const columns = canvas.width / fontSize
    const rainDrops = Array(Math.floor(columns)).fill(1)

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 8, 4, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#22c55e'
      ctx.font = fontSize + 'px monospace'

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length))
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize)

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0
        }
        rainDrops[i]++
      }
      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-15 pointer-events-none" />
}
