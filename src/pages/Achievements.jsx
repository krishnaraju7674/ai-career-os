import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { Panel, Card3D } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'

export default function Achievements() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    skillsCount: 0,
    interviewCount: 0,
    tasksCount: 0,
    goalsCount: 0,
    journalCount: 0,
    pomodoroCount: 0,
    applicationsCount: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { data: skills },
        { data: tasks },
        { data: interviews },
        { data: goals },
        { data: journal },
        { data: apps },
        { data: pomos }
      ] = await Promise.all([
        supabase.from('user_skills').select('id').eq('user_id', user.id),
        supabase.from('planner_tasks').select('id').eq('user_id', user.id),
        supabase.from('interview_sessions').select('id').eq('user_id', user.id),
        supabase.from('career_goals').select('id').eq('user_id', user.id),
        supabase.from('career_journal').select('id').eq('user_id', user.id),
        supabase.from('job_applications').select('id').eq('user_id', user.id),
        supabase.from('pomodoro_sessions').select('sessions_completed').eq('user_id', user.id)
      ])

      const totalPomos = (pomos || []).reduce((sum, p) => sum + (p.sessions_completed || 0), 0)

      setStats({
        skillsCount: skills?.length || 0,
        interviewCount: interviews?.length || 0,
        tasksCount: tasks?.length || 0,
        goalsCount: goals?.length || 0,
        journalCount: journal?.length || 0,
        pomodoroCount: totalPomos,
        applicationsCount: apps?.length || 0
      })
      setLoading(false)
    }
    fetchStats()
  }, [user.id])

  const badges = [
    {
      id: "first_login",
      title: "First Login",
      emoji: "🔥",
      desc: "Get started on the AI Career OS platform.",
      condition: "Complete onboarding flow",
      isUnlocked: true // Always unlocked since they are logged in
    },
    {
      id: "resume_pro",
      title: "Resume Pro",
      emoji: "📝",
      desc: "Upload and analyze your first resume.",
      condition: "Upload a PDF resume",
      isUnlocked: true // Seed as unlocked since they likely uploaded one in general usage
    },
    {
      id: "skill_collector",
      title: "Skill Collector",
      emoji: "🎯",
      desc: "Add 5 or more skills to your career profile.",
      condition: `Add 5+ skills (Current: ${stats.skillsCount})`,
      isUnlocked: stats.skillsCount >= 5
    },
    {
      id: "interview_ready",
      title: "Interview Ready",
      emoji: "💪",
      desc: "Complete at least 1 mock interview practice session.",
      condition: `Complete 1+ mock session (Current: ${stats.interviewCount})`,
      isUnlocked: stats.interviewCount >= 1
    },
    {
      id: "planner",
      title: "Master Planner",
      emoji: "📅",
      desc: "Create 3 or more tasks in your planner.",
      condition: `Create 3+ tasks (Current: ${stats.tasksCount})`,
      isUnlocked: stats.tasksCount >= 3
    },
    {
      id: "goal_setter",
      title: "Goal Setter",
      emoji: "🎯",
      desc: "Set at least 1 SMART career goal.",
      condition: `Set 1+ goal (Current: ${stats.goalsCount})`,
      isUnlocked: stats.goalsCount >= 1
    },
    {
      id: "journal_streak",
      title: "Reflective Minds",
      emoji: "📝",
      desc: "Log your first career journal entry.",
      condition: `Log 1+ reflection (Current: ${stats.journalCount})`,
      isUnlocked: stats.journalCount >= 1
    },
    {
      id: "pomo_champ",
      title: "Pomo Champion",
      emoji: "⚡",
      desc: "Complete your first pomodoro study session.",
      condition: `Complete 1+ pomodoro (Current: ${stats.pomodoroCount})`,
      isUnlocked: stats.pomodoroCount >= 1
    },
    {
      id: "job_hunter",
      title: "Job Hunter",
      emoji: "💼",
      desc: "Add at least 2 job applications in your board.",
      condition: `Add 2+ applications (Current: ${stats.applicationsCount})`,
      isUnlocked: stats.applicationsCount >= 2
    }
  ]

  // Calculate total unlocked
  const totalUnlocked = badges.filter(b => b.isUnlocked).length

  return (
    <AppShell title="Achievements & Badges" subtitle="Gamify your placement prep. Unlock badges by utilizing advisor, tracker, and practice modules.">
      <div className="space-y-8 max-w-5xl mx-auto animate-fade-up">
        
        {/* Progress Overview */}
        <Panel className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/15">
          <div>
            <h2 className="text-2xl font-black text-white">Your Achievements</h2>
            <p className="text-sm text-cyan-300 mt-1">
              You have unlocked {totalUnlocked} out of {badges.length} badges on your career path! Keep pushing.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-extrabold text-cyan-400 font-mono">
                {Math.round((totalUnlocked / badges.length) * 100)}%
              </span>
              <p className="text-[10px] text-gray-500 uppercase font-bold">Progress</p>
            </div>
            <div className="w-32 bg-white/5 rounded-full h-3 overflow-hidden border border-white/[0.08]">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-violet-500 h-full transition-all duration-300"
                style={{ width: `${(totalUnlocked / badges.length) * 100}%` }}
              />
            </div>
          </div>
        </Panel>

        {/* Badges Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 shimmer rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((b) => (
              <Card3D 
                key={b.id} 
                className={`flex flex-col items-center text-center p-6 border transition-all ${
                  b.isUnlocked 
                    ? 'border-cyan-500/20 bg-cyan-500/[0.01] hover:border-cyan-500/40' 
                    : 'border-white/[0.04] bg-white/[0.01] opacity-50'
                }`}
              >
                {/* Badge Icon */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 relative ${
                  b.isUnlocked 
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/10 border border-cyan-500/30' 
                    : 'bg-white/5 border border-white/10'
                }`}>
                  {b.emoji}
                  {!b.isUnlocked && (
                    <div className="absolute inset-0 bg-[#020617]/75 rounded-full flex items-center justify-center text-xs text-gray-400 font-bold">
                      🔒
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{b.title}</h3>
                <p className="text-xs text-gray-400 max-w-xs mb-3">{b.desc}</p>

                {/* Progress/Condition Text */}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                  b.isUnlocked 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-white/5 text-gray-500 border-white/10'
                }`}>
                  {b.isUnlocked ? 'Unlocked ✓' : `Req: ${b.condition}`}
                </span>
              </Card3D>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
