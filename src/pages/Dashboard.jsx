import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { Panel, ProgressRing, StatCard } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'
import { 
  SkillsIcon, ReadinessIcon, ResumeIcon, JdMatchingIcon, 
  AiAdvisorIcon, AiMockCoachIcon, InterviewQsIcon, AptitudeIcon, 
  RoadmapsIcon, CompanyPrepIcon, SalaryIcon, CertificationsIcon, 
  ResourceHubIcon, VideoGuidesIcon, PomodoroIcon, GoalsIcon, 
  JournalIcon, AchievementsIcon, PlannerIcon, JobTrackerIcon,
  SimulatorIcon, TreeIcon
} from '../components/icons'

/* Generate last N days as ISO strings */
function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

function FocusMinutesChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  
  // Fallback if data is empty: last 7 days with zero values
  const chartData = data.length > 0 ? [...data].reverse() : Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { date: d.toISOString().slice(5, 10), minutes: 0 }
  })

  const maxVal = Math.max(...chartData.map(d => d.minutes), 50)
  const width = 450
  const height = 180
  const paddingLeft = 30
  const paddingRight = 10
  const paddingTop = 20
  const paddingBottom = 20

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  // Calculate points
  const points = chartData.map((d, i) => {
    const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth
    const y = paddingTop + chartHeight - (d.minutes / maxVal) * chartHeight
    return { x, y, label: d.date, value: d.minutes }
  })

  // Construct svg path
  let pathD = ""
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      // Create a smooth bezier curve
      const cpX1 = points[i-1].x + (points[i].x - points[i-1].x) / 2
      const cpY1 = points[i-1].y
      const cpX2 = points[i-1].x + (points[i].x - points[i-1].x) / 2
      const cpY2 = points[i].y
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`
    }
  }

  const areaD = pathD ? `${pathD} L ${points[points.length-1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z` : ""

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0"/>
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
        <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={width - paddingRight} y2={paddingTop + chartHeight / 2} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
        <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - 2} textAnchor="middle" fill="#525252" className="text-[9px] font-bold font-mono">
            {p.label}
          </text>
        ))}

        {/* Y Axis Labels */}
        <text x={5} y={paddingTop + 4} fill="#525252" className="text-[9px] font-bold font-mono">{maxVal}m</text>
        <text x={5} y={paddingTop + chartHeight / 2 + 3} fill="#525252" className="text-[9px] font-bold font-mono">{Math.round(maxVal / 2)}m</text>
        <text x={5} y={paddingTop + chartHeight + 3} fill="#525252" className="text-[9px] font-bold font-mono">0m</text>

        {/* Fill Area */}
        {areaD && <path d={areaD} fill="url(#chartGrad)" />}

        {/* Path Line */}
        {pathD && <path d={pathD} fill="none" stroke="#ec4899" strokeWidth={2.5} strokeLinecap="round" className="drop-shadow-[0_2px_8px_rgba(236,72,153,0.3)]" />}

        {/* Interactive Points */}
        {points.map((p, i) => {
          const isHovered = hoveredIdx === i
          return (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
              {isHovered && <circle cx={p.x} cy={p.y} r={8} fill="#ec4899" fillOpacity={0.2} />}
              <circle cx={p.x} cy={p.y} r={isHovered ? 4.5 : 3} fill={isHovered ? '#fff' : '#ec4899'} stroke={isHovered ? '#ec4899' : '#020617'} strokeWidth={1.5} className="transition-all duration-150" />
            </g>
          )
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredIdx !== null && (
        <div 
          className="absolute bg-[#0b1329] border border-white/[0.08] text-[10px] font-black rounded-lg px-2 py-1 shadow-lg text-white font-mono pointer-events-none transition-all duration-100"
          style={{ 
            left: `${(points[hoveredIdx].x / width) * 100}%`, 
            top: `${(points[hoveredIdx].y / height) * 100 - 25}%`,
            transform: 'translateX(-50%)'
          }}
        >
          ⏱️ {points[hoveredIdx].value} min
        </div>
      )}
    </div>
  )
}

function SkillRadarChart({ data = [] }) {
  const size = 180
  const center = size / 2
  const radius = center - 20

  const categories = data.length > 0 ? data : [
    { name: 'Frontend', value: 40 },
    { name: 'Backend', value: 30 },
    { name: 'Database', value: 30 },
    { name: 'DevOps', value: 30 },
    { name: 'Language', value: 50 }
  ]

  const totalPoints = categories.length

  // Generate coordinates for radar polygon
  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / totalPoints) * index - Math.PI / 2
    const distance = (value / 100) * radius
    const x = center + Math.cos(angle) * distance
    const y = center + Math.sin(angle) * distance
    return { x, y }
  }

  // Outer web grids
  const gridScales = [0.25, 0.5, 0.75, 1]
  const webPaths = gridScales.map(scale => {
    const points = Array.from({ length: totalPoints }, (_, i) => {
      const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2
      const x = center + Math.cos(angle) * (radius * scale)
      const y = center + Math.sin(angle) * (radius * scale)
      return `${x},${y}`
    })
    return `M ${points.join(' L ')} Z`
  })

  // Main data polygon path
  const dataPoints = categories.map((c, i) => getCoordinates(i, c.value))
  const dataPath = `M ${dataPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`

  // Spoke lines
  const spokes = Array.from({ length: totalPoints }, (_, i) => {
    const edge = getCoordinates(i, 100)
    return { x1: center, y1: center, x2: edge.x, y2: edge.y }
  })

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id="radarGrad">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
          </radialGradient>
        </defs>

        {/* Webs */}
        {webPaths.map((path, i) => (
          <path key={i} d={path} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
        ))}

        {/* Spokes */}
        {spokes.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
        ))}

        {/* Data area */}
        <path d={dataPath} fill="url(#radarGrad)" stroke="#3b82f6" strokeWidth={1.5} className="drop-shadow-[0_0_6px_rgba(59,130,246,0.3)]" />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#fff" stroke="#3b82f6" strokeWidth={1} />
        ))}

        {/* Labels */}
        {categories.map((c, i) => {
          const edge = getCoordinates(i, 115)
          let anchor = "middle"
          if (edge.x < center - 10) anchor = "end"
          if (edge.x > center + 10) anchor = "start"
          return (
            <text key={i} x={edge.x} y={edge.y + 3} textAnchor={anchor} fill="#525252" className="text-[8px] font-bold uppercase tracking-wider font-sans">
              {c.name}
            </text>
          )
        })}
      </svg>
    </div>
  )
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
  { title: 'Test Simulator', desc: 'Timed mock exam with proctoring', path: '/test-simulator', color: 'from-violet-500/10 to-fuchsia-500/10 border-violet-500/20 hover:border-violet-500/35', icon: <SimulatorIcon className="w-6 h-6 text-violet-400" /> },
  { title: 'Code Sandbox', desc: 'AI code playground & compiler', path: '/code-sandbox', color: 'from-pink-500/10 to-purple-500/10 border-pink-500/20 hover:border-pink-500/35', icon: <SimulatorIcon className="w-6 h-6 text-pink-400" /> },
  { title: 'Career Roadmaps', desc: 'Specialization guides', path: '/roadmaps', color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:border-blue-500/35', icon: <RoadmapsIcon className="w-6 h-6 text-blue-400" /> },
  { title: 'Skill Tree', desc: 'Gamified quest learning map', path: '/skill-tree', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/35', icon: <TreeIcon className="w-6 h-6 text-emerald-400" /> },
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
  const [local, setLocal] = useState({ openTasks: 0, applications: 0, interviewScore: null, heatmap: [], streak: 0, upcoming: [] })
  
  // Analytics States
  const [focusHistory, setFocusHistory] = useState([])
  const [skillBreakdown, setSkillBreakdown] = useState([])

  const [hudMode, setHudMode] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!hudMode) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    
    const resize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890'
    const alphabet = katakana.split('')
    const fontSize = 14
    let columns = canvas.width / fontSize
    let rainDrops = Array.from({ length: Math.ceil(columns) }).map(() => Math.floor(Math.random() * -20))

    const draw = () => {
      if (!ctx || !canvas) return
      ctx.fillStyle = 'rgba(11, 28, 43, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = 'rgba(16, 185, 129, 0.35)' // emerald-500 tint
      ctx.font = fontSize + 'px monospace'

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)]
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize)
        
        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0
        }
        rainDrops[i]++
      }

      // Grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.03)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [hudMode])

  useEffect(() => {
    const fetch = async () => {
      const [
        { data: profile },
        { data: skills },
        { data: resume },
        { data: tasks },
        { data: apps },
        { data: interviews },
        { data: pomos }
      ] = await Promise.all([
        supabase.from('profiles').select('full_name, roles(role_name)').eq('id', user.id).maybeSingle(),
        supabase.from('user_skills').select('id, level, skills(skill_name, category)').eq('user_id', user.id),
        supabase.from('resumes').select('ats_score').eq('user_id', user.id).order('uploaded_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('planner_tasks').select('completed, due_date, title').eq('user_id', user.id),
        supabase.from('job_applications').select('deadline, role, company').eq('user_id', user.id),
        supabase.from('interview_sessions').select('score').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('pomodoro_sessions').select('session_date, minutes_focused').eq('user_id', user.id).order('session_date', { ascending: false }).limit(7)
      ])

      const tasksList = tasks || []
      const appsList = apps || []
      const interviewScore = interviews?.score ?? null

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

      const days = lastNDays(28)
      const completedDates = new Set(tasksList.filter(t => t.completed && t.due_date).map(t => t.due_date))
      const heatmap = days.map(d => ({ date: d, active: completedDates.has(d) }))
      let streak = 0
      for (let i = days.length - 1; i >= 0; i--) {
        if (completedDates.has(days[i])) streak++
        else break
      }
      
      const upcoming = [
        ...tasksList.filter(t => !t.completed && t.due_date).map(t => ({ label: t.title, date: t.due_date, type: 'Task' })),
        ...appsList.filter(a => a.deadline).map(a => ({ label: `${a.role} @ ${a.company}`, date: a.deadline, type: 'Application' })),
      ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4)

      setLocal({
        openTasks: tasksList.filter(t => !t.completed).length,
        applications: appsList.length,
        interviewScore,
        heatmap,
        streak,
        upcoming
      })

      // Process Pomodoro history
      const formattedPomos = (pomos || []).map(p => ({
        date: new Date(p.session_date).toISOString().slice(5, 10),
        minutes: p.minutes_focused || 0
      }))
      setFocusHistory(formattedPomos)

      // Process Skill Breakdown categories
      const scores = { Frontend: 30, Backend: 30, Database: 30, DevOps: 30, Language: 30 }
      if (skills && skills.length > 0) {
        skills.forEach(s => {
          const cat = s.skills?.category
          if (scores[cat] !== undefined) {
            scores[cat] = Math.min(100, scores[cat] + 15)
          }
        })
      }
      setSkillBreakdown(Object.entries(scores).map(([name, value]) => ({ name, value })))

      setLoading(false)
    }
    fetch()
  }, [user.id])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <AppShell 
      title="Career Command Center" 
      subtitle={`${greeting()}${summary.name ? `, ${summary.name}` : ''} 👋 — Track your overall placement readiness and dashboard metrics.`}
      maxWidth="max-w-7xl"
      actions={
        <button 
          onClick={() => setHudMode(!hudMode)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            hudMode 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
              : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] text-gray-300'
          }`}
        >
          {hudMode ? '🟢 HUD Mode Active' : '⚡ Command HUD Mode'}
        </button>
      }
    >
      {/* HUD Background Canvas */}
      {hudMode && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      )}

      {/* Target role banner */}
      <div className="mb-8 p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex justify-between items-center relative z-10 animate-fade-up">
        <div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Active Specialization</span>
          <span className="text-white font-black text-xl tracking-tight">{summary.targetRole}</span>
        </div>
        <button 
          onClick={() => navigate('/profile')} 
          className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2 text-xs font-bold text-gray-300 transition-all hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-95 cursor-pointer"
        >
          Change Target Role
        </button>
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

      {/* Performance Analytics Charts */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 mb-8 animate-fade-up">
          <Panel>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Weekly Focus Minutes</h3>
              <span className="text-[10px] bg-pink-500/15 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded font-mono font-bold">POMODORO TRACKER</span>
            </div>
            <FocusMinutesChart data={focusHistory} />
          </Panel>
          <Panel>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Skill Strength Radar</h3>
              <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-bold">SKILLS STACK</span>
            </div>
            <SkillRadarChart data={skillBreakdown} />
          </Panel>
        </div>
      )}

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
